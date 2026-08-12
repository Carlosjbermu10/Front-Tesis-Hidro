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
import generadorService from "../../services/generadorService";

export default function GeneradorModal({
  open,
  onClose,
  idEstacion,
  generadorData,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);

  const initialState = {
    potencia_principal: "",
    revolucion: "",
    voltaje: "",
    fase: "",
    cableado: "",
    factor_potencia: "",
    corriente: "",
    conexion: 0,
    frecuencia: "",
    rodamiento: "",
    clase_proteccion: "",
    clase_aislamiento: "",
  };

  const [formData, setFormData] = useState(initialState);
  const isEditMode = Boolean(generadorData);

  useEffect(() => {
    // 🌟 El confiable setTimeout al rescate una vez más
    setTimeout(() => {
      if (open && isEditMode && generadorData) {
        setFormData({ ...initialState, ...generadorData });
      } else if (open && !isEditMode) {
        setFormData(initialState);
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, generadorData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditMode) {
        await generadorService.updateGenerador(
          generadorData.id_generador,
          formData,
        );
        Swal.fire({
          icon: "success",
          title: "Generador Actualizado",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await generadorService.addGenerador(idEstacion, formData);
        Swal.fire({
          icon: "success",
          title: "Generador Registrado",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo procesar la solicitud", "error");
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
          sx={{ bgcolor: "#f59e0b", color: "white", fontWeight: "bold" }}
        >
          {isEditMode ? "Modificar Generador" : "Registrar Nuevo Generador"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Potencia Principal (kW)"
                name="potencia_principal"
                type="number"
                value={formData.potencia_principal}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Revolución (RPM)"
                name="revolucion"
                type="number"
                value={formData.revolucion}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Voltaje (V)"
                name="voltaje"
                type="number"
                value={formData.voltaje}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Fase"
                name="fase"
                type="number"
                value={formData.fase}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Frecuencia (Hz)"
                name="frecuencia"
                type="number"
                value={formData.frecuencia}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Corriente (A)"
                name="corriente"
                type="number"
                value={formData.corriente}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Factor de Potencia"
                name="factor_potencia"
                type="number"
                inputProps={{ step: "0.01" }}
                value={formData.factor_potencia}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cableado"
                name="cableado"
                value={formData.cableado}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Rodamiento"
                name="rodamiento"
                value={formData.rodamiento}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Clase Protección (IP)"
                name="clase_proteccion"
                value={formData.clase_proteccion}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Clase Aislamiento"
                name="clase_aislamiento"
                type="number"
                value={formData.clase_aislamiento}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.conexion === 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conexion: e.target.checked ? 1 : 0,
                      })
                    }
                  />
                }
                label="Conexión en Estrella (Y)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="warning"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Guardar Registro"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
