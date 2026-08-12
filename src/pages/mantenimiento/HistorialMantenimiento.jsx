// src/pages/HistorialMantenimiento.jsx
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { mantenimientoService } from "../../services/mantenimientoService.js";
import { ModalEditarMantenimiento } from "./ModalEditarMantenimiento.jsx";

const getEstadoStyles = (estado) => {
  switch (estado) {
    case "COMPLETADO":
      return { label: "Completado", color: "success" };
    case "EN_PROGRESO":
      return { label: "En Progreso", color: "warning" };
    case "CANCELADO":
      return { label: "Cancelado", color: "error" };
    default:
      return { label: "Programado", color: "info" };
  }
};

const getCriticidadColor = (criticidad) => {
  switch (criticidad) {
    case "CRITICA":
      return "error";
    case "ALTA":
      return "warning";
    case "MEDIA":
      return "primary";
    default:
      return "default";
  }
};

export const HistorialMantenimiento = ({ tipo_equipo, equipo_id }) => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(!!(tipo_equipo && equipo_id));
  const [error, setError] = useState(null);

  // Estados para manejar el modal de edición
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  // 💡 Estado "switch" para recargar la tabla sin romper dependencias
  const [recargar, setRecargar] = useState(false);

  // 💡 El useEffect ahora envuelve la función cargarHistorial por completo
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await mantenimientoService.getHistorialMantenimiento(
          tipo_equipo,
          equipo_id,
        );
        const dataReal = res?.data ? res : res;

        if (dataReal && (dataReal.status === "ok" || Array.isArray(dataReal))) {
          setOrdenes(Array.isArray(dataReal) ? dataReal : dataReal.data);
        } else {
          setOrdenes([]);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setOrdenes([]);
        } else {
          setError("No se pudo conectar con el servidor de mantenimiento.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (tipo_equipo && equipo_id) {
      cargarHistorial();
    }
  }, [tipo_equipo, equipo_id, recargar]); // 💡 Añadimos "recargar" al arreglo de dependencias

  // Función que se dispara al presionar el lápiz
  const handleOpenEdit = (orden) => {
    setOrdenSeleccionada(orden);
    setModalEditOpen(true);
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (ordenes.length === 0)
    return (
      <Alert severity="info">
        No hay órdenes de trabajo registradas para este activo.
      </Alert>
    );

  return (
    <Box my={2}>
      <Typography
        variant="h6"
        gutterBottom
        component="div"
        sx={{ fontWeight: "bold" }}
      >
        Historial de Órdenes de Trabajo y Mantenimiento
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="tabla de mantenimiento">
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>ID OT</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Criticidad</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Fecha Programada
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Descripción / Diagnóstico
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordenes.map((orden) => {
              const estadoStyle = getEstadoStyles(orden.estado);
              return (
                <TableRow key={orden.id_orden} hover>
                  <TableCell>#{orden.id_orden}</TableCell>
                  <TableCell>{orden.tipo_mantenimiento}</TableCell>
                  <TableCell>
                    <Chip
                      label={orden.criticidad}
                      color={getCriticidadColor(orden.criticidad)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={estadoStyle.label}
                      color={estadoStyle.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(orden.fecha_programada).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    style={{
                      maxWidth: 300,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {orden.descripcion_falla || "Sin descripción registrada."}
                  </TableCell>

                  {/* Columna nueva de Acción */}
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEdit(orden)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 💡 Renderizamos el modal de edición */}
      <ModalEditarMantenimiento
        key={ordenSeleccionada ? ordenSeleccionada.id_orden : "modal-vacio"}
        open={modalEditOpen}
        handleClose={() => setModalEditOpen(false)}
        orden={ordenSeleccionada}
        onSuccess={() => setRecargar(!recargar)} // 💡 Al cambiar este estado, el useEffect de arriba se dispara y recarga la tabla
      />
    </Box>
  );
};
