// ModalBomba.jsx
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
import Swal from "sweetalert2";
import { bombaService } from "../../services/bombaService"; // Ajusta la ruta

export default function ModalBomba({
  open,
  onClose,
  modo, // 'add' o 'edit'
  bombaSeleccionada,
  idLineaBombeo, // Necesario para agregar a una línea
  onSaveSuccess,
}) {
  const [formData, setFormData] = useState({
    modelo_bomba: "",
    marca_bomba: "",
    tipo_bomba: "",
    q: "",
    num_etapa: "",
  });

  // 🌟 Truco anti-renders en cascada
  useEffect(() => {
    if (open) {
      const temporizador = setTimeout(() => {
        setFormData({
          modelo_bomba:
            modo === "edit" ? bombaSeleccionada?.modelo_bomba || "" : "",
          marca_bomba:
            modo === "edit" ? bombaSeleccionada?.marca_bomba || "" : "",
          tipo_bomba:
            modo === "edit" ? bombaSeleccionada?.tipo_bomba || "" : "",
          q: modo === "edit" ? bombaSeleccionada?.q || "" : "",
          num_etapa: modo === "edit" ? bombaSeleccionada?.num_etapa || "" : "",
        });
      }, 0);
      return () => clearTimeout(temporizador);
    }
  }, [open, modo, bombaSeleccionada]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Parseo numérico para caudal (q) y etapas (num_etapa)
    const val =
      name === "q" || name === "num_etapa"
        ? value === ""
          ? ""
          : Number(value)
        : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modo === "add") {
        await bombaService.addBomba(idLineaBombeo, formData);
        Swal.fire({
          icon: "success",
          title: "¡Bomba Registrada!",
          text: "El equipo de bombeo se agregó exitosamente.",
          timer: 1500,
          showConfirmButton: false,
          willOpen: () => {
            const c = Swal.getContainer();
            if (c) c.style.zIndex = "9999";
          },
        });
      } else {
        await bombaService.updateBomba(bombaSeleccionada.id_bomba, formData);
        Swal.fire({
          icon: "success",
          title: "¡Actualizada!",
          text: "Los datos de la bomba fueron modificados.",
          timer: 1500,
          showConfirmButton: false,
          willOpen: () => {
            const c = Swal.getContainer();
            if (c) c.style.zIndex = "9999";
          },
        });
      }
      onSaveSuccess();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "No se pudo procesar la solicitud.",
        willOpen: () => {
          const c = Swal.getContainer();
          if (c) c.style.zIndex = "9999";
        },
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary">
          {modo === "add" ? "➕ Registrar Bomba" : "✏️ Modificar Bomba"}
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, bgcolor: "#f1f5f9" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Tipo de Bomba (Ej. CENTRÍFUGA VERTICAL)"
                name="tipo_bomba"
                value={formData.tipo_bomba}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Marca"
                name="marca_bomba"
                value={formData.marca_bomba}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Modelo"
                name="modelo_bomba"
                value={formData.modelo_bomba}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Caudal (Q) L/s"
                type="number"
                name="q"
                value={formData.q}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nº de Etapas"
                type="number"
                name="num_etapa"
                value={formData.num_etapa}
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
          <Button type="submit" color="primary" variant="contained">
            Guardar Equipo
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
