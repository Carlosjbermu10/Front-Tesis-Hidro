// ModalLineaBombeo.jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
} from "@mui/material";
import Swal from "sweetalert2";
import { lineaBombeoService } from "../../services/lineaBombeoService";

export default function ModalLineaBombeo({
  open,
  onClose,
  modo, // 'add' o 'edit'
  lineaSeleccionada, // Datos de la línea si es 'edit'
  idEstacion,
  onSaveSuccess,
}) {
  const [formData, setFormData] = useState({
    numero_linea: "",
    nombre_linea_bombeo: "",
    estado_linea_bombeo: "ACTIVA",
    observaciones_linea_bombeo: "",
  });

  useEffect(() => {
    if (open) {
      const temporizador = setTimeout(() => {
        setFormData({
          numero_linea:
            modo === "edit" ? lineaSeleccionada?.numero_linea || "" : "",
          nombre_linea_bombeo:
            modo === "edit" ? lineaSeleccionada?.nombre_linea_bombeo || "" : "",
          estado_linea_bombeo:
            modo === "edit"
              ? lineaSeleccionada?.estado_linea_bombeo || "ACTIVA"
              : "ACTIVA",
          observaciones_linea_bombeo:
            modo === "edit"
              ? lineaSeleccionada?.observaciones_linea_bombeo || ""
              : "",
        });
      }, 0); // Al ser 0ms, se ejecuta inmediatamente después de que el modal se dibuja

      return () => clearTimeout(temporizador);
    }
  }, [open, modo, lineaSeleccionada]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modo === "add") {
        await lineaBombeoService.addLineaBombeo(idEstacion, formData);
        Swal.fire({
          icon: "success",
          title: "¡Registrado!",
          text: "Línea de bombeo creada exitosamente.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await lineaBombeoService.updateLineaBombeo(
          lineaSeleccionada.id_linea_bombeo,
          formData,
        );
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "Línea de bombeo modificada con éxito.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error("Error en operación:", error);
      // 1. Extraemos el título y la descripción devueltos por el backend
      const errorTitle = error.response?.data?.title || "Error en la Solicitud";
      const errorMessage =
        error.response?.data?.description ||
        error.response?.data?.message ||
        "No se pudo procesar la solicitud. Inténtelo de nuevo.";

      // 2. Desplegamos la alerta de SweetAlert2
      Swal.fire({
        icon: "error",
        title: errorTitle,
        text: errorMessage,
        confirmButtonColor: "#0284c7",
        confirmButtonText: "Entendido",
        // Mantiene la alerta por encima del modal activo
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary">
          {modo === "add"
            ? "➕ Registrar Línea de Bombeo"
            : "✏️ Modificar Línea de Bombeo"}
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, bgcolor: "#f1f5f9" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Nº de Línea"
                type="number"
                name="numero_linea"
                value={formData.numero_linea}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: 1 }}
                sx={{ bgcolor: "#ffffff" }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth required sx={{ bgcolor: "#ffffff" }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado_linea_bombeo"
                  value={formData.estado_linea_bombeo}
                  label="Estado"
                  onChange={handleChange}
                >
                  <MenuItem value="ACTIVA">ACTIVA</MenuItem>
                  <MenuItem value="INACTIVA">INACTIVA</MenuItem>
                  <MenuItem value="MANTENIMIENTO">EN MANTENIMIENTO</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Nombre de la Línea"
                name="nombre_linea_bombeo"
                value={formData.nombre_linea_bombeo}
                onChange={handleChange}
                placeholder="Ej. Línea de Respaldo"
                sx={{ bgcolor: "#ffffff" }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                name="observaciones_linea_bombeo"
                value={formData.observaciones_linea_bombeo}
                onChange={handleChange}
                multiline
                rows={3}
                sx={{ bgcolor: "#ffffff" }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#f8fafc" }}>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancelar
          </Button>
          <Button type="submit" color="primary" variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
