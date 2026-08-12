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
  Typography,
  Box,
} from "@mui/material";
import Swal from "sweetalert2";
import { transformadorService } from "../../services/transformadorService";

const estadoInicial = {
  tipo: "Distribución",
  norma: "ANSI/IEEE C57.12",
  potencia_nominal: "",
  año: new Date().getFullYear(),
  nivel_aislamiento: "",
  num_fases: 3,
  frecuencia: 60,
  clase_aislamiento: "A",
  tension_primaria: "",
  tension_secundaria: "",
  conexion: 1,
  corriente_primaria: "",
  refrigeracion: 0,
  tension_c_c: "",
  peso_act: "",
  tipo_aceite: "Mineral",
  temp_ambiente: 40.0,
  peso_total: "",
  vol_aceite_total: "",
  impedancia_voltios: "",
  calentamiento: "",
  marca: "",
  lugar_fabricado: "",
};

export default function ModalTransformador({
  open,
  onClose,
  modo,
  seleccionado,
  idEstacion,
  onSaveSuccess,
}) {
  const [formData, setFormData] = useState(estadoInicial);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      // 🌟 Nuestro fiel setTimeout para evitar el renderizado en cascada
      setTimeout(() => {
        if (modo === "edit" && seleccionado) {
          setFormData({
            tipo: seleccionado.tipo || "",
            norma: seleccionado.norma || "",
            potencia_nominal: seleccionado.potencia_nominal ?? "",
            año: seleccionado.año ?? "",
            nivel_aislamiento: seleccionado.nivel_aislamiento ?? "",
            num_fases: seleccionado.num_fases ?? 1,
            frecuencia: seleccionado.frecuencia ?? 60,
            clase_aislamiento: seleccionado.clase_aislamiento || "A",
            tension_primaria: seleccionado.tension_primaria ?? "",
            tension_secundaria: seleccionado.tension_secundaria ?? "",
            conexion: seleccionado.conexion ?? 0,
            corriente_primaria: seleccionado.corriente_primaria ?? "",
            refrigeracion: seleccionado.refrigeracion ?? 0,
            tension_c_c: seleccionado.tension_c_c ?? "",
            peso_act: seleccionado.peso_act ?? "",
            tipo_aceite: seleccionado.tipo_aceite || "Mineral",
            temp_ambiente: seleccionado.temp_ambiente ?? 40.0,
            peso_total: seleccionado.peso_total ?? "",
            vol_aceite_total: seleccionado.vol_aceite_total ?? "",
            impedancia_voltios: seleccionado.impedancia_voltios ?? "",
            calentamiento: seleccionado.calentamiento ?? "",
            marca: seleccionado.marca || "",
            lugar_fabricado: seleccionado.lugar_fabricado || "",
          });
        } else {
          // 🔥 PROBLEMA 2 SOLUCIONADO: Forzamos el reinicio completo de todos los campos al añadir uno nuevo
          setFormData(estadoInicial);
        }
      }, 0);
    }
  }, [open, modo, seleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const textFields = [
      "tipo",
      "norma",
      "clase_aislamiento",
      "tipo_aceite",
      "marca",
      "lugar_fabricado",
    ];
    let parsedValue = value;
    if (!textFields.includes(name)) {
      parsedValue = value === "" ? "" : Number(value);
    }
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modo === "add") {
        await transformadorService.addTransformador(idEstacion, formData);
        Swal.fire({
          icon: "success",
          title: "¡Banco Registrado!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await transformadorService.updateTransformador(
          seleccionado.id_banco_transformadores,
          formData,
        );
        Swal.fire({
          icon: "success",
          title: "¡Banco Actualizado!",
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
        text:
          error.response?.data?.message ||
          "Ocurrió un error al procesar los datos.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "#f8fafc",
          color: "primary.dark",
          fontWeight: "bold",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {modo === "add"
          ? "⚡ Registrar Banco de Transformadores"
          : "✏️ Editar Banco de Transformadores"}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, bgcolor: "#f8fafc" }}>
          <Grid container spacing={2}>
            {/* Sección 1: Datos Generales */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" fontWeight="bold">
                Generales e Identificación
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Norma"
                name="norma"
                value={formData.norma}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Año de Fabricación"
                name="año"
                value={formData.año}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Lugar de Fabricación"
                name="lugar_fabricado"
                value={formData.lugar_fabricado}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Clase Aislamiento"
                name="clase_aislamiento"
                value={formData.clase_aislamiento}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Sección 2: Parámetros Eléctricos */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary" fontWeight="bold">
                Especificaciones Eléctricas
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                required
                fullWidth
                type="number"
                label="Potencia Nominal (KVA)"
                name="potencia_nominal"
                value={formData.potencia_nominal}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Tensión Primaria (V)"
                name="tension_primaria"
                value={formData.tension_primaria}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Tensión Secundaria (V)"
                name="tension_secundaria"
                value={formData.tension_secundaria}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Corriente Primaria (A)"
                name="corriente_primaria"
                value={formData.corriente_primaria}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Nivel Aislamiento (KV)"
                name="nivel_aislamiento"
                value={formData.nivel_aislamiento}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Frecuencia (Hz)"
                name="frecuencia"
                value={formData.frecuencia}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Número de Fases"
                name="num_fases"
                value={formData.num_fases}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Impedancia (%)"
                name="impedancia_voltios"
                value={formData.impedancia_voltios}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Conexión"
                name="conexion"
                value={formData.conexion}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value={0}>Monofásica</MenuItem>
                <MenuItem value={1}>Delta (Δ)</MenuItem>
                <MenuItem value={2}>Estrella (Y)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Tensión Cortocircuito (V C.C.)"
                name="tension_c_c"
                value={formData.tension_c_c}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Sección 3: Datos Mecánicos y Térmicos */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary" fontWeight="bold">
                Mecánica, Enfriamiento y Entorno
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Refrigeración"
                name="refrigeracion"
                value={formData.refrigeracion}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value={0}>ONAN (Natural)</MenuItem>
                <MenuItem value={1}>ONAF (Forzada)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Tipo de Aceite"
                name="tipo_aceite"
                value={formData.tipo_aceite}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Vol. Aceite Total (L)"
                name="vol_aceite_total"
                value={formData.vol_aceite_total}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Peso Activo (Kg)"
                name="peso_act"
                value={formData.peso_act}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Peso Total (Kg)"
                name="peso_total"
                value={formData.peso_total}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Elevación Temp. (°C)"
                name="calentamiento"
                value={formData.calentamiento}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Temp. Ambiente Máx (°C)"
                name="temp_ambiente"
                value={formData.temp_ambiente}
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
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={submitting}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
