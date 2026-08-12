// ModalDetalleBomba.jsx
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
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import { bombaService } from "../../services/bombaService";

export default function ModalDetalleBomba({
  open,
  onClose,
  modo,
  detalleSeleccionado,
  idBomba,
  onSaveSuccess,
  userRole,
  handleEliminarFichaBomba,
}) {
  // 🌟 Extraemos de forma síncrona y segura la ficha que viene del componente padre
  const origen = detalleSeleccionado;
  const fichaDatos =
    origen?.data && Array.isArray(origen.data)
      ? origen.data[0]
      : Array.isArray(origen)
        ? origen[0]
        : origen;

  // 🛠️ COMA CORREGIDA: Declaramos el estado de control para habilitar/deshabilitar los campos
  const [editando, setEditando] = useState(modo === "add");

  // Inicialización directa y dinámica basada en las propiedades reales que vimos en tu consola
  const [formData, setFormData] = useState({
    pot_nom_bomba_hp: fichaDatos?.pot_nom_bomba_hp ?? "",
    presion_descarga: fichaDatos?.presion_descarga ?? "",
    alt_elevacion_bomba: fichaDatos?.alt_elevacion_bomba ?? "",
    vel_nom_bomba_rpm: fichaDatos?.vel_nom_bomba_rpm ?? "",
    dimensiones_impulsor: fichaDatos?.dimensiones_impulsor ?? "",
    diametro_succion: fichaDatos?.diametro_succion ?? "",
    diametro_carga: fichaDatos?.diametro_carga ?? "",
    peso_bomba: fichaDatos?.peso_bomba ?? "",
    acomplamiento: fichaDatos?.acomplamiento ?? 1,
    tipo_acople: fichaDatos?.tipo_acople ?? "",
    tipo_cabezal: fichaDatos?.tipo_cabezal ?? "",
    detalle_bombacol: fichaDatos?.detalle_bombacol ?? "",
    diametro_succion_cabezal: fichaDatos?.diametro_succion_cabezal ?? "",
    diametro_descarga_cabezal: fichaDatos?.diametro_descarga_cabezal ?? "",
    lubricacion: fichaDatos?.lubricacion ?? 0,
    rodamiento: fichaDatos?.rodamiento ?? 1,
  });

  // 🔄 EFECTO DE CONTROL: Si los datos externos cambian con el modal abierto, forzamos la actualización inmediata
  useEffect(() => {
    if (open && fichaDatos) {
      // 1. Envolvemos todo en un setTimeout para evitar los "cascading renders"
      setTimeout(() => {
        setFormData({
          pot_nom_bomba_hp: fichaDatos.pot_nom_bomba_hp ?? "",
          presion_descarga: fichaDatos.presion_descarga ?? "",
          alt_elevacion_bomba: fichaDatos.alt_elevacion_bomba ?? "",
          vel_nom_bomba_rpm: fichaDatos.vel_nom_bomba_rpm ?? "",
          dimensiones_impulsor: fichaDatos.dimensiones_impulsor ?? "",
          diametro_succion: fichaDatos.diametro_succion ?? "",
          diametro_carga: fichaDatos.diametro_carga ?? "",
          peso_bomba: fichaDatos.peso_bomba ?? "",
          acomplamiento: fichaDatos.acomplamiento ?? 1,
          tipo_acople: fichaDatos.tipo_acople ?? "",
          tipo_cabezal: fichaDatos.tipo_cabezal ?? "",
          detalle_bombacol: fichaDatos.detalle_bombacol ?? "",
          diametro_succion_cabezal: fichaDatos.diametro_succion_cabezal ?? "",
          diametro_descarga_cabezal: fichaDatos.diametro_descarga_cabezal ?? "",
          lubricacion: fichaDatos.lubricacion ?? 0,
          rodamiento: fichaDatos.rodamiento ?? 1,
        });
        setEditando(modo === "add");
      }, 0);
    }
    // 2. Actualizamos el arreglo eliminando lo que no se usa y agregando 'fichaDatos'
  }, [open, modo, fichaDatos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = [
      "pot_nom_bomba_hp",
      "presion_descarga",
      "alt_elevacion_bomba",
      "vel_nom_bomba_rpm",
      "dimensiones_impulsor",
      "diametro_succion",
      "diametro_carga",
      "peso_bomba",
      "diametro_succion_cabezal",
      "diametro_descarga_cabezal",
    ];
    let val = value;
    if (numericFields.includes(name)) val = value === "" ? "" : Number(value);
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modo === "add") {
        await bombaService.addDetalleBomba(idBomba, formData);
        Swal.fire({
          icon: "success",
          title: "¡Ficha Registrada!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const origen = detalleSeleccionado;
        const ficha =
          origen?.data && Array.isArray(origen.data)
            ? origen.data[0]
            : Array.isArray(origen)
              ? origen[0]
              : origen;
        await bombaService.updateDetalleBomba(ficha.id_detalle_bomba, formData);
        Swal.fire({
          icon: "success",
          title: "¡Ficha Actualizada!",
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
        text: error.response?.data?.message || "Error al procesar",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary">
          {modo === "add"
            ? "📄 Registrar Ficha Técnica de Bomba"
            : editando
              ? "✏️ Modificar Ficha Técnica"
              : "📄 Ficha Técnica Avanzada - Bomba"}
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, bgcolor: "#f1f5f9" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary">
                Rendimiento y Capacidad
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Potencia (HP)"
                type="number"
                name="pot_nom_bomba_hp"
                value={formData.pot_nom_bomba_hp}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Presión (PSI)"
                type="number"
                name="presion_descarga"
                value={formData.presion_descarga}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Alt. Elevación (m)"
                type="number"
                name="alt_elevacion_bomba"
                value={formData.alt_elevacion_bomba}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Velocidad (RPM)"
                type="number"
                name="vel_nom_bomba_rpm"
                value={formData.vel_nom_bomba_rpm}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary">
                Dimensiones Físicas
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Impulsor (mm)"
                type="number"
                name="dimensiones_impulsor"
                value={formData.dimensiones_impulsor}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Ø Succión (pulg)"
                type="number"
                name="diametro_succion"
                value={formData.diametro_succion}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Ø Carga (pulg)"
                type="number"
                name="diametro_carga"
                value={formData.diametro_carga}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Peso (Kg)"
                type="number"
                name="peso_bomba"
                value={formData.peso_bomba}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary">
                Acople y Cabezal
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                disabled={!editando}
                label="Acoplamiento"
                name="acomplamiento"
                value={formData.acomplamiento}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value={1}>Sí (1)</MenuItem>
                <MenuItem value={0}>No (0)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Tipo de Acople"
                name="tipo_acople"
                value={formData.tipo_acople}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Tipo de Cabezal"
                name="tipo_cabezal"
                value={formData.tipo_cabezal}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Ø Succión Cabezal"
                type="number"
                name="diametro_succion_cabezal"
                value={formData.diametro_succion_cabezal}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary">
                Mecánica y Otros
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Ø Descarga Cabezal"
                type="number"
                name="diametro_descarga_cabezal"
                value={formData.diametro_descarga_cabezal}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                disabled={!editando}
                label="Lubricación"
                name="lubricacion"
                value={formData.lubricacion}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value={1}>Activada (1)</MenuItem>
                <MenuItem value={0}>Ninguna (0)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                disabled={!editando}
                label="Rodamiento"
                name="rodamiento"
                value={formData.rodamiento}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value={1}>Presente (1)</MenuItem>
                <MenuItem value={0}>Ausente (0)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                disabled={!editando}
                label="Uso / Detalle"
                name="detalle_bombacol"
                value={formData.detalle_bombacol}
                onChange={handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{ p: 2, bgcolor: "#f8fafc", justifyContent: "space-between" }}
        >
          <Box>
            {modo === "edit" && !editando && userRole === "admin" && (
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  onClose();
                  const origen = detalleSeleccionado;
                  const ficha =
                    origen?.data && Array.isArray(origen.data)
                      ? origen.data[0]
                      : Array.isArray(origen)
                        ? origen[0]
                        : origen;
                  handleEliminarFichaBomba(ficha.id_detalle_bomba);
                }}
              >
                Eliminar Ficha
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {modo === "edit" &&
              !editando &&
              (userRole === "admin" || userRole === "supervisor") && (
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<EditIcon />}
                  onClick={() => setEditando(true)}
                >
                  Modificar
                </Button>
              )}

            {editando ? (
              <>
                <Button
                  onClick={() =>
                    modo === "add" ? onClose() : setEditando(false)
                  }
                  color="secondary"
                  variant="outlined"
                >
                  Cancelar
                </Button>
                <Button type="submit" color="primary" variant="contained">
                  Guardar Ficha
                </Button>
              </>
            ) : (
              <Button onClick={onClose} color="secondary" variant="outlined">
                Cerrar
              </Button>
            )}
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
