import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import { motorService } from "../../services/motorService";

export default function ModalMotor({
  open,
  onClose,
  modo,
  motorSeleccionado,
  idBomba,
  onSaveSuccess,
}) {
  const [formData, setFormData] = useState({
    codigo_motor: "",
    marca_motor: "",
    tipo_motor: "",
    tipo_corriente: 1,
    mono_tri: 1,
    asin_sin: 0,
    universal: 0,
    soporte_tec: 1,
    num_fases: 3,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      // 🌟 Envolvemos la actualización del estado en el setTimeout
      setTimeout(() => {
        if (modo === "edit" && motorSeleccionado) {
          setFormData({
            codigo_motor: motorSeleccionado.codigo_motor || "",
            marca_motor: motorSeleccionado.marca_motor || "",
            tipo_motor: motorSeleccionado.tipo_motor || "",
            tipo_corriente: motorSeleccionado.tipo_corriente ?? 1,
            mono_tri: motorSeleccionado.mono_tri ?? 1,
            asin_sin: motorSeleccionado.asin_sin ?? 0,
            universal: motorSeleccionado.universal ?? 0,
            soporte_tec: motorSeleccionado.soporte_tec ?? 1,
            num_fases: motorSeleccionado.num_fases ?? 3,
          });
        } else {
          // Reset para nuevo motor
          setFormData({
            codigo_motor: "",
            marca_motor: "",
            tipo_motor: "Inducción",
            tipo_corriente: 1,
            mono_tri: 1,
            asin_sin: 0,
            universal: 0,
            soporte_tec: 1,
            num_fases: 3,
          });
        }
      }, 0);
    }
  }, [open, modo, motorSeleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modo === "add") {
        await motorService.addMotor(idBomba, formData);
        Swal.fire({
          icon: "success",
          title: "¡Motor Acoplado!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await motorService.updateMotor(motorSeleccionado.id_motor, formData);
        Swal.fire({
          icon: "success",
          title: "¡Motor Actualizado!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSaveSuccess();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Ocurrió un problema.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "#f8fafc",
          color: "primary.dark",
          fontWeight: "bold",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {modo === "add"
          ? "⚙️ Acoplar Nuevo Motor Eléctrico"
          : "✏️ Modificar Motor Eléctrico"}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3, bgcolor: "#f1f5f9" }}>
          <Grid container spacing={2}>
            {/* Identificación */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary">
                Datos de Identificación
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Código"
                name="codigo_motor"
                value={formData.codigo_motor}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Marca"
                name="marca_motor"
                value={formData.marca_motor}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Tipo"
                name="tipo_motor"
                value={formData.tipo_motor}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Electricidad */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary">
                Especificaciones Eléctricas
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Corriente"
                name="tipo_corriente"
                value={formData.tipo_corriente}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value={1}>Alterna (CA)</MenuItem>
                <MenuItem value={0}>Continua (CC)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Fases (Mono/Tri)"
                name="mono_tri"
                value={formData.mono_tri}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value={0}>Monofásico (0)</MenuItem>
                <MenuItem value={1}>Trifásico (1)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Cantidad de Fases"
                name="num_fases"
                value={formData.num_fases}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Características */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary">
                Características y Soporte
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Sincronismo"
                name="asin_sin"
                value={formData.asin_sin}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value={0}>Asíncrono (0)</MenuItem>
                <MenuItem value={1}>Síncrono (1)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Universal"
                name="universal"
                value={formData.universal}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value={0}>No (0)</MenuItem>
                <MenuItem value={1}>Sí (1)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Soporte Téc."
                name="soporte_tec"
                value={formData.soporte_tec}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value={0}>No (0)</MenuItem>
                <MenuItem value={1}>Sí (1)</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#f8fafc" }}>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancelar
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={submitting}
          >
            Guardar Motor
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
