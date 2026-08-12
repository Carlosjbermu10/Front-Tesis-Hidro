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
import ccmService from "../../services/ccmService.js";

export default function ContactosModal({
  open,
  onClose,
  idCcm,
  contactosData,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);

  // Estado inicial alineado con tu BD
  const initialState = {
    bipolar: 0,
    tripolar: 0,
    tetrapolar: 0,
    pentapolar: 0,
  };

  const [formData, setFormData] = useState(initialState);
  const isEditMode = Boolean(contactosData);

  useEffect(() => {
    // 🌟 Aplicamos el setTimeout para retrasar la actualización del estado
    setTimeout(() => {
      if (open && isEditMode && contactosData) {
        setFormData({
          ...initialState,
          ...contactosData,
        });
      } else if (open && !isEditMode) {
        setFormData(initialState);
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, contactosData]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditMode) {
        await ccmService.updateContactosCCM(idCcm, formData);
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "Juegos de contactos modificados.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await ccmService.addContactosCCM(idCcm, formData);
        Swal.fire({
          icon: "success",
          title: "¡Registrado!",
          text: "Juegos de contactos creados.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar los contactos:", error);
      Swal.fire("Error", "No se pudo procesar la operación.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="xs"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{ bgcolor: "#0284c7", color: "white", fontWeight: "bold" }}
        >
          {isEditMode
            ? "Modificar Juegos de Contactos"
            : "Registrar Juegos de Contactos"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Box sx={{ py: 1 }}>
            <Grid container spacing={2} direction="column">
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="bipolar"
                      checked={formData.bipolar === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Sistema Bipolar"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="tripolar"
                      checked={formData.tripolar === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Sistema Tripolar"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="tetrapolar"
                      checked={formData.tetrapolar === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Sistema Tetrapolar"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="pentapolar"
                      checked={formData.pentapolar === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Sistema Pentapolar"
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
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
