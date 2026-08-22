import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import Swal from "sweetalert2";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsIcon from "@mui/icons-material/Settings";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import PropaneIcon from "@mui/icons-material/Propane";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
//import CloseIcon from "@mui/icons-material/Close";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DeleteIcon from "@mui/icons-material/Delete";

// Importa tus servicios
import { lineaBombeoService } from "../../services/lineaBombeoService.js";
import { valvulaService } from "../../services/valvulaService.js";
import { bombaService } from "../../services/bombaService.js";
import { motorService } from "../../services/motorService.js";

// Importamos el sub componente Modal Linea de Bombeo
import ModalLineaBombeo from "./ModalLineaBombeo.jsx";

//Importamos el sub componente Modal Valvula
import ModalValvula from "../valvula/ModalValvula.jsx";

//Importamos el sub componente Modal Bomba
import ModalBomba from "../bomba/ModalBomba.jsx";

//Importamos el sub componente Modal Detalles de la Bomba
import ModalDetalleBomba from "../bomba/ModalDetalleBomba.jsx";

//Importamos el sub componente Modal Motor
import ModalMotor from "../motor/ModalMotor.jsx";

//Importamos el sub componente Modal Detalles del Motor
import ModalDetalleMotor from "../motor/ModalDetalleMotor.jsx";

//Importamos el sub componente para las fotos
import MultimediaGallery from "../../components/MultimediaGallery.jsx";

