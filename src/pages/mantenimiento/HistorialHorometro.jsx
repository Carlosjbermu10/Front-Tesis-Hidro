// src/pages/HistorialHorometro.jsx
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { mantenimientoService } from "../../services/mantenimientoService.js";
import { ModalRegistrarHorometro } from "./ModalRegistrarHorometro.jsx";

export const HistorialHorometro = ({ tipo_equipo, equipo_id }) => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(!!(tipo_equipo && equipo_id));
  const [error, setError] = useState(null);

  // Estados para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [recargar, setRecargar] = useState(false);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await mantenimientoService.getHistorialHorometro(
          tipo_equipo,
          equipo_id,
        );
        const dataReal = res?.data ? res.data : res;

        if (Array.isArray(dataReal)) {
          setRegistros(dataReal);
        } else {
          setRegistros([]);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setRegistros([]);
        } else {
          setError(
            "No se pudo conectar con el servidor para obtener los horómetros.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (tipo_equipo && equipo_id) {
      cargarHistorial();
    }
  }, [tipo_equipo, equipo_id, recargar]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box my={4}>
      {" "}
      {/* 💡 Aumentamos el margen superior/inferior general */}
      {/* 💡 CAJA DEL ENCABEZADO FORZADA A LOS EXTREMOS */}
      <Box
        display="flex"
        flexDirection="row" // 💡 Forzamos a que SIEMPRE sea una fila horizontal (nada de apilarse)
        justifyContent="space-between" // 💡 Título a la extrema izquierda, botón a la extrema derecha
        alignItems="center" // 💡 Los centra verticalmente para que queden alineados
        width="100%" // 💡 Obliga al contenedor a estirarse hasta el borde derecho
        mb={3}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Registro de Horas Operativas (Horómetro)
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{ px: 3, py: 1, boxShadow: 3 }}
        >
          Añadir Lectura
        </Button>
      </Box>
      {registros.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay lecturas de horómetro registradas para este equipo.
        </Alert>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ boxShadow: 1 }}
        >
          <Table aria-label="tabla de horometros">
            <TableHead sx={{ backgroundColor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>ID Registro</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Fecha y Hora de Lectura
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Horas Acumuladas
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registros.map((row) => (
                <TableRow key={row.id_registro} hover>
                  <TableCell>#{row.id_registro}</TableCell>
                  <TableCell>
                    {new Date(row.fecha_lectura).toLocaleString()}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#1976d2",
                      fontSize: "1.05rem",
                    }}
                  >
                    {row.horas_acumuladas} h
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Modal para registrar una nueva lectura */}
      <ModalRegistrarHorometro
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        tipo_equipo={tipo_equipo}
        equipo_id={equipo_id}
        onSuccess={() => setRecargar(!recargar)}
      />
    </Box>
  );
};
