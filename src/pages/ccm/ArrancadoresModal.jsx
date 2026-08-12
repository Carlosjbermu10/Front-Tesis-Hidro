import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";
import Swal from "sweetalert2";
import ccmService from "../../services/ccmService";

export default function ArrancadoresModal({
  open,
  onClose,
  idCcm,
  arrancadoresData,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);

  // Estado inicial con los 12 campos booleanos mapeados de la BD
  const initialState = {
    c_e_s: 0,
    c_a_estrella_triangulo: 0,
    c_a_directo: 0,
    c_a_con_reversion: 0,
    c_a_sin_reversion: 0,
    c_a_compen_transformador: 0,
    c_a_arrancador_suave: 0,
    c_convertidor_frecuencia: 0,
    bobinas_magneticas: 0,
    fusible: 0,
    interruptor: 0,
    interruptor_limitador_corriente: 0,
  };

  const [formData, setFormData] = useState(initialState);
  const isEditMode = Boolean(arrancadoresData);

  useEffect(() => {
    // 🌟 Aplicamos nuestra solución estándar con setTimeout
    setTimeout(() => {
      if (open && isEditMode && arrancadoresData) {
        setFormData({
          ...initialState,
          ...arrancadoresData,
        });
      } else if (open && !isEditMode) {
        setFormData(initialState);
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, arrancadoresData]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditMode) {
        await ccmService.updateArrancadoresCCM(idCcm, formData);
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "Configuración de arrancadores modificada.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await ccmService.addArrancadoresCCM(idCcm, formData);
        Swal.fire({
          icon: "success",
          title: "¡Registrado!",
          text: "Configuración de arrancadores creada.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar los arrancadores:", error);
      Swal.fire(
        "Error",
        "No se pudieron guardar los cambios en el servidor.",
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
            ? "Modificar Tipos de Arrancadores"
            : "Registrar Tipos de Arrancadores"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ py: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="c_e_s"
                      checked={formData.c_e_s === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="C.E.S."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="c_a_estrella_triangulo"
                      checked={formData.c_a_estrella_triangulo === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Estrella-Triángulo"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="c_a_directo"
                      checked={formData.c_a_directo === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Directo"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="c_a_con_reversion"
                      checked={formData.c_a_con_reversion === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Con Reversión"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="c_a_sin_reversion"
                      checked={formData.c_a_sin_reversion === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Sin Reversión"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="c_a_compen_transformador"
                      checked={formData.c_a_compen_transformador === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Compen. Transformador"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="c_a_arrancador_suave"
                      checked={formData.c_a_arrancador_suave === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Arrancador Suave"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="c_convertidor_frecuencia"
                      checked={formData.c_convertidor_frecuencia === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Conv. Frecuencia"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="bobinas_magneticas"
                      checked={formData.bobinas_magneticas === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Bobinas Magnéticas"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="fusible"
                      checked={formData.fusible === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Fusible"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="interruptor"
                      checked={formData.interruptor === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Interruptor"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="interruptor_limitador_corriente"
                      checked={formData.interruptor_limitador_corriente === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Interr. Limitador Corriente"
                />
              </Grid>
            </Grid>
          </Box>
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
