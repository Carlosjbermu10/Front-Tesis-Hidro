import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Switch,
} from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonIcon from "@mui/icons-material/Person";
import Swal from "sweetalert2";
import usuarioService from "../../services/usuarioService";
import UsuarioModal from "./UsuarioModal";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 👤 Recuperamos los datos del usuario logueado desde el localStorage
  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : {};

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

  // 🧠 LÓGICA: Determina si el Switch debe estar deshabilitado
  const isActionDisabled = (row) => {
    // 1. Si el usuario actual no es admin, bloqueamos todo
    if (userData?.rol !== "admin") return true;

    // 2. Si la fila es un admin, ES OTRA PERSONA, y está ACTIVO: Bloqueamos
    if (
      row.rol === "admin" &&
      row.username !== userData.username &&
      row.estado === 1
    ) {
      return true;
    }

    // De lo contrario, permitimos la acción
    return false;
  };

  // 🚀 ACCIÓN: Función que se ejecuta al hacer clic en el Switch
  const handleToggleEstatus = async (userFila) => {
    const isActivo = userFila.estado === 1;
    const nuevoEstado = isActivo ? 0 : 1;
    const accionTxt = isActivo ? "desactivar" : "activar";

    // 🧠 Detectamos si el administrador se está desactivando a sí mismo
    const isSelfDeactivation =
      userFila.username === userData.username && nuevoEstado === 0;

    // Pedimos confirmación antes de disparar al backend
    const confirmacion = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Vas a ${accionTxt} el acceso de ${userFila.nombre_completo}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isActivo ? "#d33" : "#10b981", // Rojo para desactivar, verde para activar
      cancelButtonColor: "#64748b",
      confirmButtonText: `Sí, ${accionTxt}`,
      cancelButtonText: "Cancelar",
    });

    if (confirmacion.isConfirmed) {
      try {
        setLoading(true); // Opcional: mostrar un loader mientras procesa

        await usuarioService.toggleEstadoUsuario(userFila.id_usuario, {
          estado: nuevoEstado,
        });

        // Si se autodesactivó, lo expulsamos del sistema inmediatamente
        if (isSelfDeactivation) {
          localStorage.removeItem("user");
          localStorage.removeItem("token"); // Ajusta esto si tu token se llama distinto
          navigate("/login");
          return; // Detenemos la ejecución aquí
        }

        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: `El usuario ha sido ${isActivo ? "desactivado" : "activado"} correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });

        // Si el admin se acaba de desactivar a sí mismo, podrías cerrar su sesión aquí
        if (userFila.username === userData.username && nuevoEstado === 0) {
          // localStorage.removeItem("user");
          // localStorage.removeItem("token");
          // window.location.href = "/login";
        } else {
          cargarUsuarios(); // Recargamos la tabla para ver el cambio
        }
      } catch (error) {
        console.error("Error cambiando estado:", error);
        // 🚨 Aquí atrapamos el mensaje ultra específico que envía el Backend
        const mensajeError =
          error.response?.data?.description ||
          "Hubo un problema al actualizar el estatus.";

        Swal.fire({
          icon: "error",
          title: "Acción denegada",
          text: mensajeError, // Se mostrará exactamente por qué falló
        });
      } finally {
        setLoading(false);
      }
    }
  };

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

        {/* 🔒 BOTÓN PROTEGIDO: Solo visible si el rol es administrador */}
        {userData?.rol === "admin" && (
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
        )}
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={user.estado === 1 ? "Activo" : "Inactivo"}
                      color={user.estado === 1 ? "success" : "error"}
                      variant={user.estado === 1 ? "outlined" : "filled"}
                      size="small"
                      sx={{ fontWeight: "bold", width: "75px" }} // width fijo para que no salte al cambiar texto
                    />
                    <Switch
                      checked={user.estado === 1}
                      onChange={() => handleToggleEstatus(user)}
                      disabled={isActionDisabled(user)}
                      color={user.estado === 1 ? "success" : "default"}
                      size="small"
                    />
                  </Box>
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
