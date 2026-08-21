import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
} from "@mui/material";
import Swal from "sweetalert2";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import PowerIcon from "@mui/icons-material/Power";
import { estacionService } from "../../services/estacionService"; // Importación destructurada según tu archivo

// Agrega este ícono a tus importaciones de MUI
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import FlashOnIcon from "@mui/icons-material/FlashOn";

// Importaremos el nuevo sub-componente (ajusta la ruta según tu estructura)
import LineasBombeoTab from "../lineaBombeo/LineasBombeoTab";

// Importamos
import BancoTransformadoresTab from "../bancoTransformadores/BancoTransformadoresTab";

// Importamos
import CcmTab from "../ccm/CcmTab";

//importamos
import GeneradorTab from "../generador/GeneradorTab";

//importamos
import TanqueTab from "../tanque/TanquesTab";

//importamos
import SelectorCoordenadas from "../../components/SelectorCoordenadas";

const GestionEstacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const [tabIndex, setTabIndex] = useState(0);
  const [estacionMadre, setEstacionMadre] = useState(null); // Datos del endpoint general
  const [detalles, setDetalles] = useState(null); // Datos de la tabla hija
  const [fotos, setFotos] = useState([]); // 👈 Inicializamos como arreglo vacío
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 📝 Estados para el Modal de Detalles Técnicos
  const [openDetallesModal, setOpenDetallesModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [detallesFormData, setDetallesFormData] = useState({
    ubicacion: "",
    municipio: "",
    coordenada_norte: "",
    coordenada_este: "",
    coordenada_gps: "",
    cota: "",
    caudal_diseño: "",
    poblacion_bene: "",
    caudal_diseño_entrada: "",
    caudal_diseño_salida: "",
    caudal_operacion: "",
    consumo: "",
    aduccion: 0, // 0: Gravedad, 1: Bombeo
    sistema_bombeo: 0, // 0: Serie, 1: Paralelo
    linea_bombeo: "",
    grupo_bombeo: "",
  });

  const handleAbrirEditarDetalles = (datosActuales) => {
    // Cargamos en el estado del formulario los datos exactos que ya existen
    setDetallesFormData({
      ubicacion: datosActuales.ubicacion || "",
      municipio: datosActuales.municipio || "",
      coordenada_norte: datosActuales.coordenada_norte || "",
      coordenada_este: datosActuales.coordenada_este || "",
      coordenada_gps: datosActuales.coordenada_gps || "",
      cota: datosActuales.cota || "",
      caudal_diseño: datosActuales.caudal_diseño || "",
      poblacion_bene: datosActuales.poblacion_bene || "",
      caudal_diseño_entrada: datosActuales.caudal_diseño_entrada || "",
      caudal_diseño_salida: datosActuales.caudal_diseño_salida || "",
      caudal_operacion: datosActuales.caudal_operacion || "",
      consumo: datosActuales.consumo || "",
      aduccion: datosActuales.aduccion ?? 0,
      sistema_bombeo: datosActuales.sistema_bombeo ?? 0,
      linea_bombeo: datosActuales.linea_bombeo || "",
      grupo_bombeo: datosActuales.grupo_bombeo || "",
    });

    // Abrimos el modal (que ahora estará lleno con la info de la estación)
    setOpenDetallesModal(true);
  };

  const cargarTodoElSistema = async () => {
    try {
      setLoading(true);
      setError("");

      // 🚀 Ejecutamos ambas peticiones en paralelo para máxima velocidad
      const [resMadre, resDetalle, resFotos] = await Promise.all([
        estacionService.getAll(), // Para buscar el nombre/código en el arreglo general

        // Trae el JSON de detalles que me pasaste
        estacionService.getById(id).catch((err) => {
          console.warn(
            "Esta estación no tiene detalles técnicos creados aún.",
            err,
          );
          return { data: [] }; // Evitamos que el Promise.all falle por completo
        }),

        estacionService.getFotosById(id).catch((err) => {
          console.warn("Esta estación no tiene fotos registradas.", err);
          return { data: [] };
        }),
      ]);

      // 1. Extraemos la estación del listado general usando el ID de la URL
      const listaEstaciones = Array.isArray(resMadre)
        ? resMadre
        : resMadre.data || [];
      const madreEncontrada = listaEstaciones.find(
        (est) => Number(est.id_est) === Number(id),
      );
      setEstacionMadre(madreEncontrada);

      // 2. Extraemos el objeto del JSON de detalles del backend
      const infoDetalle = resDetalle.data ? resDetalle.data[0] : null;
      setDetalles(infoDetalle);

      // 3. Mapeo Fotos Reales de Cloudinary
      const listaFotos = resFotos.data || [];
      setFotos(listaFotos);
    } catch (err) {
      console.error("Error cargando el ecosistema de la estación:", err);
      setError("Hubo un problema de conexión al extraer los datos técnicos.");
    } finally {
      setLoading(false);
    }
  };

  // ⬆️ Lógica para subir la imagen al seleccionar el archivo
  const handleSubirFoto = async (event) => {
    const file = event.target.files[0];
    if (!file) return; // Si cancela la ventana de selección, no hacemos nada

    try {
      setLoading(true); // Encendemos tu loader visual de la app

      // 1. Enviamos el archivo al backend ('id' es el de la estación)
      await estacionService.uploadFoto(id, file);

      // 2. Refrescamos el sistema en segundo plano para que las fotos aparezcan solas
      await cargarTodoElSistema();

      // 3. 🎉 Notificación de Éxito con SweetAlert2
      await Swal.fire({
        title: "¡Imagen Guardada!",
        text: "El material fotográfico se ha registrado y vinculado correctamente.",
        icon: "success",
        confirmButtonColor: "#0284c7", // Azul institucional
        confirmButtonText: "Entendido",
      });
    } catch (err) {
      console.error("Error al subir la imagen:", err);

      // 4. ❌ Notificación de Error con SweetAlert2
      Swal.fire({
        title: "Error de transferencia",
        text: "Hubo un error al intentar subir la foto. Verifique el tamaño o formato del archivo.",
        icon: "error",
        confirmButtonColor: "#64748b", // Gris neutro
      });
    } finally {
      setLoading(false); // Apagamos tu loader
      // 🧹 Limpiamos el input para poder subir la misma foto otra vez si el usuario lo desea o si falló
      event.target.value = null;
    }
  };

  // 🗑️ Lógica para eliminar una imagen específica
  const handleEliminarFoto = async (fotoId) => {
    // 1. ⚠️ Confirmación de destrucción con SweetAlert2 (Estilo de tu captura)
    const result = await Swal.fire({
      title: "¿Estás seguro de eliminar esta fotografía?",
      text: "Se borrará permanentemente de la base de datos y de los servidores de Cloudinary.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f", // Tu color rojo de acción inmediata
      cancelButtonColor: "#607d8b", // Tu color gris de cancelación
      confirmButtonText: "Sí, eliminar de inmediato",
      cancelButtonText: "Cancelar",
    });

    // Si el usuario se arrepiente, frenamos todo antes de encender el loader
    if (!result.isConfirmed) return;

    try {
      setLoading(true); // Encendemos tu loader visual

      // Ejecutamos el borrado en el backend/Cloudinary
      await estacionService.deleteFoto(fotoId);

      // Refrescamos el sistema en segundo plano para limpiar la grilla de imágenes
      await cargarTodoElSistema();

      // 2. 🎉 Confirmación exitosa
      await Swal.fire({
        title: "¡Fotografía Eliminada!",
        text: "La imagen ha sido removida con éxito de todos los registros.",
        icon: "success",
        confirmButtonColor: "#0284c7", // Azul institucional
        confirmButtonText: "Entendido",
      });
    } catch (err) {
      console.error("Error al eliminar la imagen:", err);

      // 3. ❌ Alerta de error
      Swal.fire({
        title: "Fallo en el servidor",
        text: "Hubo un error al intentar eliminar la foto de la base de datos o Cloudinary.",
        icon: "error",
        confirmButtonColor: "#64748b",
      });
    } finally {
      setLoading(false); // Apagamos tu loader pase lo que pase
    }
  };

  useEffect(() => {
    const inicializarModulo = async () => {
      await cargarTodoElSistema();
    };

    inicializarModulo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/estaciones")}
          sx={{ mt: 2 }}
        >
          Volver al Listado
        </Button>
      </Box>
    );
  }

  const handleEliminarDetalles = async () => {
    // 1. ⚠️ Alerta de confirmación de seguridad con SweetAlert2
    const result = await Swal.fire({
      title: "¿Estás completamente seguro de eliminar la Ficha Técnica?",
      text: "Esta acción es irreversible, se borrará permanentemente de la base de datos y no se podrá deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f", // Tu color rojo de peligro inmediato
      cancelButtonColor: "#607d8b", // Tu color gris de cancelación
      confirmButtonText: "Sí, eliminar de inmediato",
      cancelButtonText: "Cancelar",
    });

    // Si el usuario cancela o cierra el modal, frenamos la ejecución aquí
    if (!result.isConfirmed) return;

    try {
      setLoading(true); // Encendemos tu loader mientras borra

      // Ejecutamos la petición de borrado en el backend
      await estacionService.deleteDetalles(id);

      // 🔥 ¡LA CLAVE! Recargamos el sistema primero en segundo plano
      // para que 'detalles' vuelva a ser null y la interfaz se actualice sola
      await cargarTodoElSistema();

      // 2. 🎉 Notificación de Éxito con SweetAlert2
      await Swal.fire({
        title: "¡Ficha Técnica Eliminada!",
        text: "La ficha técnica ha sido removida correctamente del sistema.",
        icon: "success",
        confirmButtonColor: "#0284c7", // Azul institucional uniforme
        confirmButtonText: "Entendido",
      });
    } catch (err) {
      console.error("Error al eliminar los detalles técnicos:", err);

      // 3. ❌ Notificación de Error con SweetAlert2
      Swal.fire({
        title: "Error de eliminación",
        text: "Hubo un error al intentar eliminar la ficha técnica. Inténtelo de nuevo.",
        icon: "error",
        confirmButtonColor: "#64748b",
      });
    } finally {
      setLoading(false); // Apagamos el loader pase lo que pase
    }
  };

  const handleGuardarDetallesCompleto = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Armamos el payload con el orden estricto de tu Postman
      const payload = {
        ubicacion: detallesFormData.ubicacion,
        municipio: detallesFormData.municipio,
        coordenada_norte: detallesFormData.coordenada_norte,
        coordenada_este: detallesFormData.coordenada_este,
        coordenada_gps: detallesFormData.coordenada_gps,
        cota: detallesFormData.cota,
        caudal_diseño: detallesFormData.caudal_diseño,
        poblacion_bene:
          detallesFormData.poblacion_bene !== ""
            ? Number(detallesFormData.poblacion_bene)
            : 0,
        caudal_diseño_entrada:
          detallesFormData.caudal_diseño_entrada !== ""
            ? Number(detallesFormData.caudal_diseño_entrada)
            : 0,
        caudal_diseño_salida:
          detallesFormData.caudal_diseño_salida !== ""
            ? Number(detallesFormData.caudal_diseño_salida)
            : 0,
        caudal_operacion:
          detallesFormData.caudal_operacion !== ""
            ? Number(detallesFormData.caudal_operacion)
            : 0,
        consumo:
          detallesFormData.consumo !== ""
            ? Number(detallesFormData.consumo)
            : 0,
        aduccion: Number(detallesFormData.aduccion),
        sistema_bombeo: Number(detallesFormData.sistema_bombeo),
        linea_bombeo:
          detallesFormData.linea_bombeo !== ""
            ? Number(detallesFormData.linea_bombeo)
            : 0,
        grupo_bombeo:
          detallesFormData.grupo_bombeo !== ""
            ? Number(detallesFormData.grupo_bombeo)
            : 0,
      };

      // 🧠 Guardamos en una constante si es actualización o registro nuevo
      const esActualizacion = !!detalles;

      // 🌟 LA DECISIÓN INTELIGENTE (Peticiones al servidor)
      if (esActualizacion) {
        await estacionService.updateDetalles(id, payload);
      } else {
        await estacionService.createDetalles(id, payload);
      }

      // 🔄 Efecto fluido: Cerramos el modal y refrescamos la vista en segundo plano
      setOpenDetallesModal(false);
      await cargarTodoElSistema();

      // 🎉 Notificación de Éxito dinámica con SweetAlert2
      await Swal.fire({
        title: esActualizacion
          ? "¡Ficha Técnica Actualizada!"
          : "¡Ficha Técnica Registrada!",
        text: esActualizacion
          ? "Los cambios de la ficha técnica se han guardado con éxito."
          : "La nueva ficha técnica ha sido registrada correctamente en el sistema.",
        icon: "success",
        confirmButtonColor: "#0284c7", // Tu azul institucional uniforme
        confirmButtonText: "Entendido",
      });
    } catch (err) {
      console.error("Error al procesar la ficha técnica:", err);

      // 🌟Extraemos el error del backend.
      // Si el backend no mandó descripción (ej: se cayó el internet), usamos el genérico.
      const mensajeError =
        err.response?.data?.description ||
        "Hubo un error al intentar guardar los datos de la ficha técnica. Revise la conexión.";

      // ❌ Notificación de Error con SweetAlert2
      Swal.fire({
        title: "No se pudo guardar",
        text: mensajeError, // 👈 Aquí se inyecta tu mensaje del Cerco Geográfico
        icon: "warning", // 'warning' se ve mejor para errores de validación que 'error'
        confirmButtonColor: "#e11d48", // Un rojo elegante para indicar el fallo
        confirmButtonText: "Corregir datos",
        // 🌟 Obliga a SweetAlert a renderizarse sobre la capa del documento activo
        target: document.body,
        // Mantiene la alerta por encima del modal activo
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Botón Volver */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/estaciones")}
        sx={{ mb: 2, textTransform: "none", fontWeight: "bold" }}
      >
        Volver al Listado
      </Button>

      {/* Cabecera Dinámica usando datos cruzados */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="primary.main">
          {estacionMadre
            ? estacionMadre.nombre_est
            : `Estación de Bombeo #${id}`}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
          Sistema: <strong>{estacionMadre?.nombre_sistema || "N/A"}</strong> |
          Código: <code>{estacionMadre?.codigo || "N/A"}</code>
        </Typography>
      </Box>

      {/* 📋 MODAL: REGISTRAR DETALLES Y FICHA TÉCNICA DE LA ESTACIÓN */}
      <Dialog
        open={openDetallesModal}
        onClose={() => !submitting && setOpenDetallesModal(false)}
        maxWidth="md" // Cambiado a "md" para dar más comodidad visual por el volumen de datos
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{ fontWeight: "bold", color: "primary.main", pt: 3, pb: 1 }}
        >
          {detalles
            ? "Modificar Ficha Técnica"
            : "Registrar Ficha Técnica y Detalles de Operación"}
        </DialogTitle>

        <Box
          component="form"
          onSubmit={handleGuardarDetallesCompleto}
          noValidate
        >
          <DialogContent dividers sx={{ p: 3, backgroundColor: "#f8fafc" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* 🗺️ SECCIÓN: GEOGRAFÍA Y UBICACIÓN */}
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ fontWeight: "bold", mb: -1 }}
              >
                Ubicación y Georreferenciación
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Ubicación / Sector"
                  fullWidth
                  value={detallesFormData.ubicacion}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      ubicacion: e.target.value,
                    })
                  }
                  required
                  InputLabelProps={{ shrink: true }}
                  placeholder="Ej: Sector Carujo, Boca del Río"
                  sx={{ backgroundColor: "#ffffff" }}
                />
                <TextField
                  select
                  label="municipio"
                  fullWidth
                  value={detallesFormData.municipio || ""}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      municipio: e.target.value,
                    })
                  }
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                >
                  <MenuItem value="Antolín del Campo">
                    Antolín del Campo
                  </MenuItem>
                  <MenuItem value="Arismendi">Arismendi</MenuItem>
                  <MenuItem value="Díaz">Díaz</MenuItem>
                  <MenuItem value="García">García</MenuItem>
                  <MenuItem value="Gómez">Gómez</MenuItem>
                  <MenuItem value="Maneiro">Maneiro</MenuItem>
                  <MenuItem value="Marcano">Marcano</MenuItem>
                  <MenuItem value="Mariño">Mariño</MenuItem>
                  <MenuItem value="Península de Macanao">
                    Península de Macanao
                  </MenuItem>
                  <MenuItem value="Tubores">Tubores</MenuItem>
                  <MenuItem value="Villalba">Villalba</MenuItem>
                </TextField>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Coordenada Norte (UTM)"
                  fullWidth
                  value={detallesFormData.coordenada_norte}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      coordenada_norte: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  placeholder="Ej: 10°58'14.21\"
                  sx={{ backgroundColor: "#ffffff" }}
                />
                <TextField
                  label="Coordenada Este (UTM)"
                  fullWidth
                  value={detallesFormData.coordenada_este}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      coordenada_este: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  placeholder="Ej: 64°11'13.14\"
                  sx={{ backgroundColor: "#ffffff" }}
                />
                {/* 🌟 REEMPLAZO COORDENADAS GPS CON EL MINIMAPA INTERACTIVO */}
                <SelectorCoordenadas
                  valorCoordenada={detallesFormData.coordenada_gps}
                  onChange={(nuevaCoordenada) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      coordenada_gps: nuevaCoordenada,
                    })
                  }
                />
              </Box>

              {/* 💧 SECCIÓN: CAUDALES E INGENIERÍA */}
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ fontWeight: "bold", mb: -1, mt: 1 }}
              >
                Ingeniería Hidráulica y Población
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Cota de la Estación"
                  fullWidth
                  value={detallesFormData.cota}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      cota: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  placeholder="Ej: 8 M.S.N.M."
                  sx={{ backgroundColor: "#ffffff" }}
                />
                <TextField
                  label="Población Beneficiada (Hab.)"
                  type="number"
                  fullWidth
                  value={detallesFormData.poblacion_bene}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      poblacion_bene: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                />
                <TextField
                  label="Caudal de Diseño General"
                  fullWidth
                  value={detallesFormData.caudal_diseño}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      caudal_diseño: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  placeholder="Ej: 120 L/s"
                  sx={{ backgroundColor: "#ffffff" }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Caudal de Diseño Entrada (L/S)"
                  type="number"
                  fullWidth
                  value={detallesFormData.caudal_diseño_entrada}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      caudal_diseño_entrada: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                />
                <TextField
                  label="Caudal de Diseño Salida (L/S)"
                  type="number"
                  fullWidth
                  value={detallesFormData.caudal_diseño_salida}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      caudal_diseño_salida: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                />
                <TextField
                  label="Caudal Actual Operación (L/S)"
                  type="number"
                  fullWidth
                  value={detallesFormData.caudal_operacion}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      caudal_operacion: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                />
              </Box>

              {/* ⚡ SECCIÓN: COMPONENTES Y OPERACIÓN */}
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ fontWeight: "bold", mb: -1, mt: 1 }}
              >
                Configuración Eléctrica y Operativa
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Consumo Eléctrico (KW)"
                  type="number"
                  fullWidth
                  value={detallesFormData.consumo}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      consumo: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                />
                <TextField
                  select
                  label="Aducción a la Estación"
                  fullWidth
                  value={detallesFormData.aduccion}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      aduccion: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                >
                  <MenuItem value={0}>Gravedad</MenuItem>
                  <MenuItem value={1}>Bombeo</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Sistema de Bombeo"
                  fullWidth
                  value={detallesFormData.sistema_bombeo}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      sistema_bombeo: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                >
                  <MenuItem value={0}>Serie</MenuItem>
                  <MenuItem value={1}>Paralelo</MenuItem>
                </TextField>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Línea de Bombeo"
                  fullWidth
                  value={detallesFormData.linea_bombeo}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      linea_bombeo: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                />
                <TextField
                  label="Grupo de Bombeo (Cantidad)"
                  fullWidth
                  value={detallesFormData.grupo_bombeo}
                  onChange={(e) =>
                    setDetallesFormData({
                      ...detallesFormData,
                      grupo_bombeo: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "#ffffff" }}
                />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
            <Button
              onClick={() => setOpenDetallesModal(false)}
              color="inherit"
              sx={{ fontWeight: "bold", textTransform: "none" }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                fontWeight: "bold",
                px: 4,
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              {submitting ? "Guardando..." : "Registrar Ficha"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Barra de Pestañas */}
      {/* Barra de Pestañas */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
      >
        <Tab
          icon={<AssignmentIcon />}
          iconPosition="start"
          label="Ficha Técnica"
          sx={{ fontWeight: "bold" }}
        />
        <Tab
          icon={<PhotoCameraIcon />}
          iconPosition="start"
          label="Galería de Fotos"
          sx={{ fontWeight: "bold" }}
        />
        {/* 🌟 LÍNEAS DE BOMBEO */}
        <Tab
          icon={<PrecisionManufacturingIcon />}
          iconPosition="start"
          label="Líneas Operativas"
          sx={{ fontWeight: "bold" }}
        />
        {/* ⚡BANCO DE TRANSFORMADORES */}
        <Tab
          icon={<FlashOnIcon />}
          iconPosition="start"
          label="Transformadores"
          sx={{ fontWeight: "bold" }}
        />
        {/* 🎛️ CENTRO DE CONTROL DE MÁQUINAS (CCM) */}
        <Tab
          icon={<SettingsInputComponentIcon />}
          iconPosition="start"
          label="CCM"
          sx={{ fontWeight: "bold" }}
        />
        <Tab
          icon={<PowerIcon />}
          iconPosition="start"
          label="Generadores"
          sx={{ fontWeight: "bold" }}
        />
        <Tab
          icon={<PowerIcon />}
          iconPosition="start"
          label="Tanques"
          sx={{ fontWeight: "bold" }}
        />
      </Tabs>

      {/* PESTAÑA 0: DETALLES TÉCNICOS MAPEADOS */}
      {tabIndex === 0 &&
        (!detalles ? (
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
              Esta estación de bombeo aún no tiene registrada su Ficha Técnica
              en el sistema.
            </Typography>

            {(userRole === "admin" || userRole === "supervisor") && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenDetallesModal(true)}
                sx={{ fontWeight: "bold", textTransform: "none", px: 3 }}
              >
                REGISTRAR ESPECIFICACIONES TÉCNICAS
              </Button>
            )}
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: "8px" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                pb: 1.5,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ m: 0 }}
                color="primary.main"
              >
                Ubicación Geográfica
              </Typography>

              {/* 🛠️ AQUÍ ESTÁN TUS BOTONES DE ACCIÓN */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                {/* 🔵 BOTÓN MODIFICAR (Visible para admin y supervisor) */}
                {(userRole === "admin" || userRole === "supervisor") && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleAbrirEditarDetalles(detalles)} // 👈 Conectado para modificar
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      borderRadius: 1.5,
                    }}
                  >
                    Modificar Ficha
                  </Button>
                )}

                {/* 🔴 BOTÓN ELIMINAR (Estrictamente visible solo para el admin) */}
                {userRole === "admin" && (
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleEliminarDetalles} // 👈 Conectado para eliminar
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      borderRadius: 1.5,
                      boxShadow: "none",
                      "&:hover": { boxShadow: "none" },
                    }}
                  >
                    Eliminar Ficha
                  </Button>
                )}
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Municipio
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {detalles.municipio || "No registrado"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Dirección Exacta
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {detalles.ubicacion || "No registrada"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Cota de Altura
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {detalles.cota || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Coordenada Norte
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {detalles.coordenada_norte || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Coordenada Este
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {detalles.coordenada_este || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Coordenadas GPS
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {detalles.coordenada_gps || "N/A"}
                </Typography>
              </Grid>
            </Grid>

            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 2 }}
              color="primary.main"
            >
              Capacidad Hidráulica y Diseño Eléctrico
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Caudal de Diseño Nominal
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color="success.main"
                >
                  {detalles.caudal_diseño || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Caudal de Entrada
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {detalles.caudal_diseño_entrada} L/s
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Caudal de Salida
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {detalles.caudal_diseño_salida} L/s
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Caudal de Operación Actual
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {detalles.caudal_operacion} L/s
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Población Estimada Beneficiada
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {detalles.poblacion_bene
                    ? `${detalles.poblacion_bene.toLocaleString()} Habitantes`
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Consumo de Energía Eléctrica
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {detalles.consumo} kW/h
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        ))}

      {/* PESTAÑA 1: GALERÍA DE FOTOS (Por ahora vacía hasta recibir tu JSON) */}
      {tabIndex === 1 && (
        <Box>
          {fotos.length === 0 ? (
            <>
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
                  Esta estación de bombeo aún no cuenta con registro
                  fotográfico.
                </Typography>

                {(userRole === "admin" || userRole === "supervisor") && (
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<PhotoCameraIcon />}
                    sx={{ textTransform: "none", fontWeight: "bold" }}
                  >
                    Subir Primera Foto
                    {/* Input invisible que hace el trabajo sucio */}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleSubirFoto}
                    />
                  </Button>
                )}
              </Box>
            </>
          ) : (
            <>
              {(userRole === "admin" || userRole === "supervisor") && (
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}
                >
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<PhotoCameraIcon />}
                    sx={{ textTransform: "none", fontWeight: "bold" }}
                  >
                    Subir Nueva Foto
                    {/* Input invisible que hace el trabajo sucio */}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleSubirFoto}
                    />
                  </Button>
                </Box>
              )}

              <Grid container spacing={3}>
                {fotos.map((foto, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={foto.id_est_bombeo_foto}
                  >
                    <Card
                      sx={{
                        position: "relative",
                        borderRadius: 2,
                        boxShadow: 3,
                      }}
                    >
                      {/* 🔴 BOTÓN ELIMINAR FOTO (Estrictamente visible solo para el admin) */}
                      {userRole === "admin" && (
                        <IconButton
                          color="error"
                          onClick={() =>
                            handleEliminarFoto(foto.id_est_bombeo_foto)
                          } // Pasamos el ID único de la foto
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "rgba(255, 255, 255, 0.8)", // Fondo semitransparente
                            "&:hover": {
                              backgroundColor: "rgba(255, 0, 0, 0.1)",
                            },
                            zIndex: 2, // Asegura que quede por encima de la imagen
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}

                      <CardMedia
                        component="img"
                        height="200"
                        image={foto.foto_url} // 👈 Renderiza la imagen directa de Cloudinary
                        alt={`Registro ${index + 1}`}
                        sx={{ objectFit: "cover", bgcolor: "#f5f5f5" }}
                      />
                      <CardContent
                        sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="text.secondary"
                          textAlign="center"
                        >
                          Registro Fotográfico #{index + 1}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      )}
      {/* PESTAÑA 2: LÍNEAS DE BOMBEO Y SU ÁRBOL COMPLETO */}
      {tabIndex === 2 && (
        <LineasBombeoTab idEstacion={id} userRole={userRole} />
      )}

      {/* ⚡ PESTAÑA 3: BANCO DE TRANSFORMADORES */}
      {tabIndex === 3 && (
        <BancoTransformadoresTab idEstacion={id} userRole={userRole} />
      )}

      {/* 🎛️ PESTAÑA 4: CENTRO DE CONTROL DE MÁQUINAS */}
      {tabIndex === 4 && <CcmTab idEstacion={id} userRole={userRole} />}

      {/* 🔋 PESTAÑA 5: GENERADORES */}
      {tabIndex === 5 && <GeneradorTab idEstacion={id} userRole={userRole} />}

      {/* 🔋 PESTAÑA 6: TANQUES  */}
      {tabIndex === 6 && <TanqueTab idEstacion={id} userRole={userRole} />}
    </Box>
  );
};

export default GestionEstacion;
