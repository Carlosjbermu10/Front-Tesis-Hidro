import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";

// 🔗 Importamos el servicio que acabamos de crear
import dashboardService from "../services/dashboardService";

export default function Bitacora() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setCargando(true);
        const data = await dashboardService.obtenerBitacora();
        setEventos(data);
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo cargar el historial de operaciones.",
          confirmButtonColor: "#3085d6",
        });
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, []);

  // 🎨 Función para darle un color visual a la acción
  const getColorAccion = (accion) => {
    switch (accion?.toUpperCase()) {
      case "REGISTRAR":
        return "success"; // Verde
      case "MODIFICAR":
        return "warning"; // Naranja/Amarillo
      case "ELIMINAR":
        return "error"; // Rojo
      default:
        return "default"; // Gris
    }
  };

  // 📅 Función para que la fecha se vea bonita y entendible
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "Desconocida";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          Bitácora de Operaciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Historial de auditoría del sistema. Aquí se registran todos los
          movimientos y cambios realizados por los operadores.
        </Typography>
      </Box>

      {/* 🔄 Indicador de Carga */}
      {cargando ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{ borderRadius: 2 }}
        >
          <Table sx={{ minWidth: 800 }}>
            {/* 🏷️ Cabecera de la tabla */}
            <TableHead sx={{ backgroundColor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                  Fecha y Hora
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                  Usuario
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                  Acción
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                  Módulo
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
                  Descripción Detallada
                </TableCell>
              </TableRow>
            </TableHead>

            {/* 📝 Cuerpo de la tabla */}
            <TableBody>
              {eventos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      No hay registros en la bitácora aún.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                eventos.map((evento) => (
                  <TableRow key={evento.id_log} hover>
                    <TableCell>{formatearFecha(evento.fecha_hora)}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="#334155"
                      >
                        {evento.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {evento.nombre_completo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={evento.accion}
                        color={getColorAccion(evento.accion)}
                        size="small"
                        sx={{ fontWeight: "bold", minWidth: "90px" }}
                      />
                    </TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {evento.tabla_afectada.replace("_", " ")}
                    </TableCell>
                    <TableCell>{evento.descripcion}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
