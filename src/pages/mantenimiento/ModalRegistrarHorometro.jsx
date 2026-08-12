import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import { mantenimientoService } from "../../services/mantenimientoService.js";

export const ModalRegistrarHorometro = ({
  open,
  handleClose,
  tipo_equipo,
  equipo_id,
  onSuccess,
}) => {
  const [horas, setHoras] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validación básica
    if (!horas || isNaN(horas) || Number(horas) < 0) {
      setErrorMessage(
        "Por favor, ingrese un valor numérico válido para las horas.",
      );
      return;
    }

    try {
      setLoading(true);

      // Armamos el JSON exactamente como lo pide tu backend
      const payload = {
        tipo_equipo: tipo_equipo,
        equipo_id: equipo_id,
        horas_acumuladas: parseFloat(horas),
      };

      const res = await mantenimientoService.addLecturaHorometro(payload);

      if (res && res.status === "ok") {
        setHoras(""); // Limpiamos el campo
        onSuccess(); // Recargamos la tabla
        handleClose(); // Cerramos el modal
      } else {
        setErrorMessage(
          res.description || "Ocurrió un error al registrar el horómetro.",
        );
      }
    } catch (err) {
      console.log(err);
      setErrorMessage("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        Registrar Lectura de Horómetro
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Horas Acumuladas"
            type="number"
            inputProps={{ step: "0.01", min: "0" }} // Permite decimales como "45.25"
            value={horas}
            onChange={(e) => setHoras(e.target.value)}
            placeholder="Ej: 45.25"
            required
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Lectura"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