const LineasBombeoTab = ({ idEstacion, userRole }) => {
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 📸 Estados para la Galería de Fotos
  //const [openGaleria, setOpenGaleria] = useState(false);
  //const [fotosSeleccionadas, setFotosSeleccionadas] = useState([]);
  //const [tituloGaleria, setTituloGaleria] = useState("");

  // 📸 Estado Maestro para la Galería Multimedia
  const [galeriaData, setGaleriaData] = useState({
    open: false,
    fotos: [],
    titulo: "",
    index: 0,
    tipo: "", // Nos dirá si es "LINEA", "BOMBA" o "MOTOR"
  });

  // 📝 Estados para los Modales de Fichas Técnicas Extensas
  const [openBombaModal, setOpenBombaModal] = useState(false);
  const [openMotorModal, setOpenMotorModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [bombaSeleccionada, setBombaSeleccionada] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [motorSeleccionado, setMotorSeleccionado] = useState(null);

  // 🌟 Estado para controlar envíos asíncronos y evitar congelar la UI completa
  const [submitting, setSubmitting] = useState(false);

  //const [idLineaFoco, setIdLineaFoco] = useState(null);

  // 📦 Estados para controlar el nuevo Modal separado de Líneas
  const [modalLineaOpen, setModalLineaOpen] = useState(false);
  const [modalLineaModo, setModalLineaModo] = useState("add"); // 'add' o 'edit'
  const [lineaAEditar, setLineaAEditar] = useState(null);

  // 📦 Estados para el Modal de Válvulas
  const [modalValvulaOpen, setModalValvulaOpen] = useState(false);
  const [modalValvulaModo, setModalValvulaModo] = useState("add");
  const [valvulaAEditar, setValvulaAEditar] = useState(null);
  const [idLineaParaValvula, setIdLineaParaValvula] = useState(null); // Para saber a qué línea agregarla

  // 📦 Estados para el Modal de Bombas
  const [modalBombaOpen, setModalBombaOpen] = useState(false);
  const [modalBombaModo, setModalBombaModo] = useState("add");
  const [bombaAEditar, setBombaAEditar] = useState(null);
  const [idLineaParaBomba, setIdLineaParaBomba] = useState(null);

  // 📦 Estados para Ficha de la Bomba
  const [modalFichaOpen, setModalFichaOpen] = useState(false);
  const [modalFichaModo, setModalFichaModo] = useState("add");
  const [fichaAEditar, setFichaAEditar] = useState(null);
  const [idBombaParaFicha, setIdBombaParaFicha] = useState(null);

  // 📦 Estados para el CRUD Base del Motor (no la ficha, el motor en sí)
  const [modalBaseMotorOpen, setModalBaseMotorOpen] = useState(false);
  const [modalBaseMotorModo, setModalBaseMotorModo] = useState("add");
  const [motorCrudAEditar, setMotorCrudAEditar] = useState(null);
  const [idBombaParaMotor, setIdBombaParaMotor] = useState(null);

  // Estados para el CRUD detalles del Motor
  const [modalDetalleMotorOpen, setModalDetalleMotorOpen] = useState(false);
  const [modalDetalleMotorModo, setModalDetalleMotorModo] = useState("add");
  const [detalleMotorAEditar, setDetalleMotorAEditar] = useState(null);
  const [idMotorParaDetalle, setIdMotorParaDetalle] = useState(null);

  // 🔄 1. Declaramos la función en el scope principal para que TODOS puedan usarla
  const cargarArbolOperativo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await lineaBombeoService.getArbolOperativo(idEstacion);

      if (
        response &&
        response.status === "ok" &&
        Array.isArray(response.data)
      ) {
        setLineas(response.data);
      } else if (response && Array.isArray(response.data)) {
        setLineas(response.data);
      } else {
        setLineas([]);
      }
    } catch (err) {
      console.error("Error al cargar las líneas de bombeo:", err);
      setError("No se pudo cargar el ecosistema de líneas de bombeo.");
    } finally {
      setLoading(false);
    }
  }, [idEstacion]);

  // 🔄 2. El useEffect ahora solo invoca la función principal al montar o cambiar ID
  useEffect(() => {
    if (idEstacion) {
      // 🌟 Rompe el renderizado en cascada moviendo la ejecución a la cola de eventos
      const ejecutarCarga = setTimeout(() => {
        cargarArbolOperativo();
      }, 0);

      // Limpiamos el timeout si el componente se desmonta antes de tiempo
      return () => clearTimeout(ejecutarCarga);
    }
  }, [idEstacion, cargarArbolOperativo]);

  const handleVerFichaBomba = async (bomba) => {
    setIdBombaParaFicha(bomba.id_bomba);
    setDetalleMotorAEditar(null);

    try {
      // 1. Llamamos al servicio correcto de la bomba
      const respuesta = await bombaService.getDetalleBomba(bomba.id_bomba);

      // 2. Extraemos el objeto buscando en todas las capas posibles de la respuesta de Axios
      const datosCrudos = respuesta?.data;
      let fReal = null;

      if (datosCrudos) {
        if (Array.isArray(datosCrudos.data)) {
          fReal = datosCrudos.data[0];
        } else if (Array.isArray(datosCrudos)) {
          fReal = datosCrudos[0];
        } else if (datosCrudos.data) {
          fReal = datosCrudos.data;
        } else {
          fReal = datosCrudos;
        }
      }

      // 3. Evaluamos si conseguimos datos reales de la ficha
      if (fReal && (fReal.id_detalle_bomba || fReal.pot_nom_bomba_hp)) {
        setFichaAEditar(fReal);
        setModalFichaModo("edit"); // Modo lectura/edición (Muestra los datos)
      } else {
        setFichaAEditar(null);
        setModalFichaModo("add"); // Modo creación limpia
      }
    } catch (error) {
      console.error(
        "🚨 Error crítico al consultar el detalle de la bomba:",
        error,
      );
      setFichaAEditar(null);
      setModalFichaModo("add");
    }

    setModalFichaOpen(true);
  };

  // 🟢 FUNCIÓN MAESTRA PARA ABRIR LA GALERÍA (Sirve para Líneas, Bombas y Motores)
  const abrirGaleriaMaster = (fotos, titulo, tipo, event) => {
    // 🌟 Detenemos de inmediato el clic para que el acordeón o tarjeta de fondo no se mueva
    if (event && typeof event.stopPropagation === "function") {
      event.stopPropagation();
    }

    setGaleriaData({
      open: true,
      fotos: fotos || [],
      titulo: titulo,
      index: 0, // Siempre arranca mostrando la primera fotografía
      tipo: tipo, // Aquí guardamos dinámicamente si es "LINEA", "BOMBA" o "MOTOR"
    });
  };

  // 🔴 FUNCIÓN CEREBRO PARA ELIMINAR FOTOS
  const eliminarFotoMaster = (foto) => {
    // Verificamos qué entidad está abierta actualmente en la galería
    if (galeriaData.tipo === "LINEA") {
      handleEliminarFotoLinea(foto.id_linea_bombeo_foto);
    } else if (galeriaData.tipo === "BOMBA") {
      handleEliminarFotoBomba(foto.id_bomba_foto);
    } else if (galeriaData.tipo === "MOTOR") {
      handleEliminarFotoMotor(foto.id_motor_foto);
    } else if (galeriaData.tipo === "VALVULA") {
      handleEliminarFotoValvula(foto.id_valvula_foto);
    }
  };

  // ⬆️ Lógica para subir fotos a la línea de bombeo
  const handleSubirFotoLinea = async (idLinea, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setSubmitting(true);
      await lineaBombeoService.uploadFotoLinea(idLinea, file);
      alert("¡Material fotográfico de la línea registrado correctamente!");

      // Actualizamos los acordeones principales de fondo
      await cargarArbolOperativo(false);

      // ✅ CAMBIO 1: Ahora validamos el estado dinámico galeriaData.open
      if (galeriaData.open) {
        const res = await lineaBombeoService.getArbolOperativo(idEstacion);
        const lista = res?.data || res || [];
        if (Array.isArray(lista)) {
          const lineaActualizada = lista.find(
            (l) => l.id_linea_bombeo === idLinea,
          );
          if (lineaActualizada) {
            // ✅ CAMBIO 2: Actualizamos de forma segura el array de fotos interno
            setGaleriaData((prev) => ({
              ...prev,
              fotos: lineaActualizada.fotos_linea || [],
            }));
          }
        }
      }
    } catch (err) {
      console.error("Error al subir la imagen de la línea:", err);
      alert("Hubo un error al intentar subir la foto.");
    } finally {
      setSubmitting(false);
      event.target.value = null; // Limpiamos el input file
    }
  };

  // 🗑️ Lógica para eliminar una fotografía de la línea (CORREGIDA Y OPTIMIZADA)
  const handleEliminarFotoLinea = async (idFoto) => {
    // 1. ⚠️ Confirmación destructiva con SweetAlert2
    const result = await Swal.fire({
      title: "¿Estás seguro de eliminar esta fotografía de la línea?",
      text: "Se borrará permanentemente de la base de datos y de los servidores de Cloudinary.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f", // Color rojo de peligro inmediato
      cancelButtonColor: "#607d8b", // Color gris de cancelación
      confirmButtonText: "Sí, eliminar de inmediato",
      cancelButtonText: "Cancelar",
    });

    // Si el usuario cancela, detenemos el proceso de inmediato
    if (!result.isConfirmed) return;

    // 🔍 AUTOMATIZACIÓN: Buscamos qué línea contiene esta foto ANTES de borrarla de la BD
    // Esto nos permite saber a quién actualizar sin depender del estado eliminado 'idLineaFoco'
    const lineaPadre = lineas.find((l) =>
      l.fotos_linea?.some((f) => f.id_linea_bombeo_foto === idFoto),
    );
    const idLineaFocoLocal = lineaPadre ? lineaPadre.id_linea_bombeo : null;

    try {
      setSubmitting(true);

      // 2. Llamamos al backend para borrar la foto
      await lineaBombeoService.deleteFotoLinea(idFoto);

      // 3. Pedimos los datos limpios al servidor para actualizar el árbol operativo
      const res = await lineaBombeoService.getArbolOperativo(idEstacion);

      // Ajustamos la lectura según tu respuesta real (res.data)
      const lista = res?.data || res || [];

      if (Array.isArray(lista)) {
        setLineas(lista);

        // 4. ✅ REFRESCAMOS LA GALERÍA EN CALIENTE USANDO EL ESTADO MAESTRO
        if (idLineaFocoLocal) {
          const lineaActualizada = lista.find(
            (l) => l.id_linea_bombeo === idLineaFocoLocal,
          );

          if (
            lineaActualizada &&
            lineaActualizada.fotos_linea &&
            lineaActualizada.fotos_linea.length > 0
          ) {
            // Sincronizamos las fotos restantes en el carrusel y volvemos al índice 0 de forma segura
            setGaleriaData((prev) => ({
              ...prev,
              fotos: lineaActualizada.fotos_linea,
              index: 0,
            }));
          } else {
            // Si ya no le quedan fotos a esta línea, cerramos el visor automáticamente
            setGaleriaData((prev) => ({
              ...prev,
              open: false,
              fotos: [],
              index: 0,
            }));
          }
        }
      }

      // 5. 🎉 Notificación de Éxito con SweetAlert2
      await Swal.fire({
        title: "¡Fotografía Eliminada!",
        text: "La imagen de la línea de bombeo ha sido removida con éxito.",
        icon: "success",
        confirmButtonColor: "#0284c7", // Azul institucional
        confirmButtonText: "Entendido",
      });
    } catch (err) {
      console.error("Error al eliminar la imagen de la línea:", err);

      // 6. ❌ Notificación de Error con SweetAlert2
      Swal.fire({
        title: "Fallo de eliminación",
        text: "Hubo un error al intentar eliminar la foto de la línea de bombeo.",
        icon: "error",
        confirmButtonColor: "#64748b",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarLinea = async (idLinea, nombreLinea) => {
    Swal.fire({
      title: `¿Estás seguro de eliminar la ${nombreLinea}?`,
      text: "Esta acción es irreversible y podría afectar los datos asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar de inmediato",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await lineaBombeoService.deleteLineaBombeo(idLinea);
          Swal.fire({
            title: "¡Eliminada!",
            text: "La línea de bombeo ha sido removida del sistema.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          cargarArbolOperativo(); // Refresca la vista inmediatamente
        } catch (error) {
          console.error("Error al eliminar la línea:", error);
          Swal.fire({
            icon: "error",
            title: "Error en la operación",
            text:
              error.response?.data?.message ||
              "No posees los permisos necesarios.",
          });
        }
      }
    });
  };

  const handleEliminarValvula = async (idValvula, modelo) => {
    Swal.fire({
      title: `¿Eliminar válvula ${modelo}?`,
      text: "Esta acción es irreversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await valvulaService.deleteValvula(idValvula);
          Swal.fire({
            title: "¡Eliminada!",
            text: "La válvula ha sido removida.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          cargarArbolOperativo(); // Refresca todo el árbol
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No tienes permisos.",
          });
        }
      }
    });
  };

  const handleSubirFotoValvula = async (idValvula, event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Creamos el contenedor FormData obligatorio para enviar archivos al backend
    const formData = new FormData();

    // Como tu ruta acepta hasta 5 fotos, recorremos los archivos seleccionados
    // Usamos la clave "image" tal como lo indica tu backend: upload.array("image", 5)
    for (let i = 0; i < files.length; i++) {
      formData.append("image", files[i]);
    }

    try {
      setSubmitting(true); // Bloqueamos controles para evitar dobles envíos

      await valvulaService.uploadFotosValvula(idValvula, formData);

      Swal.fire({
        icon: "success",
        title: "¡Fotos Subidas!",
        text: "El registro fotográfico de la válvula se actualizó correctamente.",
        timer: 1500,
        showConfirmButton: false,
      });

      cargarArbolOperativo(); // Refrescamos el árbol para pintar las nuevas imágenes
    } catch (error) {
      console.error("Error al subir fotos de la válvula:", error);
      Swal.fire({
        icon: "error",
        title: "Error de subida",
        text: error.response?.data?.message || "No se pudo cargar la imagen.",
      });
    } finally {
      setSubmitting(false); // Liberamos la interfaz
    }
  };

  const handleEliminarFotoValvula = async (idFoto) => {
    const result = await Swal.fire({
      title: "¿Estás seguro de eliminar esta fotografía?",
      text: "Esta imagen se borrará permanentemente del servidor.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, borrar foto",
      cancelButtonText: "Cancelar",
      // 🌟 Fuerza a SweetAlert a ponerse al frente del Dialog de Material-UI
      willOpen: () => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = "9999";
      },
    });

    if (!result.isConfirmed) return;

    try {
      // Consumimos el servicio de válvulas directo
      await valvulaService.deleteFotoValvula(idFoto);

      Swal.fire({
        icon: "success",
        title: "¡Eliminada!",
        text: "La fotografía fue removida con éxito.",
        timer: 1500,
        showConfirmButton: false,
        willOpen: () => {
          const container = Swal.getContainer();
          if (container) container.style.zIndex = "9999";
        },
      });

      // 🌟 LA CORRECCIÓN MAESTRA: Cerramos la galería usando el estado unificado
      setGaleriaData((prev) => ({
        ...prev,
        open: false,
        index: 0,
      }));

      cargarArbolOperativo(); // Refresca el árbol de inmediato
    } catch (error) {
      console.error("Error al eliminar foto de la válvula:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo eliminar la imagen.",
        willOpen: () => {
          const container = Swal.getContainer();
          if (container) container.style.zIndex = "9999";
        },
      });
    }
  };

  const handleEliminarBomba = async (idBomba, modelo) => {
    Swal.fire({
      title: `¿Eliminar bomba ${modelo}?`,
      text: "Esta acción es irreversible y podría afectar los motores vinculados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      willOpen: () => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = "9999";
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await bombaService.deleteBomba(idBomba);
          Swal.fire({
            title: "¡Eliminada!",
            text: "El equipo de bombeo ha sido removido.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            willOpen: () => {
              const c = Swal.getContainer();
              if (c) c.style.zIndex = "9999";
            },
          });
          cargarArbolOperativo();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No tienes permisos.",
            willOpen: () => {
              const c = Swal.getContainer();
              if (c) c.style.zIndex = "9999";
            },
          });
        }
      }
    });
  };

  const handleEliminarFichaBomba = async (idDetalleBomba) => {
    Swal.fire({
      title: "¿Eliminar ficha técnica?",
      text: "Se borrarán los 16 parámetros técnicos de esta bomba.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar ficha",
      cancelButtonText: "Cancelar",
      willOpen: () => {
        const c = Swal.getContainer();
        if (c) c.style.zIndex = "9999";
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await bombaService.deleteDetalleBomba(idDetalleBomba);
          Swal.fire({
            title: "Eliminada",
            text: "Ficha removida exitosamente.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            willOpen: () => {
              const c = Swal.getContainer();
              if (c) c.style.zIndex = "9999";
            },
          });
          cargarArbolOperativo();
        } catch (error) {
          console.error("Error al eliminar la ficha:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar la ficha.",
            willOpen: () => {
              const c = Swal.getContainer();
              if (c) c.style.zIndex = "9999";
            },
          });
        }
      }
    });
  };

  // 📸 ACCIÓN: Subir Fotos de la Bomba
  const handleSubirFotoBomba = async (idBomba, event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Empaquetamos los archivos para el backend ("image" es la clave que espera upload.array)
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("image", files[i]);
    }

    try {
      setSubmitting(true);

      const respuesta = await bombaService.uploadFotosBomba(idBomba, formData);
      console.log("✅ Respuesta del servidor al subir foto:", respuesta);

      //await bombaService.uploadFotosBomba(idBomba, formData);

      Swal.fire({
        icon: "success",
        title: "¡Fotos Subidas!",
        text: "El registro fotográfico de la bomba se actualizó correctamente.",
        timer: 1500,
        showConfirmButton: false,
      });

      cargarArbolOperativo(); // Refresca el árbol para mostrar la nueva foto
    } catch (error) {
      console.error("Error al subir fotos de la bomba:", error);
      Swal.fire({
        icon: "error",
        title: "Error de subida",
        text: error.response?.data?.message || "No se pudo cargar la imagen.",
      });
    } finally {
      setSubmitting(false);
      event.target.value = null; // Limpia el input
    }
  };

  // 🗑️ ACCIÓN: Eliminar Foto de la Bomba (CORREGIDA)
  const handleEliminarFotoBomba = async (idFoto) => {
    Swal.fire({
      title: "¿Estás seguro de eliminar esta fotografía?",
      text: "Esta imagen de la bomba se borrará permanentemente del servidor.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, borrar foto",
      cancelButtonText: "Cancelar",
      willOpen: () => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = "9999";
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await bombaService.deleteFotoBomba(idFoto);

          Swal.fire({
            icon: "success",
            title: "¡Eliminada!",
            text: "La fotografía fue removida con éxito.",
            timer: 1500,
            showConfirmButton: false,
            willOpen: () => {
              const container = Swal.getContainer();
              if (container) container.style.zIndex = "9999";
            },
          });

          // ✅ CORRECCIÓN: Cerramos la galería multimedia usando el estado maestro
          setGaleriaData((prev) => ({
            ...prev,
            open: false,
            index: 0,
          }));

          cargarArbolOperativo(); // Refresca la información del árbol operativo
        } catch (error) {
          console.error("Error al eliminar foto de la bomba:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              error.response?.data?.message || "No se pudo eliminar la imagen.",
            willOpen: () => {
              const container = Swal.getContainer();
              if (container) container.style.zIndex = "9999";
            },
          });
        }
      }
    });
  };

  const handleEliminarMotor = async (idMotor, codigoMotor) => {
    Swal.fire({
      title: `¿Eliminar motor ${codigoMotor}?`,
      text: "Esta acción es irreversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await motorService.deleteMotor(idMotor);
          Swal.fire({
            title: "¡Eliminado!",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          cargarArbolOperativo();
        } catch (error) {
          console.error("Error al eliminar un Motor:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el motor.",
          });
        }
      }
    });
  };

  const handleVerDetalleMotor = async (motor) => {
    setIdMotorParaDetalle(motor.id_motor);

    try {
      const respuesta = await motorService.getDetalleMotor(motor.id_motor);
      console.log("🔍 RESPUESTA DETALLE MOTOR:", respuesta);

      const datosCrudos = respuesta?.data;
      let fReal = null;

      if (datosCrudos) {
        if (Array.isArray(datosCrudos.data)) fReal = datosCrudos.data[0];
        else if (Array.isArray(datosCrudos)) fReal = datosCrudos[0];
        else if (datosCrudos.data) fReal = datosCrudos.data;
        else fReal = datosCrudos;
      }

      // Evaluamos usando un campo clave de tu JSON
      if (fReal && (fReal.id_detalle_motor || fReal.pot_nom_motor_hp)) {
        setDetalleMotorAEditar(fReal);
        setModalDetalleMotorModo("edit");
      } else {
        setDetalleMotorAEditar(null);
        setModalDetalleMotorModo("add");
      }
    } catch (error) {
      console.error("🚨 Error al consultar detalle del motor:", error);
      setDetalleMotorAEditar(null);
      setModalDetalleMotorModo("add");
    }

    setModalDetalleMotorOpen(true);
  };

  const handleEliminarDetalleMotor = async (idDetalleMotor) => {
    Swal.fire({
      title: "¿Eliminar Ficha del Motor?",
      text: "Se borrarán todos los datos técnicos avanzados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await motorService.deleteDetalleMotor(idDetalleMotor);
          Swal.fire({
            icon: "success",
            title: "Eliminada",
            timer: 1500,
            showConfirmButton: false,
          });
          cargarArbolOperativo();
        } catch (error) {
          console.error("Error al eliminar Detalles de un Motor:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar la ficha técnica.",
          });
        }
      }
    });
  };

  // 📸 ACCIÓN: Subir Fotos del Motor Eléctrico
  const handleSubirFotoMotor = async (idMotor, event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Empaquetamos bajo la clave "image" que espera el upload.array del backend
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("image", files[i]);
    }

    try {
      setSubmitting(true);
      await motorService.uploadFotosMotor(idMotor, formData);

      Swal.fire({
        icon: "success",
        title: "¡Fotografías Registradas!",
        text: "El registro fotográfico del motor se actualizó correctamente.",
        timer: 1500,
        showConfirmButton: false,
      });

      cargarArbolOperativo(); // Recarga la UI en tiempo real
    } catch (error) {
      console.error("🚨 Error al cargar fotos del motor:", error);
      Swal.fire({
        icon: "error",
        title: "Error de carga",
        text:
          error.response?.data?.message ||
          "No se pudo procesar la subida de imágenes.",
      });
    } finally {
      setSubmitting(false);
      event.target.value = null; // Limpia el buffer del input
    }
  };

  // 🗑️ ACCIÓN: Eliminar Foto del Motor Eléctrico
  const handleEliminarFotoMotor = async (idFoto) => {
    Swal.fire({
      title: "¿Deseas eliminar permanentemente esta fotografía?",
      text: "Esta acción removerá el archivo físico del servidor de forma definitiva.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, borrar imagen",
      cancelButtonText: "Cancelar",
      willOpen: () => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = "9999"; // Evita que se tape detrás del modal
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await motorService.deleteFotoMotor(idFoto);

          Swal.fire({
            icon: "success",
            title: "¡Eliminada!",
            text: "La fotografía del motor fue removida.",
            timer: 1500,
            showConfirmButton: false,
            willOpen: () => {
              const container = Swal.getContainer();
              if (container) container.style.zIndex = "9999";
            },
          });

          // ✅ CORRECCIÓN: Cerramos la galería multimedia usando el estado maestro
          setGaleriaData((prev) => ({
            ...prev,
            open: false,
            index: 0,
          }));

          cargarArbolOperativo();
        } catch (error) {
          console.error("🚨 Error al eliminar foto del motor:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              error.response?.data?.message ||
              "No se pudo eliminar el archivo.",
            willOpen: () => {
              const container = Swal.getContainer();
              if (container) container.style.zIndex = "9999";
            },
          });
        }
      }
    });
  };

  if (loading && lineas.length === 0) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />;
  }
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box>
        {/* 🌟 1. EL BOTÓN VA AQUÍ (Siempre visible para Admin/Supervisor, tenga o no líneas la estación) */}

        {/* 🔄 2. ABAJO DEÉJALA VALIDACIÓN DE LA LISTA VACÍA */}
        {loading ? (
          <Typography>Cargando líneas...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : lineas.length === 0 ? (
          /* Esto es lo que estás viendo en tu captura actualmente: */
          <Box
            sx={{
              textAlign: "center",
              p: 5,
              bgcolor: "#f8fafc",
              borderRadius: 2,
              border: "1px dashed #cbd5e1",
              mt: 2,
            }}
          >
            <Typography
              color="text.secondary"
              sx={{ mb: 3, fontWeight: "medium" }}
            >
              No hay líneas de bombeo registradas en esta estación.
            </Typography>

            {(userRole === "admin" || userRole === "supervisor") && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  setModalLineaModo("add");
                  setLineaAEditar(null);
                  setModalLineaOpen(true);
                }}
                sx={{ fontWeight: "bold", textTransform: "none", px: 3 }}
              >
                REGISTRAR PRIMERA LÍNEA DE BOMBEO
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                color="text.primary"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <PrecisionManufacturingIcon color="primary" /> Líneas de Bombeo
              </Typography>
              {(userRole === "admin" || userRole === "supervisor") && (
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 0 }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setModalLineaModo("add");
                      setLineaAEditar(null);
                      setModalLineaOpen(true);
                    }}
                    sx={{ fontWeight: "bold" }}
                  >
                    Registrar Línea de Bombeo
                  </Button>
                </Box>
              )}
            </Box>
            {lineas.map((linea) => (
              <Box key={linea.id_linea_bombeo}>
                {/* Tu componente de línea con los botones de modificar y eliminar */}

                <Accordion
                  key={linea.id_linea_bombeo}
                  sx={{ mb: 2, borderRadius: 2, border: "1px solid #e0e0e0" }}
                >
                  {/* 🟢 CABECERA DE LA LÍNEA */}
                  <AccordionSummary
                    component="div"
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ backgroundColor: "#f8fafc" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                        pr: 2,
                      }}
                    >
                      <Typography fontWeight="bold" variant="subtitle1">
                        Línea #{linea.numero_linea}: {linea.nombre_linea_bombeo}
                      </Typography>
                      <Chip
                        label={linea.estado_linea_bombeo}
                        color={
                          linea.estado_linea_bombeo === "ACTIVA"
                            ? "success"
                            : "warning"
                        }
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />

                      <Box
                        sx={{
                          ml: "auto",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {/* Botón para abrir la galería existente */}
                        {linea.fotos_linea &&
                        Array.isArray(linea.fotos_linea) &&
                        linea.fotos_linea.length > 0 ? (
                          <Button
                            icon={<PhotoCameraIcon />}
                            size="small"
                            color="primary"
                            variant="outlined"
                            clickable
                            onClick={(e) => {
                              // 🌟 Frenamos el clic aquí mismo para que el Accordion de fondo no se entere
                              e.stopPropagation();
                              abrirGaleriaMaster(
                                linea.fotos_linea,
                                `Línea: ${linea.nombre_linea_bombeo}`,
                                "LINEA",
                                e,
                                linea.id_linea_bombeo,
                              );
                            }}
                            sx={{
                              fontWeight: "bold",
                            }}
                          >
                            Fotos ({linea.fotos_linea.length})
                          </Button>
                        ) : (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontStyle: "italic", mr: 1 }}
                          >
                            Sin registro fotográfico
                          </Typography>
                        )}

                        {/* 📸 ACCIÓN: SUBIR FOTO A LA LÍNEA (Visible para admin y supervisor) */}
                        {(userRole === "admin" ||
                          userRole === "supervisor") && (
                          <IconButton
                            color="primary"
                            size="small"
                            component="label"
                            disabled={submitting}
                            onClick={(e) => e.stopPropagation()} // Evita abrir el acordeón
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
                              accept="image/*"
                              disabled={submitting}
                              onChange={(e) =>
                                handleSubirFotoLinea(linea.id_linea_bombeo, e)
                              }
                            />
                          </IconButton>
                        )}
                      </Box>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        {/* ✏️ BOTÓN MODIFICAR (Admin y Supervisor) */}
                        {(userRole === "admin" ||
                          userRole === "supervisor") && (
                          <IconButton
                            size="small"
                            color="info"
                            onClick={(e) => {
                              e.stopPropagation(); // Evita abrir o cerrar el acordeón
                              setModalLineaModo("edit");
                              setLineaAEditar(linea);
                              setModalLineaOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}

                        {/* ❌ BOTÓN ELIMINAR (Estricto: Solo Admin) */}
                        {userRole === "admin" && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation(); // Evita abrir o cerrar el acordeón
                              handleEliminarLinea(
                                linea.id_linea_bombeo,
                                linea.nombre_linea_bombeo,
                              );
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>

                  {/* 🔵 DETALLES DE LA LÍNEA */}
                  <AccordionDetails sx={{ p: 3, backgroundColor: "#ffffff" }}>
                    {linea.observaciones_linea_bombeo && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3, fontStyle: "italic" }}
                      >
                        <strong>Observaciones:</strong>{" "}
                        {linea.observaciones_linea_bombeo}
                      </Typography>
                    )}

                    <Grid container spacing={3}>
                      {/* VÁLVULAS */}
                      {/* 🔴 COLUMNA IZQUIERDA: VÁLVULAS CON TODOS SUS DETALLES */}
                      <Grid item xs={12} md={3.5}>
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          fontWeight="bold"
                          sx={{
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <PropaneIcon fontSize="small" /> Válvulas de Control (
                          {linea.valvulas ? linea.valvulas.length : 0})
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              mb: 0,
                            }}
                          >
                            {/* BOTÓN REGISTRAR VÁLVULA (Cabecera de la sección Válvulas) */}
                            {(userRole === "admin" ||
                              userRole === "supervisor") && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  setIdLineaParaValvula(linea.id_linea_bombeo);
                                  setModalValvulaModo("add");
                                  setValvulaAEditar(null);
                                  setModalValvulaOpen(true);
                                }}
                              >
                                + Añadir Válvula
                              </Button>
                            )}
                          </Box>
                        </Typography>

                        {!linea.valvulas || linea.valvulas.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            Sin válvulas registradas.
                          </Typography>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {linea.valvulas.map((valvula) => (
                              <Card
                                key={valvula.id_valvula}
                                variant="outlined"
                                sx={{
                                  bgcolor: "#fafafa",
                                  borderColor: "#cbd5e1",
                                  borderRadius: 2,
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                                }}
                              >
                                <CardContent
                                  sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}
                                >
                                  {/* Encabezado Principal */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                      mb: 1.5,
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                        color="primary.main"
                                      >
                                        Válvula de {valvula.tipo_valvula}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: "block", mt: -0.5 }}
                                      >
                                        {valvula.marca_valvula} • Mod.{" "}
                                        {valvula.modelo_valvula}
                                      </Typography>
                                    </Box>

                                    {/* 🛠️ Contenedor de Acciones (Fotos, Modificar, Eliminar) */}
                                    {/* 🛠️ Contenedor de Acciones de la Válvula (Fotos, Modificar, Eliminar) */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 1,
                                        alignItems: "center",
                                        ml: "auto",
                                      }}
                                    >
                                      {/* 📸 Gestión Visual de Fotos */}
                                      {valvula.fotos_valvula &&
                                      Array.isArray(valvula.fotos_valvula) &&
                                      valvula.fotos_valvula.length > 0 ? (
                                        <Chip
                                          icon={<PhotoCameraIcon />}
                                          label={`${valvula.fotos_valvula.length} Fotos`}
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                          clickable
                                          onClick={(e) => {
                                            e.stopPropagation(); // Frenamos el burbujeo en la UI
                                            abrirGaleriaMaster(
                                              valvula.fotos_valvula,
                                              `Válvula de la Línea`,
                                              "VALVULA",
                                              e,
                                            );
                                          }}
                                          sx={{
                                            fontWeight: "bold",
                                            "&:hover": { bgcolor: "#e0f2fe" },
                                          }}
                                        />
                                      ) : (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ fontStyle: "italic", mr: 1 }}
                                        >
                                          Sin registro fotográfico
                                        </Typography>
                                      )}

                                      {/* 📸 ACCIÓN: SUBIR FOTO A LA VÁLVULA (Visible para Admin y Supervisor) */}
                                      {(userRole === "admin" ||
                                        userRole === "supervisor") && (
                                        <IconButton
                                          color="primary"
                                          size="small"
                                          component="label"
                                          disabled={submitting}
                                          onClick={(e) => e.stopPropagation()}
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
                                            multiple // Permite seleccionar más de una foto gracias a tu upload.array
                                            accept="image/*"
                                            disabled={submitting}
                                            onChange={(e) =>
                                              handleSubirFotoValvula(
                                                valvula.id_valvula,
                                                e,
                                              )
                                            }
                                          />
                                        </IconButton>
                                      )}

                                      {/* ✏️ BOTÓN MODIFICAR VÁLVULA */}
                                      {(userRole === "admin" ||
                                        userRole === "supervisor") && (
                                        <IconButton
                                          size="small"
                                          color="info"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setValvulaAEditar(valvula);
                                            setModalValvulaModo("edit");
                                            setModalValvulaOpen(true);
                                          }}
                                          sx={{
                                            bgcolor: "#e0f2fe",
                                            color: "#0284c7",
                                            "&:hover": { bgcolor: "#bae6fd" },
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      )}

                                      {/* ❌ BOTÓN ELIMINAR VÁLVULA */}
                                      {userRole === "admin" && (
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEliminarValvula(
                                              valvula.id_valvula,
                                              valvula.modelo_valvula,
                                            );
                                          }}
                                          sx={{
                                            bgcolor: "#fee2e2",
                                            color: "#dc2626",
                                            "&:hover": { bgcolor: "#fecaca" },
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Box>
                                  </Box>

                                  <Divider
                                    sx={{ mb: 1.5, borderStyle: "dashed" }}
                                  />

                                  {/* Rejilla interna con los detalles técnicos específicos */}
                                  <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                      >
                                        Norma Brida
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        {valvula.norma_brida || "N/A"}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                      >
                                        Clase / PN
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        {valvula.clase_valvula
                                          ? `Clase ${valvula.clase_valvula}`
                                          : ""}{" "}
                                        {valvula.pn ? `(PN ${valvula.pn})` : ""}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6} sx={{ mt: 0.5 }}>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                      >
                                        Tipo Asiento
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        {valvula.tipo_asiento || "N/A"}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6} sx={{ mt: 0.5 }}>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                      >
                                        Operación
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        {valvula.forma_operacion || "N/A"}
                                      </Typography>
                                    </Grid>

                                    {valvula.tipo_compuerta && (
                                      <Grid item xs={12} sx={{ mt: 0.5 }}>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          display="block"
                                        >
                                          Tipo Compuerta
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          fontWeight="medium"
                                        >
                                          {valvula.tipo_compuerta}
                                        </Typography>
                                      </Grid>
                                    )}

                                    {/* Detalles de la Tornillería */}
                                    <Grid item xs={12} sx={{ mt: 1.5 }}>
                                      <Box
                                        sx={{
                                          p: 1,
                                          bgcolor: "#f1f5f9",
                                          borderRadius: 1.5,
                                          border: "1px solid #e2e8f0",
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          fontWeight="bold"
                                          color="text.primary"
                                          display="block"
                                          sx={{ mb: 0.5 }}
                                        >
                                          Especificaciones de Tornillería
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          Diámetro:{" "}
                                          <strong>
                                            {valvula.diametro_tornillo
                                              ? `${valvula.diametro_tornillo}mm`
                                              : "N/A"}
                                          </strong>{" "}
                                          | Longitud:{" "}
                                          <strong>
                                            {valvula.longitud_tornillo
                                              ? `${valvula.longitud_tornillo}mm`
                                              : "N/A"}
                                          </strong>{" "}
                                          | Grado:{" "}
                                          <strong>
                                            {valvula.grado_tornillo
                                              ? `Grado ${valvula.grado_tornillo}`
                                              : "N/A"}
                                          </strong>
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  </Grid>
                                </CardContent>
                              </Card>
                            ))}
                          </Box>
                        )}
                      </Grid>

                      {/* BOMBAS Y MOTORES */}
                      <Grid item xs={12} md={9}>
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          fontWeight="bold"
                          sx={{
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <WaterDropIcon fontSize="small" /> Equipos de Bombeo e
                          Impulsión ({linea.bombas ? linea.bombas.length : 0})
                          {(userRole === "admin" ||
                            userRole === "supervisor") && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setIdLineaParaBomba(linea.id_linea_bombeo);
                                setModalBombaModo("add");
                                setBombaAEditar(null);
                                setModalBombaOpen(true);
                              }}
                            >
                              + Añadir Bomba
                            </Button>
                          )}
                        </Typography>

                        {!linea.bombas || linea.bombas.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            Sin bombas registradas en esta línea.
                          </Typography>
                        ) : (
                          <Grid container spacing={2}>
                            {linea.bombas.map((bomba) => (
                              <Grid item xs={12} sm={6} key={bomba.id_bomba}>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    borderColor: "#cbd5e1",
                                    borderRadius: 2,
                                    boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  {/* CUERPO SUPERIOR: LA BOMBA */}
                                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        mb: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        color="primary.dark"
                                      >
                                        Bomba de {bomba.tipo_bomba}
                                      </Typography>

                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 0.5,
                                          alignItems: "center",
                                        }}
                                      >
                                        {/* 📸 BOTÓN DE GALERÍA DE FOTOS */}
                                        {bomba.fotos_bomba &&
                                          bomba.fotos_bomba.length > 0 && (
                                            <IconButton
                                              size="small"
                                              color="primary"
                                              onClick={(e) =>
                                                abrirGaleriaMaster(
                                                  bomba.fotos_bomba,
                                                  `Bomba ${bomba.marca_bomba}`,
                                                  "BOMBA",
                                                  e,
                                                )
                                              }
                                            >
                                              <PhotoCameraIcon fontSize="small" />
                                            </IconButton>
                                          )}

                                        {/* 🟢 NUEVO: INPUT PARA SUBIR FOTO (Visible para Admin y Supervisor) */}
                                        {(userRole === "admin" ||
                                          userRole === "supervisor") && (
                                          <IconButton
                                            color="primary"
                                            size="small"
                                            component="label"
                                            disabled={submitting}
                                            onClick={(e) => e.stopPropagation()}
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
                                              disabled={submitting}
                                              onChange={(e) =>
                                                handleSubirFotoBomba(
                                                  bomba.id_bomba,
                                                  e,
                                                )
                                              }
                                            />
                                          </IconButton>
                                        )}

                                        {/* ✏️ BOTÓN MODIFICAR BOMBA */}
                                        {(userRole === "admin" ||
                                          userRole === "supervisor") && (
                                          <IconButton
                                            size="small"
                                            color="info"
                                            onClick={() => {
                                              setBombaAEditar(bomba);
                                              setModalBombaModo("edit");
                                              setModalBombaOpen(true);
                                            }}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        )}

                                        {/* ❌ BOTÓN ELIMINAR BOMBA */}
                                        {userRole === "admin" && (
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                              handleEliminarBomba(
                                                bomba.id_bomba,
                                                bomba.modelo_bomba,
                                              )
                                            }
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        )}

                                        {/* --- SEPARADOR VISUAL --- */}
                                        <Box
                                          sx={{
                                            width: "1px",
                                            height: "24px",
                                            bgcolor: "divider",
                                            mx: 0.5,
                                          }}
                                        />

                                        {/* ========================================================= */}
                                        {/* 📄 BOTÓN UNIFICADO DE FICHA TÉCNICA (ANTI-ERRORES)        */}
                                        {/* ========================================================= */}
                                        <Button
                                          size="small"
                                          variant="text"
                                          onClick={() =>
                                            handleVerFichaBomba(bomba)
                                          }
                                          sx={{
                                            fontSize: "0.75rem",
                                            fontWeight: "bold",
                                            textTransform: "none",
                                          }}
                                        >
                                          Ficha
                                        </Button>
                                        {/* ========================================================= */}
                                      </Box>
                                    </Box>

                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                      sx={{ mt: -1, mb: 1.5 }}
                                    >
                                      {bomba.marca_bomba} • Mod.{" "}
                                      {bomba.modelo_bomba}
                                    </Typography>

                                    <Grid
                                      container
                                      spacing={1}
                                      sx={{
                                        bgcolor: "#f8fafc",
                                        p: 1,
                                        borderRadius: 1.5,
                                        border: "1px solid #e2e8f0",
                                      }}
                                    >
                                      <Grid item xs={6}>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          Caudal Nominal
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          fontWeight="bold"
                                          color="success.main"
                                        >
                                          {bomba.q} L/s
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={6}>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          Nº de Etapas
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          fontWeight="medium"
                                        >
                                          {bomba.num_etapa || "N/A"}
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </CardContent>

                                  <Divider
                                    sx={{ mx: 2, borderStyle: "dashed" }}
                                  />

                                  {/* CUERPO INFERIOR: EL MOTOR ASOCIADO */}
                                  <CardContent
                                    sx={{ pt: 1.5, backgroundColor: "#fbfbfb" }}
                                  >
                                    <Typography
                                      variant="caption"
                                      fontWeight="bold"
                                      color="text.secondary"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        mb: 1.5,
                                      }}
                                    >
                                      <SettingsIcon fontSize="small" /> Motor
                                      Eléctrico Acoplado
                                      {/* Botón Añadir Motor (Solo Admin/Supervisor y si la bomba no tiene motor) */}
                                      {(!bomba.motores ||
                                        bomba.motores.length === 0) &&
                                        (userRole === "admin" ||
                                          userRole === "supervisor") && (
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                            sx={{
                                              ml: 1,
                                              p: 0.2,
                                              fontSize: "0.65rem",
                                              minWidth: 0,
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setIdBombaParaMotor(
                                                bomba.id_bomba,
                                              );
                                              setModalBaseMotorModo("add");
                                              setMotorCrudAEditar(null);
                                              setModalBaseMotorOpen(true);
                                            }}
                                          >
                                            + Añadir
                                          </Button>
                                        )}
                                    </Typography>

                                    {!bomba.motores ||
                                    bomba.motores.length === 0 ? (
                                      <Typography
                                        variant="body2"
                                        color="error.main"
                                        sx={{ fontStyle: "italic", pl: 1 }}
                                      >
                                        Sin motor asignado
                                      </Typography>
                                    ) : (
                                      bomba.motores.map((motor) => (
                                        <Box
                                          key={motor.id_motor}
                                          sx={{
                                            pl: 1.5,
                                            borderLeft: "3px solid #b45309",
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                              alignItems: "center",
                                            }}
                                          >
                                            <Typography
                                              variant="body2"
                                              fontWeight="bold"
                                              color="text.primary"
                                            >
                                              {motor.marca_motor} (
                                              {motor.tipo_motor})
                                            </Typography>

                                            {/* Botones CRUD Motor */}
                                            {(userRole === "admin" ||
                                              userRole === "supervisor") && (
                                              <IconButton
                                                size="small"
                                                color="info"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setMotorCrudAEditar(motor);
                                                  setModalBaseMotorModo("edit");
                                                  setModalBaseMotorOpen(true);
                                                }}
                                              >
                                                <EditIcon
                                                  sx={{ fontSize: "1rem" }}
                                                />
                                              </IconButton>
                                            )}
                                            {userRole === "admin" && (
                                              <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleEliminarMotor(
                                                    motor.id_motor,
                                                    motor.codigo_motor,
                                                  );
                                                }}
                                              >
                                                <DeleteIcon
                                                  sx={{ fontSize: "1rem" }}
                                                />
                                              </IconButton>
                                            )}

                                            <Box
                                              sx={{ display: "flex", gap: 0.5 }}
                                            >
                                              {motor.fotos_motor &&
                                                motor.fotos_motor.length >
                                                  0 && (
                                                  <IconButton
                                                    size="small"
                                                    color="warning"
                                                    onClick={(e) =>
                                                      abrirGaleriaMaster(
                                                        motor.fotos_motor,
                                                        `Motor ${motor.marca_motor}`,
                                                        "MOTOR",
                                                        e,
                                                      )
                                                    }
                                                  >
                                                    <PhotoCameraIcon fontSize="small" />
                                                  </IconButton>
                                                )}

                                              {/* 🟢 Registrar Nuevas Fotos (Icono verde con input oculto - Admin/Supervisor) */}
                                              {(userRole === "admin" ||
                                                userRole === "supervisor") && (
                                                <IconButton
                                                  color="primary"
                                                  size="small"
                                                  component="label"
                                                  disabled={submitting}
                                                  onClick={(e) =>
                                                    e.stopPropagation()
                                                  }
                                                  sx={{
                                                    bgcolor: "#f0fdf4",
                                                    color: "#16a34a",
                                                    "&:hover": {
                                                      bgcolor: "#dcfce7",
                                                    },
                                                  }}
                                                >
                                                  <AddAPhotoIcon fontSize="small" />
                                                  <input
                                                    type="file"
                                                    hidden
                                                    multiple
                                                    accept="image/*"
                                                    disabled={submitting}
                                                    onChange={(e) =>
                                                      handleSubirFotoMotor(
                                                        motor.id_motor,
                                                        e,
                                                      )
                                                    }
                                                  />
                                                </IconButton>
                                              )}

                                              {/* Botón Detalles del Motor */}
                                              <Button
                                                size="small"
                                                sx={{
                                                  fontSize: "0.75rem",
                                                  fontWeight: "bold",
                                                  color: "#ea580c",
                                                }}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleVerDetalleMotor(motor);
                                                }}
                                              >
                                                Detalles
                                              </Button>
                                            </Box>
                                          </Box>

                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            display="block"
                                            sx={{ mb: 1 }}
                                          >
                                            Código:{" "}
                                            <code>{motor.codigo_motor}</code>
                                          </Typography>

                                          {/* 🌟 DATOS DE LA TABLA MADRE 'MOTOR' */}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "center",
                                              gap: 0.8,
                                              flexWrap: "wrap",
                                              mt: 0.5,
                                            }}
                                          >
                                            {/* Tipo de Corriente: 0 = Alterna, 1 = Continua */}
                                            <Chip
                                              size="small"
                                              label={
                                                motor.tipo_corriente === 0
                                                  ? "Corriente Alterna (CA)"
                                                  : "Corriente Continua (CC)"
                                              }
                                              sx={{
                                                height: 20,
                                                fontSize: "0.65rem",
                                                bgcolor: "#e2e8f0",
                                              }}
                                            />
                                          </Box>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "center",
                                              gap: 0.8,
                                              flexWrap: "wrap",
                                              mt: 0.5,
                                            }}
                                          >
                                            {/* Fases: 0 = Monofásico, 1 = Trifásico */}
                                            <Chip
                                              size="small"
                                              label={
                                                motor.mono_tri === 1
                                                  ? `Trifásico (${motor.num_fases} Fases)`
                                                  : `Monofásico (${motor.num_fases} Fases)`
                                              }
                                              sx={{
                                                height: 20,
                                                fontSize: "0.65rem",
                                                bgcolor: "#e2e8f0",
                                              }}
                                            />
                                          </Box>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              gap: 0.8,
                                              flexWrap: "wrap",
                                              mt: 0.5,
                                            }}
                                          >
                                            {/* Sincronismo: 0 = Asíncrono, 1 = Síncrono */}
                                            <Chip
                                              size="small"
                                              label={
                                                motor.asin_sin === 1
                                                  ? "Síncrono"
                                                  : "Asíncrono"
                                              }
                                              color="warning"
                                              variant="outlined"
                                              sx={{
                                                height: 20,
                                                fontSize: "0.65rem",
                                                fontWeight: "bold",
                                              }}
                                            />

                                            {/* Universal: Si es 1, mostramos el chip */}
                                            {motor.universal === 1 && (
                                              <Chip
                                                size="small"
                                                label="Universal"
                                                sx={{
                                                  height: 20,
                                                  fontSize: "0.65rem",
                                                  bgcolor: "#fde68a",
                                                  color: "#92400e",
                                                }}
                                              />
                                            )}

                                            {/* Soporte Tecnico: Si es 1, mostramos el chip */}
                                            <Chip
                                              size="small"
                                              label={
                                                motor.soporte_tec === 1
                                                  ? "Soporte Tecnico: Si"
                                                  : "Soporte Tecnico: No"
                                              }
                                              color="warning"
                                              variant="outlined"
                                              sx={{
                                                height: 20,
                                                fontSize: "0.65rem",
                                                fontWeight: "bold",
                                              }}
                                            />
                                          </Box>
                                        </Box>
                                      ))
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>
            ))}
          </>
        )}

        {/* 📦 3. EL MODAL COMPONENTE INDEPENDIENTE */}
        <ModalLineaBombeo
          key={lineaAEditar?.id_linea_bombeo || "nueva-linea"}
          open={modalLineaOpen}
          onClose={() => setModalLineaOpen(false)}
          modo={modalLineaModo}
          lineaSeleccionada={lineaAEditar}
          idEstacion={idEstacion}
          onSaveSuccess={cargarArbolOperativo}
        />
      </Box>

      {/* 📄 DIÁLOGO: DETALLES DE INGENIERÍA DE LA BOMBA */}
      <Dialog
        open={openBombaModal}
        onClose={() => setOpenBombaModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontWeight: "bold", color: "primary.main", bgcolor: "#f8fafc" }}
        >
          Ficha Técnica Avanzada - Bomba
        </DialogTitle>
        <DialogContent dividers>
          {bombaSeleccionada?.detalles_bomba ? (
            <Grid container spacing={2} sx={{ pt: 1 }}>
              {/* 1. Presión de Descarga */}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Presión de Descarga
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {bombaSeleccionada.detalles_bomba.presion_descarga} PSI
                </Typography>
              </Grid>

              {/* 2. Altura de Elevación */}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Altura de Elevación
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {bombaSeleccionada.detalles_bomba.alt_elevacion_bomba} m
                </Typography>
              </Grid>

              {/* 3. Potencia Nominal (AÑADIDO Y CORREGIDO) */}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Potencia Nominal de la Bomba
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {bombaSeleccionada.detalles_bomba.pot_nom_bomba_hp} HP
                </Typography>
              </Grid>

              {/* 4. Velocidad Nominal (AÑADIDO Y CORREGIDO) */}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Velocidad Nominal de la Bomba
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {bombaSeleccionada.detalles_bomba.vel_nom_bomba_rpm} RPM
                </Typography>
              </Grid>

              {/* 5. Diámetro Succión / Carga */}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Diámetro Succión / Carga
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {bombaSeleccionada.detalles_bomba.diametro_succion}" /{" "}
                  {bombaSeleccionada.detalles_bomba.diametro_carga}"
                </Typography>
              </Grid>

              {/* 6. Dimensiones Impulsor */}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Dimensiones Impulsor
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {bombaSeleccionada.detalles_bomba.dimensiones_impulsor} mm
                </Typography>
              </Grid>

              {/* 7. Tipo Cabezal / Acople */}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Tipo Cabezal / Acople
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {bombaSeleccionada.detalles_bomba.tipo_cabezal} /{" "}
                  {bombaSeleccionada.detalles_bomba.tipo_acople}
                </Typography>
              </Grid>

              {/* 8. Estado del Acoplamiento (AÑADIDO Y EVALUADO) */}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Acoplamiento
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {bombaSeleccionada.detalles_bomba.acomplamiento === 1
                    ? "Alineado / Activo"
                    : "Desacoplado"}
                </Typography>
              </Grid>

              {/* 9. Peso Neto Equipo */}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Peso Neto Equipo
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {bombaSeleccionada.detalles_bomba.peso_bomba} Kg
                </Typography>
              </Grid>

              {/* 10. Lubricación / Rodamiento */}
              {/* 10. Lubricación / Rodamiento (Evaluación Sí cuenta / No cuenta) */}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Lubricación / Rodamiento
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  Lubricación:{" "}
                  <strong>
                    {bombaSeleccionada.detalles_bomba.lubricacion === 1
                      ? "Sí cuenta"
                      : "No cuenta"}
                  </strong>
                  {" / "}
                  Rodamiento:{" "}
                  <strong>
                    {bombaSeleccionada.detalles_bomba.rodamiento === 1
                      ? "Sí cuenta"
                      : "No tiene"}
                  </strong>
                </Typography>
              </Grid>

              {/* 11. Cabezal Succión/Descarga (Mantiene el ancho completo para balancear) */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "#f1f5f9",
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    mt: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 0.5, fontWeight: "bold", color: "text.primary" }}
                  >
                    Cabezal Succión / Descarga (Colectores)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Succión:{" "}
                    <strong>
                      {
                        bombaSeleccionada.detalles_bomba
                          .diametro_succion_cabezal
                      }
                      "
                    </strong>{" "}
                    | Descarga:{" "}
                    <strong>
                      {
                        bombaSeleccionada.detalles_bomba
                          .diametro_descarga_cabezal
                      }
                      "
                    </strong>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Esta bomba no posee especificaciones adicionales cargadas.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* 📄 DIÁLOGO: DETALLES DE INGENIERÍA DEL MOTOR */}
      <Dialog
        open={openMotorModal}
        onClose={() => setOpenMotorModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontWeight: "bold", color: "warning.dark", bgcolor: "#fffbeb" }}
        >
          Ficha Técnica Avanzada - Motor Eléctrico
        </DialogTitle>
        <DialogContent dividers>
          {motorSeleccionado?.detalles_motor ? (
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Potencia Eléctrica
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {motorSeleccionado.detalles_motor.pot_nom_motor_hp} HP (
                  {motorSeleccionado.detalles_motor.pot_nom_motor_kw} kW)
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Voltaje / Amperaje Operativo
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  color="primary.main"
                >
                  {motorSeleccionado.detalles_motor.tens_nom_operacion_v}V /{" "}
                  {motorSeleccionado.detalles_motor.tens_nom_operacion_amp} A
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Frecuencia / Eficiencia
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {motorSeleccionado.detalles_motor.frecuencia} Hz |{" "}
                  {motorSeleccionado.detalles_motor.eficencia}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Velocidad de Giro
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {motorSeleccionado.detalles_motor.vel_nom_motor_rpm} RPM
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Factor Potencia / Servicio
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  cos φ {motorSeleccionado.detalles_motor.factor_potencia / 100}{" "}
                  / FS {motorSeleccionado.detalles_motor.factor_servicio / 100}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Aislamiento / Protección
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {motorSeleccionado.detalles_motor.tipo_aislamiento} /{" "}
                  {motorSeleccionado.detalles_motor.grado_proteccion}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Modelo de Rodamiento
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  fontFamily="monospace"
                >
                  {motorSeleccionado.detalles_motor.rodamiento}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Tamaño Carcasa / Peso
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {motorSeleccionado.detalles_motor.tam_carcaza} /{" "}
                  {motorSeleccionado.detalles_motor.peso_motor} Kg
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Límites Ambientales
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  Máx {motorSeleccionado.detalles_motor.temp_ambiente_max}ºC a{" "}
                  {motorSeleccionado.detalles_motor.altitud_ambiente_max} msnm
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Este motor no posee especificaciones adicionales cargadas.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Componente Modular Independiente */}
      <ModalLineaBombeo
        key={lineaAEditar?.id_linea_bombeo || "nuevo"}
        open={modalLineaOpen}
        onClose={() => setModalLineaOpen(false)}
        modo={modalLineaModo}
        lineaSeleccionada={lineaAEditar}
        idEstacion={idEstacion}
        onSaveSuccess={cargarArbolOperativo}
      />

      {/* Componente Modular Independiente */}
      <ModalValvula
        key={valvulaAEditar?.id_valvula || "nueva-valvula"}
        open={modalValvulaOpen}
        onClose={() => setModalValvulaOpen(false)}
        modo={modalValvulaModo}
        valvulaSeleccionada={valvulaAEditar}
        idLineaBombeo={idLineaParaValvula}
        onSaveSuccess={cargarArbolOperativo}
      />

      {/* Componente Modular Independiente */}
      <ModalBomba
        key={bombaAEditar?.id_bomba || "nueva-bomba"}
        open={modalBombaOpen}
        onClose={() => setModalBombaOpen(false)}
        modo={modalBombaModo}
        bombaSeleccionada={bombaAEditar}
        idLineaBombeo={idLineaParaBomba}
        onSaveSuccess={cargarArbolOperativo}
      />

      {/* Componente Modular Independiente */}
      {/* ========================================== */}
      {/* 📄 MODAL UNIFICADO DE LA FICHA TÉCNICA    */}
      {/* ========================================== */}
      {modalFichaOpen && (
        <ModalDetalleBomba
          open={modalFichaOpen}
          onClose={() => setModalFichaOpen(false)}
          modo={modalFichaModo}
          detalleSeleccionado={fichaAEditar} // 🌟 Le pasa tus datos asíncronos reales
          idBomba={idBombaParaFicha} // 🌟 Le pasa el ID de la bomba vinculada
          userRole={userRole}
          handleEliminarFichaBomba={handleEliminarFichaBomba}
          onSaveSuccess={cargarArbolOperativo} // Ajusta al nombre de tu función para recargar la lista
        />
      )}

      <ModalMotor
        open={modalBaseMotorOpen}
        onClose={() => setModalBaseMotorOpen(false)}
        modo={modalBaseMotorModo}
        motorSeleccionado={motorCrudAEditar}
        idBomba={idBombaParaMotor}
        onSaveSuccess={cargarArbolOperativo}
      />

      <ModalDetalleMotor
        open={modalDetalleMotorOpen}
        onClose={() => setModalDetalleMotorOpen(false)}
        modo={modalDetalleMotorModo}
        detalleSeleccionado={detalleMotorAEditar}
        idMotor={idMotorParaDetalle}
        userRole={userRole}
        handleEliminarDetalleMotor={handleEliminarDetalleMotor}
        onSaveSuccess={cargarArbolOperativo}
      />

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
    </Box>
  );
};

export default LineasBombeoTab;
