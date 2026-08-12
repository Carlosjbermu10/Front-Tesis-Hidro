import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Swal from "sweetalert2";
import tanqueService from "../../services/tanqueService.js";

export default function TanqueModal({
  open,
  onClose,
  idEstacion,
  tanqueData,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);

  const initialState = {
    volumen: "",
    geometria: "",
    posicion: "",
    largo: "",
    ancho: "",
    espesor: "",
    total_litros: "",
    cap_max_tanque: "",
    extintor: 0,
    material_tanque: "",
    area_cercada: 0,
    tipo_cerramiento: "",
  };

  const [formData, setFormData] = useState(initialState);
  const isEditMode = Boolean(tanqueData);

  useEffect(() => {
    // 🌟 Aplicamos el setTimeout para que React actualice el formulario limpiamente
    setTimeout(() => {
      if (open && isEditMode && tanqueData) {
        setFormData({ ...initialState, ...tanqueData });
      } else if (open && !isEditMode) {
        setFormData(initialState);
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, tanqueData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditMode) {
        await tanqueService.updateTanque(tanqueData.id_tanque, formData);
        Swal.fire({
          icon: "success",
          title: "Tanque Actualizado",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await tanqueService.addTanque(idEstacion, formData);
        Swal.fire({
          icon: "success",
          title: "Tanque Registrado",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        "No se pudo procesar la solicitud en el servidor.",
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
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{ bgcolor: "#0284c7", color: "white", fontWeight: "bold" }}
        >
          {isEditMode
            ? "Modificar Tanque de Almacenamiento"
            : "Registrar Nuevo Tanque"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {/* PARTE 1: CAPACIDADES Y MATERIAL */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Volumen Nominal (L)"
                name="volumen"
                type="number"
                value={formData.volumen ?? ""}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Capacidad Máxima (L)"
                name="cap_max_tanque"
                type="number"
                value={formData.cap_max_tanque ?? ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Total Litros Útiles (L)"
                name="total_litros"
                type="number"
                value={formData.total_litros ?? ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Geometría"
                name="geometria"
                value={formData.geometria ?? ""}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Seleccione...</em>
                </MenuItem>
                <MenuItem value={1}>Cilíndrico</MenuItem>
                <MenuItem value={2}>Prismático / Rectangular</MenuItem>
                <MenuItem value={3}>Otra</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Posición"
                name="posicion"
                value={formData.posicion ?? ""}
                onChange={handleChange}
                placeholder="Ej. Horizontal, Vertical"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Material"
                name="material_tanque"
                value={formData.material_tanque ?? ""}
                onChange={handleChange}
                placeholder="Ej. Acero al Carbono"
              />
            </Grid>

            {/* PARTE 2: DIMENSIONES */}
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
                label="Ancho / Diámetro (m)"
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
                label="Espesor (m)"
                name="espesor"
                value={formData.espesor ?? ""}
                onChange={handleChange}
              />
            </Grid>

            {/* PARTE 3: SEGURIDAD */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="extintor"
                    checked={formData.extintor === 1}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Posee Extintor"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="area_cercada"
                    checked={formData.area_cercada === 1}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Área Cercada"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tipo de Cerramiento"
                name="tipo_cerramiento"
                value={formData.tipo_cerramiento ?? ""}
                onChange={handleChange}
                disabled={formData.area_cercada === 0}
                placeholder={
                  formData.area_cercada === 1
                    ? "Ej. Malla Ciclón, Pared de Bloque"
                    : "Requiere Área Cercada activa"
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Guardar Registro"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
