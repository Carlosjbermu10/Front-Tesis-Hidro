import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";
import Swal from "sweetalert2";
import generadorService from "../../services/generadorService.js";

export default function MotorModal({
  open,
  onClose,
  idGenerador,
  motorData,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);

  // Estado inicial mapeado exactamente de tu base de datos
  const initialState = {
    marca: "",
    modelo: "",
    aspiracion: "",
    refrigeracion: 0,
    num_cilindros: "",
    potencia_motor: "",
    velocidad_nominal: "",
    tipo_regulacion: "",
    sistema_arranque: "",
    circuito_electrico: "",
    regulador_velocidad: 0,
    combistible: "", // Se mantiene el nombre exacto de tu columna SQL
  };

  const [formData, setFormData] = useState(initialState);
  const isEditMode = Boolean(motorData);

  useEffect(() => {
    // 🌟 Envolvemos la actualización del estado en nuestro ya clásico setTimeout
    setTimeout(() => {
      if (open && isEditMode && motorData) {
        setFormData({
          ...initialState,
          ...motorData,
        });
      } else if (open && !isEditMode) {
        setFormData(initialState);
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, motorData]);

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
        await generadorService.updateMotorGenerador(idGenerador, formData);
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "Especificaciones del motor modificadas.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await generadorService.addMotorGenerador(idGenerador, formData);
        Swal.fire({
          icon: "success",
          title: "¡Registrado!",
          text: "Especificaciones del motor creadas.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar el motor:", error);
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
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{ bgcolor: "#0284c7", color: "white", fontWeight: "bold" }}
        >
          {isEditMode
            ? "Modificar Especificaciones del Motor"
            : "Registrar Especificaciones del Motor"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {/* Cadenas de Texto obligatorias */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marca del Motor"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Modelo del Motor"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Datos Técnicos de Texto */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Aspiración"
                name="aspiracion"
                value={formData.aspiracion}
                onChange={handleChange}
                placeholder="Ej. Turbocargado, Natural"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tipo de Regulación"
                name="tipo_regulacion"
                value={formData.tipo_regulacion}
                onChange={handleChange}
                placeholder="Ej. Mecánica, Electrónica"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sistema de Arranque"
                name="sistema_arranque"
                value={formData.sistema_arranque}
                onChange={handleChange}
                placeholder="Ej. Eléctrico 12VCC"
              />
            </Grid>

            {/* Combustible select numérico */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Tipo Combustible"
                name="combistible"
                value={formData.combistible}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Ninguno</em>
                </MenuItem>
                <MenuItem value={1}>Diésel</MenuItem>
                <MenuItem value={2}>Gasolina</MenuItem>
                <MenuItem value={3}>Gas Natural</MenuItem>
              </TextField>
            </Grid>

            {/* Valores Numéricos */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Nº de Cilindros"
                name="num_cilindros"
                value={formData.num_cilindros}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Potencia Motor (HP)"
                name="potencia_motor"
                value={formData.potencia_motor}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Velocidad Nominal (RPM)"
                name="velocidad_nominal"
                value={formData.velocidad_nominal}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Circuito Eléctrico (V)"
                name="circuito_electrico"
                value={formData.circuito_electrico}
                onChange={handleChange}
              />
            </Grid>

            {/* Booleanos (TINYINT 0 o 1) */}
            <Grid
              item
              xs={12}
              sm={6}
              sx={{ display: "flex", alignItems: "center", mt: 1 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="refrigeracion"
                    checked={formData.refrigeracion === 1}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Posee Sistema de Refrigeración"
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{ display: "flex", alignItems: "center", mt: 1 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="regulador_velocidad"
                    checked={formData.regulador_velocidad === 1}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Posee Regulador de Velocidad"
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
            {submitting ? "Guardando..." : "Guardar Especificaciones"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
