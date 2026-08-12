import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import PostAddIcon from "@mui/icons-material/PostAdd";
import Swal from "sweetalert2";

import ccmService from "../../services/ccmService.js";
import MultimediaGallery from "../../components/MultimediaGallery.jsx";

//importamos
import CircuitoModal from "./CircuitoModal.jsx";

//importamos
import ArrancadoresModal from "./ArrancadoresModal.jsx";

//importamos
import ContactosModal from "./ContactosModal.jsx";

export default function CcmTab({ idEstacion, userRole }) {
  const [ccmList, setCcmList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 📸 ESTADO MAESTRO PARA LA GALERÍA MULTIMEDIA
  const [galeriaData, setGaleriaData] = useState({
    open: false,
    fotos: [],
    titulo: "",
    index: 0,
    tipo: "",
  });

  const [modalCircuito, setModalCircuito] = useState({
    open: false,
    circuitoData: null,
    idCcm: null,
  });

  // 📝 ESTADOS PARA EL FORMULARIO CRUD (CCM MADRE)
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCcmId, setSelectedCcmId] = useState(null);

  const initialFormState = {
    tipo_ccm: 0,
    arran_estado_solido: 0,
    varia_veloc: 0,
    medidor: 0,
    plc: 0,
    rele_contro: 0,
    supre_pico: 0,
    transf_distri: 0,
    prot_falla_tierra: 0,
  };
  const [formData, setFormData] = useState(initialFormState);

  //ESTADO PARA SUBIR FOTOS
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  //ESTADO
  const [modalArrancadores, setModalArrancadores] = useState({
    open: false,
    arrancadoresData: null,
    idCcm: null,
  });

  //ESTADO
  const [modalContactos, setModalContactos] = useState({
    open: false,
    contactosData: null,
    idCcm: null,
  });

  // 📥 CARGAR DATOS DESDE EL BACKEND
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await ccmService.getCCMTotalForIdEstacion(idEstacion);
      const lista = res?.data || res || [];
      setCcmList(lista);
    } catch (error) {
      console.error("Error al cargar los CCM:", error);
      Swal.fire("Error", "No se pudieron cargar los datos del CCM", "error");
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

  // 🟢 MANEJADORES DE LA GALERÍA MULTIMEDIA
  const abrirGaleriaMaster = (fotos, titulo, tipo, event) => {
    if (event) event.stopPropagation();
    setGaleriaData({
      open: true,
      fotos: fotos || [],
      titulo: titulo,
      index: 0,
      tipo: tipo,
    });
  };

  // 🟢 ACCIÓN: Subir Fotos Simultáneas al CCM (Admin/Supervisor)
  const handleSubirFotoCCM = async (idCcm, event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("image", files[i]); // "image" es el campo esperado por tu backend
    }

    try {
      setSubiendoFoto(true);
      await ccmService.uploadFotosCCM(idCcm, formData);

      Swal.fire({
        icon: "success",
        title: "¡Fotos Registradas!",
        timer: 1500,
        showConfirmButton: false,
      });
      cargarDatos(); // Refresca el árbol y actualiza el carrusel en caliente
    } catch (error) {
      console.error("Error al subir fotos al CCM:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron procesar las imágenes.",
      });
    } finally {
      setSubiendoFoto(false);
      event.target.value = null; // Resetea el input file
    }
  };

  // 🔴 ACCIÓN: Conectar el "Cerebro de Borrado" de la galería multimedia con el Backend
  const eliminarFotoMaster = async (foto) => {
    if (!foto) return;

    Swal.fire({
      title: "¿Eliminar esta fotografía del CCM?",
      text: "Se borrará permanentemente del servidor de Cloudinary y de la base de datos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, borrar imagen",
      cancelButtonText: "Cancelar",
      willOpen: () => {
        // Mantiene SweetAlert2 por encima del modal de la galería de Material-UI
        const container = Swal.getContainer();
        if (container) container.style.zIndex = "9999";
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Usamos la clave primaria que nos pasaste de tu tabla ccm_fotos
          await ccmService.deleteFotoCCM(foto.id_ccm_foto);

          Swal.fire({
            icon: "success",
            title: "Eliminada",
            timer: 1500,
            showConfirmButton: false,
          });
          setGaleriaData((prev) => ({ ...prev, open: false, index: 0 })); // Cierra limpiamente la galería
          cargarDatos(); // Sincroniza la interfaz
        } catch (error) {
          console.error("Error al eliminar foto del CCM:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo remover el archivo.",
          });
        }
      }
    });
  };

  // 🛠️ FUNCIONES PARA EL FORMULARIO CRUD
  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setEditMode(false);
    setFormOpen(true);
  };

  const handleOpenEdit = (ccm, event) => {
    if (event) event.stopPropagation();
    setFormData({
      tipo_ccm: ccm.tipo_ccm,
      arran_estado_solido: ccm.arran_estado_solido,
      varia_veloc: ccm.varia_veloc,
      medidor: ccm.medidor,
      plc: ccm.plc,
      rele_contro: ccm.rele_contro,
      supre_pico: ccm.supre_pico,
      transf_distri: ccm.transf_distri,
      prot_falla_tierra: ccm.prot_falla_tierra,
    });
    setSelectedCcmId(ccm.id_ccm);
    setEditMode(true);
    setFormOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
  };

  const handleSaveCCM = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editMode) {
        await ccmService.updateCCM(selectedCcmId, formData);
        Swal.fire({
          icon: "success",
          title: "¡CCM Actualizado!",
          text: "El registro base se modificó correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await ccmService.addCCM(idEstacion, formData);
        Swal.fire({
          icon: "success",
          title: "¡CCM Registrado!",
          text: "El centro de control maestro fue guardado.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setFormOpen(false);
      cargarDatos();
    } catch (error) {
      console.error("Error al procesar el CCM:", error);
      Swal.fire(
        "Error",
        "No se pudo completar la operación en el servidor.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarCCM = async (idCcm, event) => {
    if (event) event.stopPropagation();

    Swal.fire({
      title: "¿Eliminar este CCM por completo?",
      text: "¡Atención! Esto eliminará el CCM madre junto con todas sus sub-tablas (Circuitos, Arrancadores, Contactos y Fotos) en cascada.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar todo",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await ccmService.deleteCCM(idCcm);
          Swal.fire({
            icon: "success",
            title: "Removido",
            text: "El CCM y sus componentes fueron eliminados.",
            timer: 1500,
            showConfirmButton: false,
          });
          cargarDatos();
        } catch (error) {
          console.error("Error al eliminar CCM:", error);
          Swal.fire(
            "Error",
            "No se pudo eliminar el Centro de Control.",
            "error",
          );
        }
      }
    });
  };

  const handleOpenCircuito = (ccm, isEdit, event) => {
    if (event) event.stopPropagation();
    setModalCircuito({
      open: true,
      idCcm: ccm.id_ccm,
      circuitoData: isEdit ? ccm.tipo_circuito : null,
    });
  };

  const handleEliminarCircuito = async (idCcm, event) => {
    if (event) event.stopPropagation();
    const result = await Swal.fire({
      title: "¿Eliminar especificaciones?",
      text: "Se borrará el circuito de este CCM.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
    });
    if (result.isConfirmed) {
      try {
        await ccmService.deleteCircuitoCCM(idCcm);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          timer: 1500,
          showConfirmButton: false,
        });
        cargarDatos();
      } catch (error) {
        console.log(error);
        Swal.fire("Error", "No se pudo borrar el circuito.", "error");
      }
    }
  };

  const handleOpenArrancadores = (ccm, isEdit, event) => {
    if (event) event.stopPropagation();
    setModalArrancadores({
      open: true,
      idCcm: ccm.id_ccm,
      arrancadoresData: isEdit ? ccm.tipo_arrancadores : null,
    });
  };

  const handleEliminarArrancadores = async (idCcm, event) => {
    if (event) event.stopPropagation();
    const result = await Swal.fire({
      title: "¿Eliminar arrancadores?",
      text: "Se borrarán de forma definitiva los tipos de arrancadores asociados a este CCM.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    });
    if (result.isConfirmed) {
      try {
        await ccmService.deleteArrancadoresCCM(idCcm);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          timer: 1500,
          showConfirmButton: false,
        });
        cargarDatos();
      } catch (error) {
        console.log(error);
        Swal.fire("Error", "No se pudo eliminar el registro.", "error");
      }
    }
  };

  const handleOpenContactos = (ccm, isEdit, event) => {
    if (event) event.stopPropagation();
    setModalContactos({
      open: true,
      idCcm: ccm.id_ccm,
      contactosData: isEdit ? ccm.juegos_contactos : null,
    });
  };

  const handleEliminarContactos = async (idCcm, event) => {
    if (event) event.stopPropagation();
    const result = await Swal.fire({
      title: "¿Eliminar juegos de contactos?",
      text: "Esta acción removerá esta configuración del CCM.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    });
    if (result.isConfirmed) {
      try {
        await ccmService.deleteContactosCCM(idCcm);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          timer: 1500,
          showConfirmButton: false,
        });
        cargarDatos();
      } catch (error) {
        console.log(error);
        Swal.fire("Error", "No se pudo eliminar el registro.", "error");
      }
    }
  };

  // 🎨 COMPONENTE AUXILIAR PARA VISUALIZAR LOS BOOLEANOS (0 y 1)
  const BooleanChip = ({ label, value }) => (
    <Chip
      size="small"
      label={label}
      icon={value === 1 ? <CheckCircleIcon /> : <CancelIcon />}
      color={value === 1 ? "success" : "default"}
      variant={value === 1 ? "filled" : "outlined"}
      sx={{ m: 0.5, fontWeight: "bold" }}
    />
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* 🟢 BOTÓN SUPERIOR: AGREGAR CCM (Admin y Supervisor) */}
      {(userRole === "admin" || userRole === "supervisor") && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ fontWeight: "bold" }}
          >
            Agregar CCM
          </Button>
        </Box>
      )}

      {!ccmList || ccmList.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            p: 4,
            bgcolor: "#f8fafc",
            borderRadius: 2,
            border: "1px dashed #cbd5e1",
          }}
        >
          <Typography color="text.secondary">
            No hay Centros de Control de Máquinas registrados en esta estación.
          </Typography>
        </Box>
      ) : (
        ccmList.map((ccm) => (
          <Card
            key={ccm.id_ccm}
            sx={{
              mb: 4,
              boxShadow: 3,
              borderTop: "4px solid #0284c7",
              position: "relative",
            }}
          >
            <CardContent>
              {/* ENCABEZADO DE LA TARJETA */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="primary.dark">
                  Centro de Control de Máquinas (CCM) - Tipo {ccm.tipo_ccm}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  {/* 👁️ BOTÓN VER FOTOS: Solo se muestra si el arreglo contiene imágenes reales */}
                  {ccm.fotos && ccm.fotos.length > 0 && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PhotoCameraIcon />}
                      onClick={(e) =>
                        abrirGaleriaMaster(
                          ccm.fotos,
                          `Fotos CCM #${ccm.id_ccm}`,
                          "CCM",
                          e,
                        )
                      }
                      color="primary"
                      sx={{ fontWeight: "bold" }}
                    >
                      Fotos ({ccm.fotos.length})
                    </Button>
                  )}

                  {/* 🟢 NUEVO: Botón para Cargar Fotos al CCM en Caliente */}
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
                        onChange={(e) => handleSubirFotoCCM(ccm.id_ccm, e)}
                      />
                    </IconButton>
                  )}

                  {/* Botón Modificar */}
                  {(userRole === "admin" || userRole === "supervisor") && (
                    <IconButton
                      color="info"
                      size="small"
                      onClick={(e) => handleOpenEdit(ccm, e)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}

                  {/* Botón Eliminar */}
                  {userRole === "admin" && (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={(e) => handleEliminarCCM(ccm.id_ccm, e)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* DATOS PRINCIPALES DEL CCM */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Configuración Principal:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                  <BooleanChip
                    label="Arranque Estado Sólido"
                    value={ccm.arran_estado_solido}
                  />
                  <BooleanChip
                    label="Variador de Velocidad"
                    value={ccm.varia_veloc}
                  />
                  <BooleanChip label="Medidor" value={ccm.medidor} />
                  <BooleanChip label="PLC" value={ccm.plc} />
                  <BooleanChip
                    label="Relé de Control"
                    value={ccm.rele_contro}
                  />
                  <BooleanChip
                    label="Supresor de Picos"
                    value={ccm.supre_pico}
                  />
                  <BooleanChip
                    label="Transf. Distribución"
                    value={ccm.transf_distri}
                  />
                  <BooleanChip
                    label="Prot. Falla a Tierra"
                    value={ccm.prot_falla_tierra}
                  />
                </Box>
              </Box>

              {/* ACORDEÓN 1: JUEGO DE CONTACTOS */}
              <Accordion
                disableGutters
                elevation={0}
                sx={{ border: "1px solid #e2e8f0", mb: 1 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ bgcolor: "#f1f5f9" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      pr: 2,
                    }}
                  >
                    <Typography fontWeight="bold">
                      🎛️ Juegos de Contactos
                    </Typography>

                    <Box>
                      {!ccm.juegos_contactos &&
                      (userRole === "admin" || userRole === "supervisor") ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<PostAddIcon />}
                          onClick={(e) => handleOpenContactos(ccm, false, e)}
                        >
                          Registrar Contactos
                        </Button>
                      ) : ccm.juegos_contactos ? (
                        <>
                          {(userRole === "admin" ||
                            userRole === "supervisor") && (
                            <IconButton
                              color="info"
                              size="small"
                              onClick={(e) => handleOpenContactos(ccm, true, e)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          {userRole === "admin" && (
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(e) =>
                                handleEliminarContactos(ccm.id_ccm, e)
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </>
                      ) : null}
                    </Box>
                  </Box>
                </AccordionSummary>

                {ccm.juegos_contactos ? (
                  <AccordionDetails>
                    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                      <BooleanChip
                        label="Bipolar"
                        value={ccm.juegos_contactos.bipolar}
                      />
                      <BooleanChip
                        label="Tripolar"
                        value={ccm.juegos_contactos.tripolar}
                      />
                      <BooleanChip
                        label="Tetrapolar"
                        value={ccm.juegos_contactos.tetrapolar}
                      />
                      <BooleanChip
                        label="Pentapolar"
                        value={ccm.juegos_contactos.pentapolar}
                      />
                    </Box>
                  </AccordionDetails>
                ) : (
                  <AccordionDetails sx={{ textAlign: "center", py: 3 }}>
                    <Typography color="text.secondary">
                      No hay juegos de contactos registrados en este CCM.
                    </Typography>
                  </AccordionDetails>
                )}
              </Accordion>

              {/* ACORDEÓN 2: TIPOS DE ARRANCADORES */}
              <Accordion
                disableGutters
                elevation={0}
                sx={{ border: "1px solid #e2e8f0", mb: 1 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ bgcolor: "#f1f5f9" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      pr: 2,
                    }}
                  >
                    <Typography fontWeight="bold">
                      ⚙️ Tipos de Arrancadores
                    </Typography>

                    <Box>
                      {!ccm.tipo_arrancadores &&
                      (userRole === "admin" || userRole === "supervisor") ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<PostAddIcon />}
                          onClick={(e) => handleOpenArrancadores(ccm, false, e)}
                        >
                          Registrar Arrancadores
                        </Button>
                      ) : ccm.tipo_arrancadores ? (
                        <>
                          {(userRole === "admin" ||
                            userRole === "supervisor") && (
                            <IconButton
                              color="info"
                              size="small"
                              onClick={(e) =>
                                handleOpenArrancadores(ccm, true, e)
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          {userRole === "admin" && (
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(e) =>
                                handleEliminarArrancadores(ccm.id_ccm, e)
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </>
                      ) : null}
                    </Box>
                  </Box>
                </AccordionSummary>

                {ccm.tipo_arrancadores ? (
                  <AccordionDetails>
                    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                      <BooleanChip
                        label="C.E.S."
                        value={ccm.tipo_arrancadores.c_e_s}
                      />
                      <BooleanChip
                        label="Estrella-Triángulo"
                        value={ccm.tipo_arrancadores.c_a_estrella_triangulo}
                      />
                      <BooleanChip
                        label="Directo"
                        value={ccm.tipo_arrancadores.c_a_directo}
                      />
                      <BooleanChip
                        label="Con Reversión"
                        value={ccm.tipo_arrancadores.c_a_con_reversion}
                      />
                      <BooleanChip
                        label="Sin Reversión"
                        value={ccm.tipo_arrancadores.c_a_sin_reversion}
                      />
                      <BooleanChip
                        label="Compen. Transformador"
                        value={ccm.tipo_arrancadores.c_a_compen_transformador}
                      />
                      <BooleanChip
                        label="Arrancador Suave"
                        value={ccm.tipo_arrancadores.c_a_arrancador_suave}
                      />
                      <BooleanChip
                        label="Conv. Frecuencia"
                        value={ccm.tipo_arrancadores.c_convertidor_frecuencia}
                      />
                      <BooleanChip
                        label="Bobinas Magnéticas"
                        value={ccm.tipo_arrancadores.bobinas_magneticas}
                      />
                      <BooleanChip
                        label="Fusible"
                        value={ccm.tipo_arrancadores.fusible}
                      />
                      <BooleanChip
                        label="Interruptor"
                        value={ccm.tipo_arrancadores.interruptor}
                      />
                      <BooleanChip
                        label="Interr. Limitador Corriente"
                        value={
                          ccm.tipo_arrancadores.interruptor_limitador_corriente
                        }
                      />
                    </Box>
                  </AccordionDetails>
                ) : (
                  <AccordionDetails sx={{ textAlign: "center", py: 3 }}>
                    <Typography color="text.secondary">
                      No hay configuración de arrancadores registrada en este
                      CCM.
                    </Typography>
                  </AccordionDetails>
                )}
              </Accordion>

              {/* ACORDEÓN 3: TIPO DE CIRCUITO */}
              <Accordion
                disableGutters
                elevation={0}
                sx={{ border: "1px solid #e2e8f0" }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ bgcolor: "#f1f5f9" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      pr: 2,
                    }}
                  >
                    <Typography fontWeight="bold">
                      🔌 Especificaciones del Circuito
                    </Typography>

                    <Box>
                      {/* Mostrar Agregar si NO existe el circuito, Mostrar Editar/Borrar si YA existe */}
                      {!ccm.tipo_circuito &&
                      (userRole === "admin" || userRole === "supervisor") ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<PostAddIcon />}
                          onClick={(e) => handleOpenCircuito(ccm, false, e)}
                        >
                          Registrar Circuito
                        </Button>
                      ) : ccm.tipo_circuito ? (
                        <>
                          {(userRole === "admin" ||
                            userRole === "supervisor") && (
                            <IconButton
                              color="info"
                              size="small"
                              onClick={(e) => handleOpenCircuito(ccm, true, e)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          {userRole === "admin" && (
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(e) =>
                                handleEliminarCircuito(ccm.id_ccm, e)
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </>
                      ) : null}
                    </Box>
                  </Box>
                </AccordionSummary>

                {/* Detalles renderizados solo si existe */}
                {ccm.tipo_circuito ? (
                  <AccordionDetails>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Entrada/Salida Cables:</b>{" "}
                            {ccm.tipo_circuito.e_s_cables}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Clase Tensión:</b>{" "}
                            {ccm.tipo_circuito.clase_tension}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Tensión Nominal Red:</b>{" "}
                            {ccm.tipo_circuito.tension_nominal_red} V
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Tensión Mando:</b>{" "}
                            {ccm.tipo_circuito.tension_mando} V
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Frecuencia Nominal:</b>{" "}
                            {ccm.tipo_circuito.frecuencia_nominal} Hz
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Corriente Nominal:</b>{" "}
                            {ccm.tipo_circuito.corriente_nominal} A
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Corriente Corta Dur.:</b>{" "}
                            {ccm.tipo_circuito.corriente_corta_duracion} A
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>NBI:</b> {ccm.tipo_circuito.nbi} kV
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Temp. Ambiente:</b>{" "}
                            {ccm.tipo_circuito.temp_ambiente} °C
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Interruptor Principal:</b>{" "}
                            {ccm.tipo_circuito.interruptor_principal
                              ? "Sí"
                              : "No"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Elevación Temp.:</b>{" "}
                            {ccm.tipo_circuito.elevacion_temp} °C
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Barra Ramales:</b>{" "}
                            {ccm.tipo_circuito.barra_ramales} A
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Altitud Máx.:</b> {ccm.tipo_circuito.altitud_max}{" "}
                            m
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Voltaje Aislamiento:</b>{" "}
                            {ccm.tipo_circuito.voltaje_aislamiento} V
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Barras Principales:</b>{" "}
                            {ccm.tipo_circuito.barras_principales} A
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Cap. Corto Circuito:</b>{" "}
                            {ccm.tipo_circuito.cap_corto_circuito} kA
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Voltaje Trabajo:</b>{" "}
                            {ccm.tipo_circuito.voltaje_trabajo} V
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Voltaje Control:</b>{" "}
                            {ccm.tipo_circuito.voltaje_control} V
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <b>Cap. Interrupción Máx.:</b>{" "}
                            {ccm.tipo_circuito.cap_interrupcion_max} kA
                          </Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </AccordionDetails>
                ) : (
                  <AccordionDetails sx={{ textAlign: "center", py: 3 }}>
                    <Typography color="text.secondary">
                      No hay circuito registrado. Haga clic en el botón superior
                      para agregar.
                    </Typography>
                  </AccordionDetails>
                )}
              </Accordion>
            </CardContent>
          </Card>
        ))
      )}

      {/* 📝 DIALOG/MODAL FORMULARIO: REGISTRAR Y EDITAR CCM MADRE */}
      <Dialog
        open={formOpen}
        onClose={() => !submitting && setFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSaveCCM}>
          <DialogTitle
            sx={{ bgcolor: "#0284c7", color: "white", fontWeight: "bold" }}
          >
            {editMode
              ? `Modificar CCM #${selectedCcmId}`
              : "Registrar Nuevo CCM Maestro"}
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {/* Campo numérico Tipo de CCM */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Tipo de CCM"
                  name="tipo_ccm"
                  value={formData.tipo_ccm}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value={0}>Tipo 0 (Estándar)</MenuItem>
                  <MenuItem value={1}>Tipo 1 (Avanzado)</MenuItem>
                  <MenuItem value={2}>Tipo 2 (Especial)</MenuItem>
                </TextField>
              </Grid>

              {/* Checkboxes de Parámetros de Potencia y Control */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="arran_estado_solido"
                      checked={formData.arran_estado_solido === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Arranque Estado Sólido"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="varia_veloc"
                      checked={formData.varia_veloc === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Variador de Velocidad"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="medidor"
                      checked={formData.medidor === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Medidor de Potencia"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="plc"
                      checked={formData.plc === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Controlador PLC"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="rele_contro"
                      checked={formData.rele_contro === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Relé de Control"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="supre_pico"
                      checked={formData.supre_pico === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Supresor de Picos"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="transf_distri"
                      checked={formData.transf_distri === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Transf. de Distribución"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="prot_falla_tierra"
                      checked={formData.prot_falla_tierra === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Protección Falla a Tierra"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => setFormOpen(false)}
              color="inherit"
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Guardar Registro"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 📸 VISOR MAESTRO DE GALERÍA MULTIMEDIA */}
      <MultimediaGallery
        open={galeriaData.open}
        onClose={() => setGaleriaData((prev) => ({ ...prev, open: false }))}
        fotos={galeriaData.fotos}
        titulo={galeriaData.titulo}
        index={galeriaData.index}
        setIndex={(nuevoIndex) =>
          setGaleriaData((prev) => ({
            ...prev,
            index:
              typeof nuevoIndex === "function"
                ? nuevoIndex(prev.index)
                : nuevoIndex,
          }))
        }
        onDelete={eliminarFotoMaster}
        userRole={userRole}
      />

      {/* MODAL EXTERNO DE CIRCUITO */}
      <CircuitoModal
        open={modalCircuito.open}
        onClose={() =>
          setModalCircuito({ open: false, circuitoData: null, idCcm: null })
        }
        idCcm={modalCircuito.idCcm}
        circuitoData={modalCircuito.circuitoData}
        onSuccess={cargarDatos}
      />

      {/* MODAL EXTERNO DE ARRANCADORES */}
      <ArrancadoresModal
        open={modalArrancadores.open}
        onClose={() =>
          setModalArrancadores({
            open: false,
            arrancadoresData: null,
            idCcm: null,
          })
        }
        idCcm={modalArrancadores.idCcm}
        arrancadoresData={modalArrancadores.arrancadoresData}
        onSuccess={cargarDatos}
      />

      {/* MODAL EXTERNO DE CONTACTOS */}
      <ContactosModal
        open={modalContactos.open}
        onClose={() =>
          setModalContactos({ open: false, contactosData: null, idCcm: null })
        }
        idCcm={modalContactos.idCcm}
        contactosData={modalContactos.contactosData}
        onSuccess={cargarDatos}
      />
    </Box>
  );
}
