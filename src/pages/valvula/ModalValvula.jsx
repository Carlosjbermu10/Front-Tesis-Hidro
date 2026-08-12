// ModalValvula.jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import Swal from "sweetalert2";
import { valvulaService } from "../../services/valvulaService"; // Ajusta la ruta

export default function ModalValvula({
  open,
  onClose,
  modo, // 'add' o 'edit'
  valvulaSeleccionada,
  idLineaBombeo, // Necesario para agregar
  onSaveSuccess,
}) {
  // Estado inicial limpio
  const [formData, setFormData] = useState({
    modelo_valvula: "",
    marca_valvula: "",
    tipo_valvula: "",
    pn: "",
    norma_brida: "",
    clase_valvula: "",
    diametro_tornillo: "",
    longitud_tornillo: "",
    grado_tornillo: "",
    tipo_asiento: "",
    tipo_compuerta: "",
    forma_operacion: "",
  });

  // 🌟 Solución probada: Llenado asíncrono para evitar advertencias de Console Ninja
  useEffect(() => {
    if (open) {
      const temporizador = setTimeout(() => {
        setFormData({
          modelo_valvula:
            modo === "edit" ? valvulaSeleccionada?.modelo_valvula || "" : "",
          marca_valvula:
            modo === "edit" ? valvulaSeleccionada?.marca_valvula || "" : "",
          tipo_valvula:
            modo === "edit" ? valvulaSeleccionada?.tipo_valvula || "" : "",
          pn: modo === "edit" ? valvulaSeleccionada?.pn || "" : "",
          norma_brida:
            modo === "edit" ? valvulaSeleccionada?.norma_brida || "" : "",
          clase_valvula:
            modo === "edit" ? valvulaSeleccionada?.clase_valvula || "" : "",
          diametro_tornillo:
            modo === "edit" ? valvulaSeleccionada?.diametro_tornillo || "" : "",
          longitud_tornillo:
            modo === "edit" ? valvulaSeleccionada?.longitud_tornillo || "" : "",
          grado_tornillo:
            modo === "edit" ? valvulaSeleccionada?.grado_tornillo || "" : "",
          tipo_asiento:
            modo === "edit" ? valvulaSeleccionada?.tipo_asiento || "" : "",
          tipo_compuerta:
            modo === "edit" ? valvulaSeleccionada?.tipo_compuerta || "" : "",
          forma_operacion:
            modo === "edit" ? valvulaSeleccionada?.forma_operacion || "" : "",
        });
      }, 0);
      return () => clearTimeout(temporizador);
    }
  }, [open, modo, valvulaSeleccionada]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si el campo es numérico, lo parseamos para evitar problemas con el backend
    const numericFields = [
      "pn",
      "diametro_tornillo",
      "longitud_tornillo",
      "grado_tornillo",
    ];
    const val = numericFields.includes(name)
      ? value === ""
        ? ""
        : Number(value)
      : value;

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modo === "add") {
        await valvulaService.addValvula(idLineaBombeo, formData);
        Swal.fire({
          icon: "success",
          title: "¡Registrada!",
          text: "Válvula agregada exitosamente.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await valvulaService.updateValvula(
          valvulaSeleccionada.id_valvula,
          formData,
        );
        Swal.fire({
          icon: "success",
          title: "¡Actualizada!",
          text: "Válvula modificada con éxito.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error("Error al procesar válvula:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "No se pudo procesar la solicitud.",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary">
          {modo === "add"
            ? "➕ Registrar Nueva Válvula"
            : "✏️ Modificar Válvula"}
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, bgcolor: "#f1f5f9" }}>
          <Grid container spacing={2}>
            {/* Fila 1: Datos Generales */}
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Modelo"
                name="modelo_valvula"
                value={formData.modelo_valvula}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Marca"
                name="marca_valvula"
                value={formData.marca_valvula}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Tipo (Ej. VENTOSA)"
                name="tipo_valvula"
                value={formData.tipo_valvula}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Fila 2: Especificaciones Técnicas */}
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="PN (Presión Nominal)"
                type="number"
                name="pn"
                value={formData.pn}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Norma Brida"
                name="norma_brida"
                value={formData.norma_brida}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Clase (Ej. CLASE 150)"
                name="clase_valvula"
                value={formData.clase_valvula}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Fila 3: Tornillería */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Diámetro Tornillo (mm)"
                type="number"
                name="diametro_tornillo"
                value={formData.diametro_tornillo}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Longitud Tornillo (mm)"
                type="number"
                name="longitud_tornillo"
                value={formData.longitud_tornillo}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Grado Tornillo"
                type="number"
                name="grado_tornillo"
                value={formData.grado_tornillo}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Fila 4: Componentes Internos */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tipo de Asiento"
                name="tipo_asiento"
                value={formData.tipo_asiento}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tipo de Compuerta"
                name="tipo_compuerta"
                value={formData.tipo_compuerta}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Forma de Operación"
                name="forma_operacion"
                value={formData.forma_operacion}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#f8fafc" }}>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancelar
          </Button>
          <Button type="submit" color="primary" variant="contained">
            Guardar Válvula
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
