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
  CircularProgress,
  Box,
} from "@mui/material";
import Swal from "sweetalert2";
import generadorService from "../../services/generadorService.js";

export default function AsociarTanqueModal({
  open,
  onClose,
  idEstacion,
  idGenerador,
  conexionData,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [loadingTanques, setLoadingTanques] = useState(false);
  const [tanquesDisponibles, setTanquesDisponibles] = useState([]);

  const isEditMode = Boolean(conexionData);

  const initialState = {
    id_tanque: "",
    tipo_suministro: "",
    diametro_tuberia: "",
    longitud_linea: "",
  };

  const [formData, setFormData] = useState(initialState);

  const cargarTanques = async () => {
    try {
      setLoadingTanques(true);
      const res = await generadorService.getTanquesForEstacion(idEstacion);
      setTanquesDisponibles(res.data || []);
    } catch (error) {
      console.error("Error al cargar tanques:", error);
    } finally {
      setLoadingTanques(false);
    }
  };

  useEffect(() => {
    if (open) {
      // 🌟 Envolvemos todo en nuestro setTimeout para evitar el renderizado en cascada
      setTimeout(() => {
        cargarTanques();
        if (isEditMode && conexionData) {
          setFormData({
            id_tanque: conexionData.id_tanque,
            tipo_suministro: conexionData.tipo_suministro || "",
            diametro_tuberia: conexionData.diametro_tuberia || "",
            longitud_linea: conexionData.longitud_linea || "",
          });
        } else {
          setFormData(initialState);
        }
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, conexionData, idEstacion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditMode) {
        await generadorService.updateTanqueGenerador(
          formData.id_tanque,
          idGenerador,
          formData,
        );
        Swal.fire({
          icon: "success",
          title: "Conexión Actualizada",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await generadorService.addTanqueGenerador(
          formData.id_tanque,
          idGenerador,
          formData,
        );
        Swal.fire({
          icon: "success",
          title: "Tanque Asociado",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al asociar tanque:", error);
      Swal.fire("Error", "No se pudo procesar la conexión.", "error");
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
          sx={{ bgcolor: "#4f46e5", color: "white", fontWeight: "bold" }}
        >
          {isEditMode
            ? "Modificar Conexión del Tanque"
            : "Asociar Tanque de Suministro"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {loadingTanques ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Seleccione el Tanque"
                  name="id_tanque"
                  value={formData.id_tanque}
                  onChange={handleChange}
                  required
                  disabled={isEditMode} // En edición no se puede cambiar qué tanque es
                >
                  <MenuItem value="">
                    <em>Seleccione...</em>
                  </MenuItem>
                  {tanquesDisponibles.map((tanque) => (
                    <MenuItem key={tanque.id_tanque} value={tanque.id_tanque}>
                      Tanque #{tanque.id_tanque} - {tanque.material_tanque} (
                      {tanque.volumen} L)
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tipo de Suministro"
                  name="tipo_suministro"
                  value={formData.tipo_suministro}
                  onChange={handleChange}
                  placeholder="Ej. Bomba de transferencia, Gravedad"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ step: "any" }}
                  label="Diámetro Tubería (pulg)"
                  name="diametro_tuberia"
                  value={formData.diametro_tuberia}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ step: "any" }}
                  label="Longitud de Línea (m)"
                  name="longitud_linea"
                  value={formData.longitud_linea}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting || loadingTanques}
          >
            {submitting ? "Guardando..." : "Guardar Conexión"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
