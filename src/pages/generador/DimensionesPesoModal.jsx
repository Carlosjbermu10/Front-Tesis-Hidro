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

export default function DimensionesPesoModal({
  open,
  onClose,
  idGenerador,
  dimensionesData,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);

  // Estado inicial alineado con tu BD
  const initialState = {
    largo: "",
    ancho: "",
    alto: "",
    peso: "",
    cap_deposito_combustible_propio: "",
    autonomia: "",
  };

  const [formData, setFormData] = useState(initialState);
  const isEditMode = Boolean(dimensionesData);

  useEffect(() => {
    // 🌟 Envolvemos la lógica en el setTimeout como de costumbre
    setTimeout(() => {
      if (open && isEditMode && dimensionesData) {
        setFormData({
          ...initialState,
          ...dimensionesData,
        });
      } else if (open && !isEditMode) {
        setFormData(initialState);
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, dimensionesData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditMode) {
        await generadorService.updateDimensionesGenerador(
          idGenerador,
          formData,
        );
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "Dimensiones y peso modificados.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await generadorService.addDimensionesGenerador(idGenerador, formData);
        Swal.fire({
          icon: "success",
          title: "¡Registrado!",
          text: "Dimensiones y peso creados.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar dimensiones:", error);
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
            ? "Modificar Dimensiones y Peso"
            : "Registrar Dimensiones y Peso"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                inputProps={{ step: "any" }}
                label="Largo (m)"
                name="largo"
                value={formData.largo ?? ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                inputProps={{ step: "any" }}
                label="Ancho (m)"
                name="ancho"
                value={formData.ancho ?? ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                inputProps={{ step: "any" }}
                label="Alto (m)"
                name="alto"
                value={formData.alto ?? ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                inputProps={{ step: "any" }}
                label="Peso (kg)"
                name="peso"
                value={formData.peso ?? ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                inputProps={{ step: "any" }}
                label="Depósito Propio (L)"
                name="cap_deposito_combustible_propio"
                value={formData.cap_deposito_combustible_propio ?? ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Autonomía (Horas)"
                name="autonomia"
                value={formData.autonomia ?? ""}
                onChange={handleChange}
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
