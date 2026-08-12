import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";

import Swal from "sweetalert2";
import { transformadorService } from "../../services/transformadorService";
import ModalTransformador from "./ModalTransformador";

export default function BancoTransformadoresTab({ idEstacion, userRole }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalModo, setModalModo] = useState("add");
  const [seleccionado, setSeleccionado] = useState(null);

  // 📸 ESTADOS PARA EL VISOR DE GALERÍA FLOTANTE
  const [openGaleria, setOpenGaleria] = useState(false);
  const [fotosGaleria, setFotosGaleria] = useState([]);
  const [tituloGaleria, setTituloGaleria] = useState("");
  const [fotoIndex, setFotoIndex] = useState(0); // Para saber qué foto estamos viendo

  //ESTADOS PARA FOTOS
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res =
        await transformadorService.getTransformadoresByEstacion(idEstacion);
      if (res.status === "ok") setItems(res.data || []);
    } catch (error) {
      console.error("Error cargando transformadores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idEstacion) {
      // 🌟 Retrasamos la ejecución un instante para evitar el choque de estados
      setTimeout(() => {
        cargarDatos();
      }, 0);
    }
    // 🤫 Silenciamos la advertencia del linter para no generar un bucle infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEstacion]);

  const handleEliminar = (idTransformador) => {
    Swal.fire({
      title: "¿Estás seguro de eliminar este Banco?",
      text: "Se borrarán todos sus registros de especificaciones técnicas permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar banco",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await transformadorService.deleteTransformador(idTransformador);
          Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            timer: 1500,
            showConfirmButton: false,
          });
          cargarDatos();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              error.response?.data?.message ||
              "No se pudo eliminar el registro.",
          });
        }
      }
    });
  };

  // 📸 Abre el visor limpiando el evento y cargando las fotos
  const handleAbrirGaleria = (fotos, titulo, event) => {
    // ✋ e.stopPropagation() es vital para que MUI no se confunda con el clic
    if (event) event.stopPropagation();

    setFotosGaleria(fotos);
    setTituloGaleria(titulo);
    setFotoIndex(0);
    setOpenGaleria(true); // 🌟 ¡Aquí encendemos la vista!
  };

  // 📸 FUNCIONES: Para navegar siguiente/anterior
  const nextFoto = () =>
    setFotoIndex((prev) => (prev === fotosGaleria.length - 1 ? 0 : prev + 1));
  const prevFoto = () =>
    setFotoIndex((prev) => (prev === 0 ? fotosGaleria.length - 1 : prev - 1));

  // 🟢 ACCIÓN: Subir Nuevas Fotos
  const handleSubirFoto = async (idTransformador, event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("image", files[i]); // "image" es el campo que espera tu backend
    }

    try {
      setSubiendoFoto(true);
      await transformadorService.uploadFotos(idTransformador, formData);

      Swal.fire({
        icon: "success",
        title: "¡Fotos Registradas!",
        timer: 1500,
        showConfirmButton: false,
      });
      cargarDatos(); // Recarga la UI para mostrar las nuevas fotos
    } catch (error) {
      console.error("Error subiendo foto:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron procesar las imágenes.",
      });
    } finally {
      setSubiendoFoto(false);
      event.target.value = null; // Limpia el input
    }
  };

  // 🔴 ACCIÓN: Eliminar la foto actual desde la galería
  const handleEliminarFotoEnGaleria = async () => {
    const fotoActual = fotosGaleria[fotoIndex];
    if (!fotoActual) return;

    Swal.fire({
      title: "¿Eliminar esta fotografía?",
      text: "Se borrará permanentemente del servidor.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, borrar imagen",
      willOpen: () => {
        // Fix para que SweetAlert se vea por encima del modal oscuro de MUI
        const container = Swal.getContainer();
        if (container) container.style.zIndex = "9999";
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await transformadorService.deleteFoto(
            fotoActual.id_banco_transformadores_foto,
          );

          Swal.fire({
            icon: "success",
            title: "Eliminada",
            timer: 1500,
            showConfirmButton: false,
          });
          setOpenGaleria(false); // Cerramos la galería para evitar errores de índice
          cargarDatos(); // Refrescamos el árbol
        } catch (error) {
          console.error("Error Eliminando Foto:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el archivo.",
          });
        }
      }
    });
  };

  const obtenerConexionText = (val) => {
    if (val === 1) return "Delta (Δ)";
    if (val === 2) return "Estrella (Y)";
    return "Monofásica";
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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Cabecera */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          color="text.primary"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <FlashOnIcon color="warning" /> Bancos de Transformadores
        </Typography>
        {(userRole === "admin" || userRole === "supervisor") && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              setModalModo("add");
              setSeleccionado(null);
              setModalOpen(true);
            }}
          >
            + Añadir Banco
          </Button>
        )}
      </Box>

      {items.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 4, fontStyle: "italic" }}
        >
          No hay bancos de transformadores registrados en esta estación de
          bombeo.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} key={item.id_banco_transformadores}>
              <Card
                sx={{
                  borderLeft: "5px solid #eab308",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Fila Encabezado */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary.dark"
                      >
                        {item.tipo} — {item.marca || "Sin Marca"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Año de instalación: <b>{item.año || "N/A"}</b> |
                        Fabricado en: <b>{item.lugar_fabricado || "N/A"}</b>
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {/* Botón de cámara (Listo para conectar la galería en el siguiente paso) */}

                      {/* 👁️ Botón de la Cámara (Ver Fotos) */}
                      {item.fotos_transformador &&
                        item.fotos_transformador.length > 0 && (
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            sx={{ fontWeight: "bold" }}
                            startIcon={<PhotoCameraIcon />}
                            onClick={(e) => {
                              e.stopPropagation(); // <-- También puedes ponerlo directo aquí si prefieres
                              handleAbrirGaleria(
                                item.fotos_transformador, // Pasamos el arreglo de fotos
                                `Registro Fotográfico: Banco ${item.tipo} - ${item.marca}`, // Título
                                e,
                              );
                            }}
                          >
                            Fotos ({item.fotos_transformador.length})
                          </Button>
                        )}

                      {/* 🟢 NUEVO: Botón para Subir Foto (Admin/Supervisor) */}
                      {(userRole === "admin" || userRole === "supervisor") && (
                        <IconButton
                          color="primary"
                          size="small"
                          component="label"
                          disabled={subiendoFoto}
                          sx={{
                            bgcolor: "#f0fdf4",
                            color: "#16a34a",
                            "&:hover": { bgcolor: "#dcfce7" },
                          }}
                        >
                          <AddAPhotoIcon fontSize="small" />
                          <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              handleSubirFoto(item.id_banco_transformadores, e)
                            }
                          />
                        </IconButton>
                      )}
                      {(userRole === "admin" || userRole === "supervisor") && (
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => {
                            setSeleccionado(item);
                            setModalModo("edit");
                            setModalOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {userRole === "admin" && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleEliminar(item.id_banco_transformadores)
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  <Grid container spacing={4}>
                    {/* Bloque Eléctrico */}
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        ⚡ Parámetros Eléctricos
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Potencia Nominal:</b> {item.potencia_nominal} KVA
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Nivel Aislamiento:</b> {item.nivel_aislamiento}{" "}
                            KV
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Tensión Primaria:</b> {item.tension_primaria} V
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Tensión Secundaria:</b> {item.tension_secundaria}{" "}
                            V
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Corriente Primaria:</b> {item.corriente_primaria}{" "}
                            A
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Frecuencia:</b> {item.frecuencia} Hz
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Nº Fases:</b> {item.num_fases}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Impedancia:</b> {item.impedancia_voltios}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Conexión:</b>{" "}
                            {obtenerConexionText(item.conexion)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Tensión C.C.:</b> {item.tension_c_c} V
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <b>Norma de diseño:</b> {item.norma || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Bloque Físico / Entorno */}
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        📦 Especificaciones Físicas y Térmicas
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Clase Aislamiento:</b>{" "}
                            {item.clase_aislamiento || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Refrigeración:</b>{" "}
                            {item.refrigeracion === 1
                              ? "ONAF (Forzada)"
                              : "ONAN (Natural)"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Tipo de Aceite:</b> {item.tipo_aceite || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Volumen Aceite:</b> {item.vol_aceite_total} L
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Peso Activo:</b> {item.peso_act} Kg
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Peso Total:</b> {item.peso_total} Kg
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Elevación Temp.:</b> {item.calentamiento} °C
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <b>Temp. Ambiente Máx:</b> {item.temp_ambiente} °C
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ModalTransformador
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        modo={modalModo}
        seleccionado={seleccionado}
        idEstacion={idEstacion}
        onSaveSuccess={cargarDatos}
      />

      {/* 📸 MODAL DE GALERÍA FLOTANTE */}
      <Dialog
        open={openGaleria}
        onClose={() => setOpenGaleria(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "#1e293b",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {tituloGaleria}
          <IconButton
            onClick={() => setOpenGaleria(false)}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            bgcolor: "#0f172a",
            p: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
            position: "relative",
          }}
        >
          {fotosGaleria && fotosGaleria.length > 0 ? (
            <>
              {/* 🔴 NUEVO: Botón de Eliminar en la esquina superior derecha (Solo Admin) */}
              {userRole === "admin" && (
                <IconButton
                  onClick={handleEliminarFotoEnGaleria}
                  sx={{
                    position: "absolute",
                    top: 15,
                    right: 15,
                    color: "white",
                    bgcolor: "rgba(220, 38, 38, 0.8)",
                    "&:hover": { bgcolor: "rgba(220, 38, 38, 1)" },
                    zIndex: 10,
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
              {/* Botón Foto Anterior */}
              {fotosGaleria.length > 1 && (
                <IconButton
                  onClick={prevFoto}
                  sx={{
                    position: "absolute",
                    left: 10,
                    color: "white",
                    bgcolor: "rgba(0,0,0,0.5)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  }}
                >
                  <ArrowBackIosNewIcon />
                </IconButton>
              )}

              {/* Imagen Principal */}
              <Box
                sx={{
                  width: "100%",
                  height: "500px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  p: 2,
                }}
              >
                <img
                  src={fotosGaleria[fotoIndex]?.foto_url}
                  alt={`Transformador ${fotoIndex + 1}`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              </Box>

              {/* Botón Foto Siguiente */}
              {fotosGaleria.length > 1 && (
                <IconButton
                  onClick={nextFoto}
                  sx={{
                    position: "absolute",
                    right: 10,
                    color: "white",
                    bgcolor: "rgba(0,0,0,0.5)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              )}

              {/* Contador de fotos (Ej: 1 / 3) */}
              <Typography
                sx={{
                  position: "absolute",
                  bottom: 10,
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.6)",
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                }}
              >
                {fotoIndex + 1} / {fotosGaleria.length}
              </Typography>
            </>
          ) : (
            <Typography color="white">No hay imágenes disponibles.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
