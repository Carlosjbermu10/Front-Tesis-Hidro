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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import { motorService } from "../../services/motorService";

export default function ModalDetalleMotor({
  open,
  onClose,
  modo,
  detalleSeleccionado,
  idMotor,
  onSaveSuccess,
  userRole,
  handleEliminarDetalleMotor,
}) {
  // 🌟 Extractor Síncrono Anti-Bugs
  const origen = detalleSeleccionado;
  const fichaDatos =
    origen?.data && Array.isArray(origen.data)
      ? origen.data[0]
      : Array.isArray(origen)
        ? origen[0]
        : origen;

  const [editando, setEditando] = useState(modo === "add");

  const [formData, setFormData] = useState({
    pot_nom_motor_hp: fichaDatos?.pot_nom_motor_hp ?? "",
    pot_nom_motor_kw: fichaDatos?.pot_nom_motor_kw ?? "",
    tens_nom_operacion_v: fichaDatos?.tens_nom_operacion_v ?? "",
    tens_nom_operacion_amp: fichaDatos?.tens_nom_operacion_amp ?? "",
    eficencia: fichaDatos?.eficencia ?? "",
    vel_nom_motor_rpm: fichaDatos?.vel_nom_motor_rpm ?? "",
    tam_carcaza: fichaDatos?.tam_carcaza ?? "",
    frecuencia: fichaDatos?.frecuencia ?? "",
    factor_potencia: fichaDatos?.factor_potencia ?? "",
    factor_servicio: fichaDatos?.factor_servicio ?? "",
    tipo_aislamiento: fichaDatos?.tipo_aislamiento ?? "",
    grado_proteccion: fichaDatos?.grado_proteccion ?? "",
    temp_ambiente_max: fichaDatos?.temp_ambiente_max ?? "",
    peso_motor: fichaDatos?.peso_motor ?? "",
    altitud_ambiente_max: fichaDatos?.altitud_ambiente_max ?? "",
    rodamiento: fichaDatos?.rodamiento ?? "",
  });

  // 🔄 Efecto de sincronización inmediata
  useEffect(() => {
    if (open) {
      // 🌟 El famoso setTimeout al rescate para evitar el renderizado en cascada
      setTimeout(() => {
        if (
          fichaDatos &&
          (fichaDatos.id_detalle_motor || fichaDatos.pot_nom_motor_hp)
        ) {
          // Si el motor SÍ tiene detalles, cargamos sus datos
          setFormData({
            pot_nom_motor_hp: fichaDatos.pot_nom_motor_hp ?? "",
            pot_nom_motor_kw: fichaDatos.pot_nom_motor_kw ?? "",
            tens_nom_operacion_v: fichaDatos.tens_nom_operacion_v ?? "",
            tens_nom_operacion_amp: fichaDatos.tens_nom_operacion_amp ?? "",
            eficencia: fichaDatos.eficencia ?? "",
            vel_nom_motor_rpm: fichaDatos.vel_nom_motor_rpm ?? "",
            tam_carcaza: fichaDatos.tam_carcaza ?? "",
            frecuencia: fichaDatos.frecuencia ?? "",
            factor_potencia: fichaDatos.factor_potencia ?? "",
            factor_servicio: fichaDatos.factor_servicio ?? "",
            tipo_aislamiento: fichaDatos.tipo_aislamiento ?? "",
            grado_proteccion: fichaDatos.grado_proteccion ?? "",
            temp_ambiente_max: fichaDatos.temp_ambiente_max ?? "",
            peso_motor: fichaDatos.peso_motor ?? "",
            altitud_ambiente_max: fichaDatos.altitud_ambiente_max ?? "",
            rodamiento: fichaDatos.rodamiento ?? "",
          });
          setEditando(false); // Modo lectura/edición si ya existe
        } else {
          // 🌟 SI NO TIENE DETALLES, OBLIGAMOS A QUE TODO SEA VACÍO (Limpieza de fantasmas)
          setFormData({
            pot_nom_motor_hp: "",
            pot_nom_motor_kw: "",
            tens_nom_operacion_v: "",
            tens_nom_operacion_amp: "",
            eficencia: "",
            vel_nom_motor_rpm: "",
            tam_carcaza: "",
            frecuencia: "",
            factor_potencia: "",
            factor_servicio: "",
            tipo_aislamiento: "",
            grado_proteccion: "",
            temp_ambiente_max: "",
            peso_motor: "",
            altitud_ambiente_max: "",
            rodamiento: "",
          });
          setEditando(true); // Se fuerza a true para que salgan los cuadros editables de registro
        }
      }, 0);
    }
  }, [open, fichaDatos]); // ✨ Dependencias impecables en esta ocasión

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convierte a número los campos que lo requieran para SQL
    const textFields = ["tipo_aislamiento", "grado_proteccion"];
    let val = value;
    if (!textFields.includes(name)) val = value === "" ? "" : Number(value);

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modo === "add") {
        await motorService.addDetalleMotor(idMotor, formData);
        Swal.fire({
          icon: "success",
          title: "¡Ficha Creada!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await motorService.updateDetalleMotor(
          fichaDatos.id_detalle_motor,
          formData,
        );
        Swal.fire({
          icon: "success",
          title: "¡Ficha Actualizada!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setEditando(false);
      onSaveSuccess();
      if (modo === "add") onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al guardar.",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#f8fafc",
        }}
      >
        <Typography variant="h6" color="primary.dark" fontWeight="bold">
          📄 Ficha Técnica Avanzada - Motor Eléctrico
        </Typography>
        <Box>
          {modo === "edit" &&
            !editando &&
            (userRole === "admin" || userRole === "supervisor") && (
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setEditando(true)}
                sx={{ mr: 1 }}
              >
                Modificar
              </Button>
            )}
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ bgcolor: "#f1f5f9" }}>
          <Grid container spacing={2}>
            {/* --- Rendimiento --- */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary">
                Potencia y Velocidad
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Potencia (HP)"
                name="pot_nom_motor_hp"
                value={formData.pot_nom_motor_hp}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Potencia (kW)"
                name="pot_nom_motor_kw"
                value={formData.pot_nom_motor_kw}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Velocidad (RPM)"
                name="vel_nom_motor_rpm"
                value={formData.vel_nom_motor_rpm}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Frecuencia (Hz)"
                name="frecuencia"
                value={formData.frecuencia}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* --- Eléctrica --- */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary">
                Especificaciones Eléctricas
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Tensión (V)"
                name="tens_nom_operacion_v"
                value={formData.tens_nom_operacion_v}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Corriente (Amp)"
                name="tens_nom_operacion_amp"
                value={formData.tens_nom_operacion_amp}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Eficiencia (%)"
                name="eficencia"
                value={formData.eficencia}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Factor Potencia"
                name="factor_potencia"
                value={formData.factor_potencia}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* --- Mecánica y Físicas --- */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary">
                Mecánica y Entorno
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Factor Servicio"
                name="factor_servicio"
                value={formData.factor_servicio}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Aislamiento"
                name="tipo_aislamiento"
                value={formData.tipo_aislamiento}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Protección (IP)"
                name="grado_proteccion"
                value={formData.grado_proteccion}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Carcasa"
                name="tam_carcaza"
                value={formData.tam_carcaza}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Rodamiento"
                name="rodamiento"
                value={formData.rodamiento}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Peso (Kg)"
                name="peso_motor"
                value={formData.peso_motor}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Temp. Max (°C)"
                name="temp_ambiente_max"
                value={formData.temp_ambiente_max}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                disabled={!editando}
                fullWidth
                label="Altitud Max (m)"
                name="altitud_ambiente_max"
                value={formData.altitud_ambiente_max}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{ p: 2, bgcolor: "#f8fafc", justifyContent: "space-between" }}
        >
          {modo === "edit" && userRole === "admin" ? (
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                onClose();
                handleEliminarDetalleMotor(fichaDatos.id_detalle_motor);
              }}
            >
              ELIMINAR FICHA
            </Button>
          ) : (
            <Box />
          )}
          <Box>
            <Button onClick={onClose} color="secondary" sx={{ mr: 1 }}>
              Cerrar
            </Button>
            {editando && (
              <Button type="submit" variant="contained" color="primary">
                Guardar Ficha
              </Button>
            )}
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
