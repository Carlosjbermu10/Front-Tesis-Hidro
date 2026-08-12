import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonIcon from "@mui/icons-material/Person";
import usuarioService from "../../services/usuarioService";
import UsuarioModal from "./UsuarioModal";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🌟 Estado que controla la apertura del modal
  const [modalOpen, setModalOpen] = useState(false);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await usuarioService.getUsuarios();
      setUsuarios(res.data || []);
    } catch (error) {
      console.error("Error al cargar la lista de usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🌟 Un pequeño respiro para el primer renderizado
    setTimeout(() => {
      cargarUsuarios();
    }, 0);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 5,
        }}
      >
        <CircularProgress color="primary" />
        <Typography sx={{ ml: 2 }} color="text.secondary">
          Cargando registros del sistema...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="text.primary"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <PersonIcon color="primary" fontSize="large" /> Panel de Control de
            Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lista de operadores, supervisores y administradores autorizados.
          </Typography>
        </Box>

        {/* 🟢 BOTÓN LIBERADO: Sin validación de rol temporal para forzar la prueba */}
        <Button
          variant="contained"
          color="success"
          startIcon={<GroupAddIcon />}
          onClick={() => {
            setModalOpen(true);
          }}
          sx={{ fontWeight: "bold", textTransform: "none" }}
        >
          Registrar Usuario
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "#f1f5f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Nombre Completo</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Nombre de Usuario
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Rol Asignado</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Estatus</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Fecha de Registro
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((user) => (
              <TableRow
                key={user.id_usuario}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": { bgcolor: "#f8fafc" },
                }}
              >
                <TableCell component="th" scope="row" fontWeight="medium">
                  {user.nombre_completo}
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Chip
                    label={user.rol?.toUpperCase()}
                    color={
                      user.rol === "admin"
                        ? "error"
                        : user.rol === "supervisor"
                          ? "warning"
                          : "primary"
                    }
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.estado === 1 ? "Activo" : "Inactivo"}
                    color={user.estado === 1 ? "success" : "default"}
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </TableCell>
                <TableCell color="text.secondary">
                  {new Date(user.created_at).toLocaleDateString("es-VE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
            {usuarios.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 4, color: "text.secondary", fontStyle: "italic" }}
                >
                  No hay usuarios registrados en la base de datos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 🌟 FORMULARIO MODAL VINCULADO */}
      <UsuarioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={cargarUsuarios}
      />
    </Box>
  );
}
