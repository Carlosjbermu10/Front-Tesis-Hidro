// src/pages/ModalEditarMantenimiento.jsx
import { useState } from "react"; // 💡 Ya no necesitamos useEffect
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
} from "@mui/material";
import { mantenimientoService } from "../../services/mantenimientoService.js";

export const ModalEditarMantenimiento = ({
  open,
  handleClose,
  orden,
  onSuccess,
}) => {
  // 💡 1. Inicializamos el estado directamente leyendo la prop "orden"
  const [form, setForm] = useState({
    estado: orden?.estado || "EN_PROGRESO",
    fecha_ejecucion: orden?.fecha_ejecucion
      ? new Date(orden.fecha_ejecucion).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    trabajo_realizado: orden?.trabajo_realizado || "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  // 💡 2. ¡ELIMINAMOS EL useEffect POR COMPLETO! Adiós al error del linter.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (form.estado === "COMPLETADO" && !form.trabajo_realizado.trim()) {
      setErrorMessage(
        "Si el estado es Completado, debe describir el trabajo realizado.",
      );
      return;
    }

    try {
      const res = await mantenimientoService.updateEstadoMantenimiento(
        orden.id_orden,
        form,
      );
      if (res && res.status === "ok") {
        onSuccess();
        handleClose();
      } else {
        setErrorMessage(
          res.description || "Ocurrió un error al actualizar la orden.",
        );
      }
    } catch (err) {
      console.log(err);
      setErrorMessage("Error de conexión con el servidor backend.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        Actualizar Orden #{orden?.id_orden}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Estado de la Orden"
                name="estado"
                value={form.estado}
                onChange={handleChange}
              >
                <MenuItem value="PROGRAMADO">Programado</MenuItem>
                <MenuItem value="EN_PROGRESO">En Progreso</MenuItem>
                <MenuItem value="COMPLETADO">Completado</MenuItem>
                <MenuItem value="CANCELADO">Cancelado</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Ejecución"
                name="fecha_ejecucion"
                value={form.fecha_ejecucion}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descripción del Trabajo Realizado"
                name="trabajo_realizado"
                value={form.trabajo_realizado}
                onChange={handleChange}
                placeholder="Ej: Se reemplazaron los rodamientos y se aplicó grasa..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
