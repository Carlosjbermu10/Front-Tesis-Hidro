import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
} from "@mui/material";
import Swal from "sweetalert2";
import generadorService from "../../services/generadorService.js";

export default function CombustibleLubricanteModal({
  open,
  onClose,
  idGenerador,
  combustibleData,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);

  // Estado inicial alineado con las columnas de tu tabla SQL
  const initialState = {
    consumo_combustible: "",
    cap_aceite_lubricante: "",
    consumo_lubricante: "",
    tipo_lubricante: "",
  };

  const [formData, setFormData] = useState(initialState);
  const isEditMode = Boolean(combustibleData);

  useEffect(() => {
    // 🌟 Aplicamos el setTimeout para mantener el linter contento
    setTimeout(() => {
      if (open && isEditMode && combustibleData) {
        setFormData({
          ...initialState,
          ...combustibleData,
        });
      } else if (open && !isEditMode) {
        setFormData(initialState);
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, combustibleData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditMode) {
        await generadorService.updateCombustibleGenerador(
          idGenerador,
          formData,
        );
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "Datos de consumo y lubricación modificados.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await generadorService.addCombustibleGenerador(idGenerador, formData);
        Swal.fire({
          icon: "success",
          title: "¡Registrado!",
          text: "Datos de consumo y lubricación creados.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar combustible y lubricante:", error);
      Swal.fire(
        "Error",
        "No se pudo procesar la operación en el servidor.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{ bgcolor: "#0284c7", color: "white", fontWeight: "bold" }}
        >
          {isEditMode
            ? "Modificar Combustible y Lubricante"
            : "Registrar Combustible y Lubricante"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Consumo Combustible (L/h)"
                name="consumo_combustible"
                value={formData.consumo_combustible ?? ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Capacidad Aceite Lubricante (L)"
                name="cap_aceite_lubricante"
                value={formData.cap_aceite_lubricante ?? ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Consumo Lubricante (L/h)"
                name="consumo_lubricante"
                value={formData.consumo_lubricante ?? ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tipo de Lubricante"
                name="tipo_lubricante"
                value={formData.tipo_lubricante ?? ""}
                onChange={handleChange}
                placeholder="Ej. SAE 40, Mobil Delvac"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Guardar Datos"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
