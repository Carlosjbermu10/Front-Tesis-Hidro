import { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { estacionService } from "../../services/estacionService";

const Estaciones = () => {
  const navigate = useNavigate();
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Función para obtener el rol de forma segura
    const obtenerRol = () => {
      try {
        const usuarioData = localStorage.getItem("user") || "";
        if (usuarioData) {
          const usuarioObjeto = JSON.parse(usuarioData);
          setUserRole(usuarioObjeto.rol);
        }
      } catch (error) {
        console.error("Error al parsear el usuario del localStorage:", error);
      }
    };

    obtenerRol();
  }, []); // Se ejecuta inmediatamente al montar el componente

  // 📝 Estados para el Modal de Registro (POST)
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre_sistema: "",
    nombre_est: "",
    tipo_est: "",
    tipo_succion: 1, // Por defecto 1 (Positiva)
  });
  const [submitting, setSubmitting] = useState(false);

  // 📝 Estados para el Modal la Modificacion (PUT)
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editId, setEditId] = useState(null); // Para saber cuál estamos editando
  const [editFormData, setEditFormData] = useState({
    codigo: "",
    nombre_sistema: "",
    nombre_est: "",
    tipo_est: "",
    tipo_succion: 1,
  });

  const handleGestionar = (id_est) => {
    console.log("Redirigiendo a la gestión de la estación ID:", id_est);
    // Te va a llevar a la ruta de gestión de esa estación específica
    navigate(`/estacion/gestion/${id_est}`);
  };

  const cargarEstaciones = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await estacionService.getAll();

      // Extraemos los datos usando la estructura que sí te funciona (.data)
      const arregloFinal = Array.isArray(data) ? data : data.data || [];
      setEstaciones(arregloFinal);
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo conectar con el servidor para cargar las estaciones.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔌 2. EFECTO DE MONTAJE (Solo llama a la función unificada al abrir la pantalla)
  useEffect(() => {
    const inicializarPantalla = async () => {
      await cargarEstaciones();
    };

    inicializarPantalla();
  }, []);

  // ✍️ 3. MANEJADOR DE CAMBIOS EN LOS INPUTS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 💾 4. ENVIAR EL FORMULARIO POST AL BACKEND
  const handleGuardarEstacion = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // 1. Enviamos el formData al backend
      await estacionService.create(formData);

      // Guardamos el nombre temporalmente antes de limpiar el formulario para usarlo en la alerta
      const nombreRegistrado = formData.nombre_est;

      // 2. Si todo sale bien, cerramos el modal y limpiamos los campos de inmediato
      // Esto hace que la interfaz se actualice de fondo mientras aparece el éxito
      setOpenModal(false);
      setFormData({
        codigo: "",
        nombre_sistema: "",
        nombre_est: "",
        tipo_est: "",
        tipo_succion: 1,
      });

      // 3. Refrescamos la tabla automáticamente en segundo plano
      await cargarEstaciones();

      // 4. 🎉 Notificación de Éxito con SweetAlert2
      await Swal.fire({
        title: "¡Registro Exitoso!",
        text: `La estación de bombeo "${nombreRegistrado}" ha sido registrada con éxito.`,
        icon: "success",
        confirmButtonColor: "#0284c7", // Color azul primario institucional
        confirmButtonText: "Entendido",
      });
    } catch (err) {
      console.error("Error al registrar estación:", err);

      // 5. ❌ Notificación de Error con SweetAlert2
      Swal.fire({
        title: "Error de Guardado",
        text: "Hubo un error al registrar la estación de bombeo. Por favor, verifique los datos.",
        icon: "error",
        confirmButtonColor: "#64748b", // Gris neutro para el botón de cerrar
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id_est, nombre_est) => {
    // 1. 🖼️ Mostrar el modal de confirmación personalizado de SweetAlert2
    const result = await Swal.fire({
      title: `¿Estás seguro de eliminar "${nombre_est}"?`,
      text: "Esta acción es irreversible y podría afectar los datos asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f", // El color rojo de tu botón "Sí, eliminar"
      cancelButtonColor: "#607d8b", // El color gris de tu botón "Cancelar"
      confirmButtonText: "Sí, eliminar de inmediato",
      cancelButtonText: "Cancelar",
      reverseButtons: false, // Mantiene el orden de los botones tal como los tienes
    });

    // Si el usuario presiona "Cancelar" o cierra el modal, detenemos la ejecución
    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      // Ejecutamos la petición al backend
      await estacionService.delete(id_est);

      // 2. 🎉 Mensaje de Éxito con SweetAlert2
      await Swal.fire({
        title: "¡Eliminado!",
        text: `La estación de bombeo "${nombre_est}" ha sido eliminada con éxito.`,
        icon: "success",
        confirmButtonColor: "#0284c7", // Un color azul o verde para el botón de aceptar
      });

      // Volvemos a consultar la base de datos para actualizar la tabla en tiempo real
      await cargarEstaciones();
    } catch (err) {
      console.error("Error al eliminar la estación:", err);

      // 3. ❌ Mensaje de Error con SweetAlert2
      Swal.fire({
        title: "Error operativo",
        text: "Hubo un error al intentar eliminar la estación de bombeo.",
        icon: "error",
        confirmButtonColor: "#64748b",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Abre el modal y rellena los campos con la info de la tabla
  const handleAbrirEditar = (estacion) => {
    setEditId(estacion.id_est);
    setEditFormData({
      codigo: estacion.codigo || "",
      nombre_sistema: estacion.nombre_sistema || "",
      nombre_est: estacion.nombre_est || "",
      tipo_est: estacion.tipo_est || "",
      tipo_succion: estacion.tipo_succion || 1,
    });
    setOpenEditModal(true);
  };

  // 🔵 Envía los cambios al Backend (PUT) con SweetAlert2
  const handleUpdateEstacion = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // 1. Enviamos los cambios al backend con el servicio PUT
      await estacionService.update(editId, editFormData);

      // Capturamos el nombre modificado para personalizar la alerta
      const nombreActualizado = editFormData.nombre_est || "la estación";

      // 2. Cerramos el modal de edición de inmediato
      setOpenEditModal(false);

      // 3. Refrescamos la tabla en segundo plano
      await cargarEstaciones();

      // 4. 🎉 Notificación de Éxito con SweetAlert2
      await Swal.fire({
        title: "¡Actualización Exitosa!",
        text: `La estación de bombeo "${nombreActualizado}" ha sido actualizada correctamente.`,
        icon: "success",
        confirmButtonColor: "#0284c7", // Azul institucional uniforme
        confirmButtonText: "Entendido",
      });
    } catch (err) {
      console.error("Error al actualizar:", err);

      // 5. ❌ Notificación de Error con SweetAlert2
      Swal.fire({
        title: "Error al Actualizar",
        text: "No se pudieron guardar los cambios de la estación de bombeo. Inténtelo de nuevo.",
        icon: "error",
        confirmButtonColor: "#64748b", // Gris neutro de escape
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado de la Sección */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            Estaciones de Bombeo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de plantas de captación, líneas de conducción y sistemas
            técnicos.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={cargarEstaciones}
            size="small"
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            size="small"
            sx={{ fontWeight: "bold", textTransform: "none" }}
          >
            Nueva Estación
          </Button>
        </Box>
      </Box>
      {/* Manejo de estados (Cargando o Error) */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      {/* 📥 MODAL FORMULARIO (POST) */}
      <Dialog
        open={openModal}
        onClose={() => !submitting && setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
          },
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
              {/* Fila 1: Código y Nombre */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <TextField
                  label="Código Identificador" // 👈 Asegúrate de que tenga esto
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
                  label="Nombre de la Estación" // 👈 Asegúrate de que tenga esto
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

              {/* Fila 2: Sistema Hidráulico */}
              <TextField
                label="Sistema Hidráulico" // 👈 Asegúrate de que tenga esto
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

              {/* Fila 3: Selectores */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <TextField
                  select
                  label="Tipo de Estación de Bombeo" // 👈 Asegúrate de que tenga esto
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
                  label="Tipo de Succión" // 👈 Asegúrate de que tenga esto
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

          <DialogActions sx={{ p: 2.5, backgroundColor: "#ffffff", gap: 1.5 }}>
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

      {/* 📝 MODAL PARA MODIFICAR (UPDATE) */}
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
                  fullWidth
                  value={editFormData.codigo}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, codigo: e.target.value })
                  }
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                />
                <TextField
                  label="Nombre de la Estación"
                  fullWidth
                  value={editFormData.nombre_est}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      nombre_est: e.target.value,
                    })
                  }
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                />
              </Box>

              <TextField
                label="Sistema Hidráulico"
                fullWidth
                value={editFormData.nombre_sistema}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    nombre_sistema: e.target.value,
                  })
                }
                required
                InputLabelProps={{ shrink: true }}
                sx={{ backgroundColor: "#ffffff" }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  select
                  label="Tipo de Estación"
                  fullWidth
                  value={editFormData.tipo_est}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      tipo_est: e.target.value,
                    })
                  }
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
                  fullWidth
                  value={editFormData.tipo_succion}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      tipo_succion: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                >
                  <MenuItem value={1}>Positiva</MenuItem>
                  <MenuItem value={0}>Negativa</MenuItem>
                </TextField>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button
              onClick={() => setOpenEditModal(false)}
              color="inherit"
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
            <TableHead sx={{ backgroundColor: "#f8fafc" }}>
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
                    colSpan={5}
                    align="center"
                    sx={{ py: 3, color: "text.secondary" }}
                  >
                    No se encontraron estaciones registradas en la base de
                    datos.
                  </TableCell>
                </TableRow>
              ) : (
                estaciones.map((estacion) => (
                  <TableRow key={estacion.id_est} hover>
                    {/* 1. Nombre de la Estación (Mostramos el nombre de la estación y su código abajo) */}
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {estacion.nombre_est}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {estacion.codigo}
                      </Typography>
                    </TableCell>

                    {/* 2. Sistema al que Pertenece */}
                    <TableCell>
                      <Typography variant="body2" color="text.primary">
                        {estacion.nombre_sistema || "No asignado"}
                      </Typography>
                    </TableCell>

                    {/* 3. Tipo de Estación (Ej: Subterránea) */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {estacion.tipo_est}
                      </Typography>
                    </TableCell>

                    {/* 4. Tipo de Succion */}
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

                    {/* 5. Estado Técnico (Le dejamos un Chip dinámico o fijo por ahora) */}
                    <TableCell>
                      <Chip
                        label="Operativa"
                        color="success"
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>

                    {/* 6. Acciones */}
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 1.5, // Separación elegante entre botones
                        }}
                      >
                        {/* Botón Gestionar */}
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<ViewIcon sx={{ fontSize: 18 }} />}
                          onClick={() => handleGestionar(estacion.id_est)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            color: "primary.main",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1.5,
                            "&:hover": {
                              backgroundColor: "rgba(25, 118, 210, 0.08)",
                            },
                          }}
                        >
                          Gestionar
                        </Button>

                        {/* Botón Modificar (SOLO ADMIN Y SUPERVISOR) */}
                        {(userRole === "admin" ||
                          userRole === "supervisor") && (
                          <Button
                            variant="text"
                            color="info" // Color azul claro/celeste
                            size="small"
                            startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                            onClick={() => handleAbrirEditar(estacion)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 1.5,
                            }}
                          >
                            Modificar
                          </Button>
                        )}

                        {/* Botón Borrar (SOLO ADMIN) */}
                        {userRole === "admin" && (
                          <Button
                            variant="text"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
                            disabled={loading}
                            onClick={() =>
                              handleEliminar(
                                estacion.id_est,
                                estacion.nombre_est,
                              )
                            }
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1.5,
                              "&:hover": {
                                backgroundColor: "rgba(211, 47, 47, 0.08)",
                              },
                            }}
                          >
                            Borrar
                          </Button>
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
    </Box>
  );
};

export default Estaciones;
