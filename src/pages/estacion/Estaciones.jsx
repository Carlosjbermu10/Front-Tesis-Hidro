import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Button,
  Chip,
  CircularProgress,
  Alert,
  DialogTitle,
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  DialogActions,
  Tooltip,
  Menu,
  IconButton,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  RestoreFromTrash as ReactivarIcon,
  VisibilityOff as InactivaIcon,
} from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Swal from "sweetalert2";
import { estacionService } from "../../services/estacionService";

const Estaciones = () => {
  const navigate = useNavigate();
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null);

  // 🔄 Estado para alternar entre Activas e Inactivas
  const [mostrarInactivas, setMostrarInactivas] = useState(false);

  // 📝 Estados para Modal de Registro (POST)
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre_sistema: "",
    nombre_est: "",
    tipo_est: "",
    tipo_succion: 1,
  });

  // 📝 Estados para Modal de Edición (PUT)
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    codigo: "",
    nombre_sistema: "",
    nombre_est: "",
    tipo_est: "",
    tipo_succion: 1,
  });

  const [submitting, setSubmitting] = useState(false);

  // Estados para el Enfoque Híbrido (Menú de acciones secundarias)
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuEstacion, setMenuEstacion] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event, estacion) => {
    setAnchorEl(event.currentTarget);
    setMenuEstacion(estacion);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuEstacion(null);
  };

  // 📥 Obtener Estaciones (Activas o Inactivas según parámetro)
  const cargarEstaciones = useCallback(
    async (verInactivas = mostrarInactivas) => {
      try {
        setLoading(true);
        setError("");
        const data = verInactivas
          ? await estacionService.getInhabilitadas()
          : await estacionService.getAll();
        const arregloFinal = Array.isArray(data) ? data : data.data || [];
        setEstaciones(arregloFinal);
      } catch (err) {
        console.error(err);
        setError(
          verInactivas
            ? "No se pudo conectar con el servidor para cargar las estaciones inactivas."
            : "No se pudo conectar con el servidor para cargar las estaciones activas.",
        );
      } finally {
        setLoading(false);
      }
    },
    [mostrarInactivas],
  );

  // 🔌 Cargar datos al montar el componente
  useEffect(() => {
    const inicializarPantalla = async () => {
      try {
        const usuarioData = localStorage.getItem("user") || "";
        if (usuarioData) {
          const usuarioObjeto = JSON.parse(usuarioData);
          setUserRole(usuarioObjeto.rol);
        }
      } catch (err) {
        console.error("Error al parsear el usuario del localStorage:", err);
      }

      await cargarEstaciones();
    };

    inicializarPantalla();
  }, [cargarEstaciones]);

  // 🔄 Alternar vista Activas / Inactivas
  const handleToggleInactivas = () => {
    const nuevoEstado = !mostrarInactivas;
    setMostrarInactivas(nuevoEstado);
    cargarEstaciones(nuevoEstado);
  };

  const handleGestionar = (id_est) => {
    navigate(`/estacion/gestion/${id_est}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Guardar Nueva Estación
  const handleGuardarEstacion = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await estacionService.create(formData);
      const nombreRegistrado = formData.nombre_est;

      setOpenModal(false);
      setFormData({
        codigo: "",
        nombre_sistema: "",
        nombre_est: "",
        tipo_est: "",
        tipo_succion: 1,
      });

      await cargarEstaciones(mostrarInactivas);

      await Swal.fire({
        title: "¡Registro Exitoso!",
        text: `La estación de bombeo "${nombreRegistrado}" ha sido registrada con éxito.`,
        icon: "success",
        confirmButtonColor: "#0284c7",
        confirmButtonText: "Entendido",
      });
    } catch (err) {
      console.error("Error al registrar estación:", err);
      Swal.fire({
        title: err.response?.data?.title || "Error al Registrar",
        text:
          err.response?.data?.description ||
          "Hubo un error al registrar la estación de bombeo.",
        icon: "error",
        confirmButtonColor: "#64748b",
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = "9999";
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 🟢 Abrir Modal Edición
  const handleAbrirEditar = (estacion) => {
    setEditId(estacion.id_est);
    setEditFormData({
      codigo: estacion.codigo || "",
      nombre_sistema: estacion.nombre_sistema || "",
      nombre_est: estacion.nombre_est || "",
      tipo_est: estacion.tipo_est || "",
      tipo_succion: estacion.tipo_succion ?? 1,
    });
    setOpenEditModal(true);
  };

  // 🔵 Actualizar Estación
  const handleUpdateEstacion = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await estacionService.update(editId, editFormData);
      const nombreActualizado = editFormData.nombre_est || "la estación";

      setOpenEditModal(false);
      await cargarEstaciones(mostrarInactivas);

      await Swal.fire({
        title: "¡Actualización Exitosa!",
        text: `La estación de bombeo "${nombreActualizado}" ha sido actualizada correctamente.`,
        icon: "success",
        confirmButtonColor: "#0284c7",
        confirmButtonText: "Entendido",
      });
    } catch (err) {
      console.error("Error al actualizar:", err);
      Swal.fire({
        title: err.response?.data?.title || "Error al Actualizar",
        text:
          err.response?.data?.description ||
          "No se pudieron guardar los cambios.",
        icon: "error",
        confirmButtonColor: "#64748b",
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = "9999";
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 🟡 Deshabilitar Estación (SOLO ADMIN)
  const handleEliminar = async (id_est, nombre_est) => {
    const result = await Swal.fire({
      title: `¿Estás seguro de deshabilitar "${nombre_est}"?`,
      text: "La estación pasará al registro histórico. Todos sus componentes, fotos y líneas de bombeo se conservarán intactos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#607d8b",
      confirmButtonText: "Sí, deshabilitar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await estacionService.deshabilitar(id_est);

      await Swal.fire({
        title: "¡Deshabilitada!",
        text: `La estación de bombeo "${nombre_est}" ha sido movida al histórico correctamente.`,
        icon: "success",
        confirmButtonColor: "#0284c7",
      });

      await cargarEstaciones(mostrarInactivas);
    } catch (error) {
      console.error("Error al deshabilitar la estación:", error);
      Swal.fire({
        title: error.response?.data?.title || "Error operativo",
        text:
          error.response?.data?.description ||
          "Hubo un error al intentar deshabilitar la estación.",
        icon: "error",
        confirmButtonColor: "#64748b",
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = "9999";
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Reactivar Estación Inactiva (SOLO ADMIN)
  const handleReactivar = async (id_est, nombre_est) => {
    const result = await Swal.fire({
      title: `¿Deseas reactivar "${nombre_est}"?`,
      text: "La estación volverá a estar disponible en el listado principal de estaciones operativas.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0284c7",
      cancelButtonColor: "#607d8b",
      confirmButtonText: "Sí, reactivar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await estacionService.reactivar(id_est);

      await Swal.fire({
        title: "¡Reactivada!",
        text: `La estación de bombeo "${nombre_est}" ha sido reactivada con éxito.`,
        icon: "success",
        confirmButtonColor: "#0284c7",
      });

      await cargarEstaciones(mostrarInactivas);
    } catch (error) {
      console.error("Error al reactivar la estación:", error);
      Swal.fire({
        title: error.response?.data?.title || "Error operativo",
        text:
          error.response?.data?.description ||
          "Hubo un error al intentar reactivar la estación.",
        icon: "error",
        confirmButtonColor: "#64748b",
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = "9999";
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            color={mostrarInactivas ? "warning.main" : "primary.main"}
          >
            {mostrarInactivas
              ? "Estaciones Inactivas (Histórico)"
              : "Estaciones de Bombeo"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mostrarInactivas
              ? "Consulta y reactivación de plantas e instalaciones fuera de servicio."
              : "Gestión de plantas de captación, líneas de conducción y sistemas técnicos."}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            ml: { xs: 0, sm: "auto" }, // Quita el margen izquierdo automático en móviles
            width: { xs: "100%", sm: "auto" }, // Ocupa todo el ancho en móviles
            flexWrap: { xs: "wrap", sm: "nowrap" }, // Permite que los botones bajen de línea si no caben
            justifyContent: { xs: "center", sm: "flex-end" }, // Los centra en móviles
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => cargarEstaciones(mostrarInactivas)}
            size="small"
          >
            Actualizar
          </Button>

          {/* Botón para alternar entre Estaciones Activas e Inactivas */}
          <Button
            variant={mostrarInactivas ? "contained" : "outlined"}
            color={mostrarInactivas ? "warning" : "inherit"}
            startIcon={<InactivaIcon />}
            onClick={handleToggleInactivas}
            size="small"
            sx={{ fontWeight: "bold", textTransform: "none" }}
          >
            {mostrarInactivas ? "Ver Activas" : "Ver Inactivas"}
          </Button>

          {!mostrarInactivas &&
            (userRole === "admin" || userRole === "supervisor") && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenModal(true)}
                size="small"
                sx={{ fontWeight: "bold", textTransform: "none" }}
              >
                Nueva Estación
              </Button>
            )}
        </Box>
      </Box>

      {/* Estados de carga/error */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      {/* Modal Crear (POST) */}
      <Dialog
        open={openModal}
        onClose={() => !submitting && setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: "0px 10px 30px rgba(0,0,0,0.1)" },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            pt: 3,
            pb: 1,
            fontSize: "1.4rem",
          }}
        >
          Registrar Nueva Estación de Bombeo
        </DialogTitle>
        <Box component="form" onSubmit={handleGuardarEstacion} noValidate>
          <DialogContent dividers sx={{ p: 3, backgroundColor: "#f8fafc" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <TextField
                  label="Código Identificador"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  placeholder="Ej: COD-003"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    flex: { xs: "1 1 100%", sm: "1 1 40%" },
                    backgroundColor: "#ffffff",
                  }}
                />
                <TextField
                  label="Nombre de la Estación"
                  name="nombre_est"
                  value={formData.nombre_est}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  placeholder="Ej: EB Carujo"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    flex: { xs: "1 1 100%", sm: "1 1 60%" },
                    backgroundColor: "#ffffff",
                  }}
                />
              </Box>

              <TextField
                label="Sistema Hidráulico"
                name="nombre_sistema"
                value={formData.nombre_sistema}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                placeholder="Ej: Tumiriquire"
                InputLabelProps={{ shrink: true }}
                sx={{ backgroundColor: "#ffffff" }}
              />

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <TextField
                  select
                  label="Tipo de Estación de Bombeo"
                  name="tipo_est"
                  value={formData.tipo_est}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: "1 1 50%", backgroundColor: "#ffffff" }}
                >
                  <MenuItem value="Principal">Principal</MenuItem>
                  <MenuItem value="Distribución">Distribución</MenuItem>
                  <MenuItem value="Secundario">Secundario</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Tipo de Succión"
                  name="tipo_succion"
                  value={formData.tipo_succion}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: "1 1 50%", backgroundColor: "#ffffff" }}
                >
                  <MenuItem value={1}>Positiva</MenuItem>
                  <MenuItem value={0}>Negativa</MenuItem>
                </TextField>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              p: 2.5,
              backgroundColor: "#ffffff",
              gap: 1.5,
              flexDirection: { xs: "column", sm: "row" }, // Columna en móviles, Fila en PC
              "& > button": { width: { xs: "100%", sm: "auto" } }, // Botones al 100% solo en móvil
            }}
          >
            <Button
              onClick={() => setOpenModal(false)}
              disabled={submitting}
              variant="outlined"
              color="inherit"
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                px: 3,
                borderRadius: 2,
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                px: 4,
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              {submitting ? "Guardando..." : "Registrar Estación"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Modal Editar (PUT) */}
      <Dialog
        open={openEditModal}
        onClose={() => !submitting && setOpenEditModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{ fontWeight: "bold", color: "info.main", pt: 3, pb: 1 }}
        >
          Modificar Estación de Bombeo
        </DialogTitle>
        <Box component="form" onSubmit={handleUpdateEstacion} noValidate>
          <DialogContent dividers sx={{ p: 3, backgroundColor: "#f8fafc" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Código Identificador"
                  name="codigo"
                  fullWidth
                  value={editFormData.codigo}
                  onChange={handleEditChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                />
                <TextField
                  label="Nombre de la Estación"
                  name="nombre_est"
                  fullWidth
                  value={editFormData.nombre_est}
                  onChange={handleEditChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                />
              </Box>

              <TextField
                label="Sistema Hidráulico"
                name="nombre_sistema"
                fullWidth
                value={editFormData.nombre_sistema}
                onChange={handleEditChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ backgroundColor: "#ffffff" }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  select
                  label="Tipo de Estación"
                  name="tipo_est"
                  fullWidth
                  value={editFormData.tipo_est}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                >
                  <MenuItem value="Principal">Principal</MenuItem>
                  <MenuItem value="Distribución">Distribución</MenuItem>
                  <MenuItem value="Secundario">Secundario</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Tipo de Succión"
                  name="tipo_succion"
                  fullWidth
                  value={editFormData.tipo_succion}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                >
                  <MenuItem value={1}>Positiva</MenuItem>
                  <MenuItem value={0}>Negativa</MenuItem>
                </TextField>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              p: 2.5,
              backgroundColor: "#ffffff",
              gap: 1.5,
              flexDirection: { xs: "column", sm: "row" }, // Columna en móviles, Fila en PC
              "& > button": { width: { xs: "100%", sm: "auto" } }, // Botones al 100% solo en móvil
            }}
          >
            <Button
              onClick={() => setOpenEditModal(false)}
              color="inherit"
              disabled={submitting}
              sx={{ fontWeight: "bold" }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="info"
              disabled={submitting}
              sx={{ fontWeight: "bold", px: 4 }}
            >
              {submitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Tabla de Datos */}
      {!loading && !error && (
        <TableContainer
          component={Paper}
          sx={{ boxShadow: 2, borderRadius: 2 }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="tabla estaciones">
            <TableHead
              sx={{ backgroundColor: "#f8fafc", whiteSpace: "nowrap" }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Nombre de la Estación
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Nombre del Sistema
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Tipo de Estación
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Tipo de Succión
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Estado Técnico
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estaciones.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 3, color: "text.secondary" }}
                  >
                    {mostrarInactivas
                      ? "No se encontraron estaciones inactivas o deshabilitadas."
                      : "No se encontraron estaciones registradas en la base de datos."}
                  </TableCell>
                </TableRow>
              ) : (
                estaciones.map((estacion) => (
                  <TableRow key={estacion.id_est} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {estacion.nombre_est}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {estacion.codigo}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.primary">
                        {estacion.nombre_sistema || "No asignado"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {estacion.tipo_est}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          estacion.tipo_succion === 1 ? "Positiva" : "Negativa"
                        }
                        color={
                          estacion.tipo_succion === 1 ? "primary" : "warning"
                        }
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={mostrarInactivas ? "Inactiva" : "Operativa"}
                        color={mostrarInactivas ? "default" : "success"}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1.5,
                        }}
                      >
                        {/* VISTA PARA ESTACIONES INACTIVAS (Se mantiene igual, es una sola acción) */}
                        {mostrarInactivas ? (
                          <>
                            {userRole === "admin" && (
                              <Button
                                variant="text"
                                color="success"
                                size="small"
                                startIcon={
                                  <ReactivarIcon sx={{ fontSize: 18 }} />
                                }
                                disabled={loading}
                                onClick={() =>
                                  handleReactivar(
                                    estacion.id_est,
                                    estacion.nombre_est,
                                  )
                                }
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 600,
                                  borderRadius: 1.5,
                                }}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    display: { xs: "none", sm: "inline" },
                                  }}
                                >
                                  Reactivar
                                </Box>
                              </Button>
                            )}
                            {(userRole === "operador" ||
                              userRole === "supervisor") && (
                              <Tooltip
                                title="Se requiere rol de Administrador para reactivar"
                                arrow
                                placement="top"
                              >
                                <span>
                                  <Button
                                    variant="text"
                                    size="small"
                                    disabled
                                    startIcon={
                                      <ReactivarIcon sx={{ fontSize: 18 }} />
                                    }
                                    sx={{
                                      textTransform: "none",
                                      fontWeight: 500,
                                    }}
                                  >
                                    <Box
                                      component="span"
                                      sx={{
                                        display: { xs: "none", sm: "inline" },
                                      }}
                                    >
                                      Reactivar
                                    </Box>
                                  </Button>
                                </span>
                              </Tooltip>
                            )}
                          </>
                        ) : (
                          /* VISTA PARA ESTACIONES ACTIVAS (Enfoque Híbrido) */
                          <>
                            {/* Acción Principal Visible */}
                            {(userRole === "admin" ||
                              userRole === "supervisor") && (
                              <Button
                                variant="text"
                                size="small"
                                startIcon={<ViewIcon sx={{ fontSize: 18 }} />}
                                onClick={() => handleGestionar(estacion.id_est)}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 600,
                                  color: "primary.main",
                                  borderRadius: 1.5,
                                  "&:hover": {
                                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                                  },
                                }}
                              >
                                <Box
                                  component="span"
                                  sx={{ display: { xs: "none", sm: "inline" } }}
                                >
                                  Gestionar
                                </Box>
                              </Button>
                            )}

                            {userRole === "operador" && (
                              <Button
                                variant="text"
                                color="primary"
                                size="small"
                                startIcon={<ViewIcon sx={{ fontSize: 18 }} />}
                                onClick={() => handleGestionar(estacion.id_est)}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 600,
                                  borderRadius: 1.5,
                                }}
                              >
                                <Box
                                  component="span"
                                  sx={{ display: { xs: "none", sm: "inline" } }}
                                >
                                  Consultar
                                </Box>
                              </Button>
                            )}

                            {/* Botón de opciones secundarias (solo para roles con permisos) */}
                            {(userRole === "admin" ||
                              userRole === "supervisor") && (
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, estacion)}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Menú Desplegable (Enfoque Híbrido) para acciones secundarias */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: 140,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {(userRole === "admin" || userRole === "supervisor") && (
          <MenuItem
            onClick={() => {
              handleAbrirEditar(menuEstacion);
              handleMenuClose();
            }}
            sx={{ fontSize: "0.875rem", fontWeight: 500 }}
          >
            <EditIcon sx={{ fontSize: 18, mr: 1.5, color: "info.main" }} />
            Modificar
          </MenuItem>
        )}

        {userRole === "admin" && (
          <MenuItem
            onClick={() => {
              handleEliminar(menuEstacion.id_est, menuEstacion.nombre_est);
              handleMenuClose();
            }}
            disabled={loading}
            sx={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "warning.main",
            }}
          >
            <DeleteIcon sx={{ fontSize: 18, mr: 1.5, color: "inherit" }} />
            Deshabilitar
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default Estaciones;
