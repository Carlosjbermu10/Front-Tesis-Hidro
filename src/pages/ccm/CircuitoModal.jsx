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
} from "@mui/material";
import Swal from "sweetalert2";
import ccmService from "../../services/ccmService"; // Ajusta tu ruta

export default function CircuitoModal({
  open,
  onClose,
  idCcm,
  circuitoData,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);

  // Estado inicial alineado con tu BD
  const initialState = {
    e_s_cables: "",
    clase_tension: "",
    tension_nominal_red: "",
    tension_mando: "",
    frecuencia_nominal: "",
    corriente_nominal: "",
    corriente_corta_duracion: "",
    nbi: "",
    temp_ambiente: "",
    interruptor_principal: 0,
    elevacion_temp: "",
    barra_ramales: "",
    altitud_max: "",
    voltaje_aislamiento: "",
    barras_principales: "",
    cap_corto_circuito: "",
    barras: 0,
    voltaje_trabajo: "",
    voltaje_control: "",
    cap_interrupcion_max: "",
  };

  const [formData, setFormData] = useState(initialState);
  const isEditMode = Boolean(circuitoData);

  // Sincronizar datos al abrir en modo edición
  useEffect(() => {
    // 🌟 Envolvemos todo en el setTimeout
    setTimeout(() => {
      if (open && isEditMode && circuitoData) {
        setFormData({
          ...initialState,
          ...circuitoData,
        });
      } else if (open && !isEditMode) {
        setFormData(initialState);
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, circuitoData]);

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
        await ccmService.updateCircuitoCCM(idCcm, formData);
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "Circuito modificado.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await ccmService.addCircuitoCCM(idCcm, formData);
        Swal.fire({
          icon: "success",
          title: "¡Registrado!",
          text: "Especificaciones de circuito creadas.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar el circuito:", error);
      Swal.fire("Error", "No se pudo procesar la operación.", "error");
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
            ? "Modificar Especificaciones del Circuito"
            : "Registrar Especificaciones del Circuito"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {/* Cadenas de Texto */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Entrada/Salida Cables"
                name="e_s_cables"
                value={formData.e_s_cables}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Clase de Tensión"
                name="clase_tension"
                value={formData.clase_tension}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Valores Numéricos Básicos */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Tensión Nominal Red (V)"
                name="tension_nominal_red"
                value={formData.tension_nominal_red}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Tensión Mando (V)"
                name="tension_mando"
                value={formData.tension_mando}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Frecuencia Nominal (Hz)"
                name="frecuencia_nominal"
                value={formData.frecuencia_nominal}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Corriente Nominal (A)"
                name="corriente_nominal"
                value={formData.corriente_nominal}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Corriente Corta Dur. (A)"
                name="corriente_corta_duracion"
                value={formData.corriente_corta_duracion}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="NBI (kV)"
                name="nbi"
                value={formData.nbi}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Temp. Ambiente (°C)"
                name="temp_ambiente"
                value={formData.temp_ambiente}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Elevación Temp. (°C)"
                name="elevacion_temp"
                value={formData.elevacion_temp}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Altitud Máxima (m)"
                name="altitud_max"
                value={formData.altitud_max}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Voltaje Aislamiento (V)"
                name="voltaje_aislamiento"
                value={formData.voltaje_aislamiento}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Voltaje Trabajo (V)"
                name="voltaje_trabajo"
                value={formData.voltaje_trabajo}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Voltaje Control (V)"
                name="voltaje_control"
                value={formData.voltaje_control}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Barra Ramales (A)"
                name="barra_ramales"
                value={formData.barra_ramales}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Barras Principales (A)"
                name="barras_principales"
                value={formData.barras_principales}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Cap. Corto Circuito (kA)"
                name="cap_corto_circuito"
                value={formData.cap_corto_circuito}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Cap. Interrupción Máx (kA)"
                name="cap_interrupcion_max"
                value={formData.cap_interrupcion_max}
                onChange={handleChange}
              />
            </Grid>

            {/* Booleanos / Checkboxes */}
            <Grid
              item
              xs={12}
              sm={4}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="interruptor_principal"
                    checked={formData.interruptor_principal === 1}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Interruptor Principal"
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={4}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="barras"
                    checked={formData.barras === 1}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Barras"
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
            {submitting ? "Guardando..." : "Guardar Registro"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
