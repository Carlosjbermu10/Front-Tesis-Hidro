import { useState } from "react";
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

export const ModalOrdenMantenimiento = ({
  open,
  handleClose,
  tipo_equipo,
  equipo_id,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    tipo_mantenimiento: "PREVENTIVO",
    criticidad: "MEDIA",
    fecha_programada: new Date().toISOString().split("T")[0],
    descripcion_falla: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.descripcion_falla.trim()) {
      setErrorMessage(
        "Por favor, ingrese un diagnóstico o descripción del trabajo.",
      );
      return;
    }

    const payload = {
      ...form,
      tipo_equipo,
      equipo_id: parseInt(equipo_id, 10),
    };

    try {
      const res = await mantenimientoService.addOrdenMantenimiento(payload);
      if (res.status === "ok") {
        onSuccess(); // Función callback para recargar la tabla principal
        handleClose(); // Cerrar el modal
        setForm({
          tipo_mantenimiento: "PREVENTIVO",
          criticidad: "MEDIA",
          fecha_programada: new Date().toISOString().split("T")[0],
          descripcion_falla: "",
        });
      } else {
        setErrorMessage(
          res.description || "Ocurrió un error al registrar la orden.",
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
        Programar Orden de Mantenimiento
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
                label="Tipo de Mantenimiento"
                name="tipo_mantenimiento"
                value={form.tipo_mantenimiento}
                onChange={handleChange}
              >
                <MenuItem value="PREVENTIVO">Preventivo (Rutina)</MenuItem>
                <MenuItem value="CORRECTIVO">Correctivo (Falla)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Criticidad / Prioridad"
                name="criticidad"
                value={form.criticidad}
                onChange={handleChange}
              >
                <MenuItem value="BAJA">Baja</MenuItem>
                <MenuItem value="MEDIA">Media</MenuItem>
                <MenuItem value="ALTA">Alta</MenuItem>
                <MenuItem value="CRITICA">Crítica</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Ejecución Programada"
                name="fecha_programada"
                value={form.fecha_programada}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descripción detallada de la falla o requerimiento técnico"
                name="descripcion_falla"
                value={form.descripcion_falla}
                onChange={handleChange}
                placeholder="Ej: Vibraciones anómalas detectadas en el acople elástico..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Registrar Orden
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
