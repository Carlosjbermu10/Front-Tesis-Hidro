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
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import { IconButton } from "@mui/material"; // Asegúrate de agregarlo a tus imports de MUI
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PostAddIcon from "@mui/icons-material/PostAdd";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";

import Swal from "sweetalert2";

import generadorService from "../../services/generadorService.js";
import MultimediaGallery from "../../components/MultimediaGallery.jsx";
import GeneradorModal from "./GeneradorModal.jsx";
import MotorModal from "../motor/ModalMotor.jsx";
import CombustibleLubricanteModal from "./CombustibleLubricanteModal.jsx";
import DimensionesPesoModal from "./DimensionesPesoModal.jsx";
import AsociarTanqueModal from "../tanque/AsociarTanqueModal.jsx";

export default function GeneradorTab({ idEstacion, userRole }) {
  const [generadoresList, setGeneradoresList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📸 ESTADO PARA LA GALERÍA MULTIMEDIA
  const [galeriaData, setGaleriaData] = useState({
    open: false,
    fotos: [],
    titulo: "",
    index: 0,
    tipo: "",
  });

  //ESTADOS
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  //ESTADOS
  const [modalGenerador, setModalGenerador] = useState({
    open: false,
    data: null,
  });

  //ESTADOS
  const [modalMotor, setModalMotor] = useState({
    open: false,
    motorData: null,
    idGenerador: null,
  });

  //ESTADOS
  const [modalCombustible, setModalCombustible] = useState({
    open: false,
    combustibleData: null,
    idGenerador: null,
  });

  //ESTADOS
  const [modalDimensiones, setModalDimensiones] = useState({
    open: false,
    dimensionesData: null,
    idGenerador: null,
  });

  //ESTADOS
  const [modalAsociacion, setModalAsociacion] = useState({
    open: false,
    conexionData: null,
    idGenerador: null,
  });

  const handleOpenGenerador = (data = null) => {
    setModalGenerador({ open: true, data });
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res =
        await generadorService.getGeneradorTotalForIdEstacion(idEstacion);
      const lista = res?.data || [];
      setGeneradoresList(lista);
    } catch (error) {
      console.error("Error al cargar generadores:", error);
      Swal.fire(
        "Error",
        "No se pudieron cargar los datos de los generadores",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idEstacion) {
      // 🌟 Envolvemos la llamada en el setTimeout para proteger el flujo de renderizado
      setTimeout(() => {
        cargarDatos();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEstacion]);

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

  // 🟢 ACCIÓN: Subir Fotos Simultáneas al Generador (Admin/Supervisor)
  const handleSubirFotoGenerador = async (idGenerador, event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("image", files[i]); // "image" como espera el multer en Node
    }

    try {
      setSubiendoFoto(true);
      await generadorService.uploadFotosGenerador(idGenerador, formData);

      Swal.fire({
        icon: "success",
        title: "¡Fotos Registradas!",
        timer: 1500,
        showConfirmButton: false,
      });
      cargarDatos(); // Refresca en caliente
    } catch (error) {
      console.error("Error al subir fotos al Generador:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron procesar las imágenes.",
      });
    } finally {
      setSubiendoFoto(false);
      event.target.value = null;
    }
  };

  const handleEliminarGenerador = async (idGenerador) => {
    const result = await Swal.fire({
      title: "¿Eliminar Generador?",
      text: "Esta acción borrará el generador, sus fotos y todas sus especificaciones técnicas de forma permanente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar definitivamente",
    });

    if (result.isConfirmed) {
      try {
        await generadorService.deleteGenerador(idGenerador);
        Swal.fire({
          icon: "success",
          title: "Generador Removido",
          timer: 1500,
          showConfirmButton: false,
        });
        cargarDatos();
      } catch (error) {
        console.log(error);
        Swal.fire("Error", "No se pudo eliminar el equipo.", "error");
      }
    }
  };

  // 🔴 ACCIÓN: Conectar el "Cerebro de Borrado" de la galería con el Backend
  const eliminarFotoMaster = async (foto) => {
    if (!foto) return;

    Swal.fire({
      title: "¿Eliminar esta fotografía?",
      text: "Se borrará permanentemente del servidor y de la base de datos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, borrar imagen",
      cancelButtonText: "Cancelar",
      willOpen: () => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = "9999";
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Usamos la primary key de la tabla generador_fotos que me pasaste antes
          await generadorService.deleteFotoGenerador(foto.id_generador_foto);

          Swal.fire({
            icon: "success",
            title: "Eliminada",
            timer: 1500,
            showConfirmButton: false,
          });
          setGaleriaData((prev) => ({ ...prev, open: false, index: 0 }));
          cargarDatos();
        } catch (error) {
          console.error("Error al eliminar foto del generador:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo remover el archivo.",
          });
        }
      }
    });
  };

  const handleOpenMotor = (gen, isEdit, event) => {
    if (event) event.stopPropagation();
    setModalMotor({
      open: true,
      idGenerador: gen.id_generador,
      motorData: isEdit ? gen.motor : null,
    });
  };

  const handleEliminarMotor = async (idGenerador, event) => {
    if (event) event.stopPropagation();
    const result = await Swal.fire({
      title: "¿Eliminar especificaciones del motor?",
      text: "Esta acción removerá de forma definitiva el bloque del motor de este generador.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, borrar motor",
    });
    if (result.isConfirmed) {
      try {
        await generadorService.deleteMotorGenerador(idGenerador);
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

  const handleOpenCombustible = (gen, isEdit, event) => {
    if (event) event.stopPropagation();
    setModalCombustible({
      open: true,
      idGenerador: gen.id_generador,
      combustibleData: isEdit ? gen.combustible_lubricante : null,
    });
  };

  const handleOpenDimensiones = (gen, isEdit, event) => {
    if (event) event.stopPropagation();
    setModalDimensiones({
      open: true,
      idGenerador: gen.id_generador,
      dimensionesData: isEdit ? gen.dimension_peso : null,
    });
  };

  // 🗑️ ACCIÓN: Borrar bloque de Combustible y Lubricante (Solo Admin)
  const handleEliminarCombustible = async (idGenerador, event) => {
    if (event) event.stopPropagation();
    const result = await Swal.fire({
      title: "¿Eliminar datos de combustible y lubricante?",
      text: "Esta acción removerá de forma definitiva esta especificación del generador.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
    });
    if (result.isConfirmed) {
      try {
        await generadorService.deleteCombustibleGenerador(idGenerador);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          timer: 1500,
          showConfirmButton: false,
        });
        cargarDatos(); // Refresca la tarjeta en caliente
      } catch (error) {
        console.log(error);
        Swal.fire("Error", "No se pudo eliminar el registro.", "error");
      }
    }
  };

  // 🗑️ ACCIÓN: Borrar bloque de Dimensiones y Peso (Solo Admin)
  const handleEliminarDimensiones = async (idGenerador, event) => {
    if (event) event.stopPropagation();
    const result = await Swal.fire({
      title: "¿Eliminar dimensiones y peso?",
      text: "Se borrarán de forma definitiva las medidas registradas para este equipo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
    });
    if (result.isConfirmed) {
      try {
        await generadorService.deleteDimensionesGenerador(idGenerador);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          timer: 1500,
          showConfirmButton: false,
        });
        cargarDatos(); // Refresca la tarjeta en caliente
      } catch (error) {
        console.log(error);
        Swal.fire("Error", "No se pudo eliminar el registro.", "error");
      }
    }
  };

  const handleOpenAsociacion = (idGenerador, conexionData = null) => {
    setModalAsociacion({ open: true, idGenerador, conexionData });
  };

  const handleEliminarConexion = async (idTanque, idGenerador) => {
    const result = await Swal.fire({
      title: "¿Desconectar Tanque?",
      text: "Se eliminará la línea de suministro registrada entre este generador y el tanque.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, desconectar",
    });
    if (result.isConfirmed) {
      try {
        await generadorService.deleteTanqueGenerador(idTanque, idGenerador);
        Swal.fire({
          icon: "success",
          title: "Desconectado",
          timer: 1500,
          showConfirmButton: false,
        });
        cargarDatos();
      } catch (error) {
        console.log(error);
        Swal.fire("Error", "No se pudo remover la conexión.", "error");
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* ❌ CASO A: SI LA LISTA ESTÁ VACÍA (Renderiza la caja gris con el botón) */}
      {!generadoresList || generadoresList.length === 0 ? (
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
            No hay Generadores registrados en esta estación.
          </Typography>

          {(userRole === "admin" || userRole === "supervisor") && (
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => handleOpenGenerador()} // 👈 Ahora sí va a funcionar al 100%
              sx={{ fontWeight: "bold", textTransform: "none", px: 3 }}
            >
              Registrar Primer Generador
            </Button>
          )}
        </Box>
      ) : (
        /* 🟢 CASO B: SI YA EXISTEN GENERADORES (Renderiza la lista normal) */
        <>
          {/* LÍNEA 408 CORREGIDA: Sin paréntesis huérfanos por fuera de las llaves */}
          {(userRole === "admin" || userRole === "supervisor") && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => handleOpenGenerador()}
                sx={{ fontWeight: "bold" }}
              >
                Registrar Generador
              </Button>
            </Box>
          )}

          {generadoresList.map((gen) => (
            <Card
              key={gen.id_generador}
              sx={{
                mb: 4,
                boxShadow: 3,
                borderTop: "4px solid #f59e0b",
                position: "relative",
              }}
            >
              <CardContent>
                {/* ENCABEZADO */}
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
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="warning.dark"
                  >
                    Generador de Respaldo - {gen.potencia_principal} kW
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    {gen.fotos && gen.fotos.length > 0 && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PhotoCameraIcon />}
                        onClick={(e) =>
                          abrirGaleriaMaster(
                            gen.fotos,
                            `Fotos Generador #${gen.id_generador}`,
                            "GENERADOR",
                            e,
                          )
                        }
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                      >
                        Fotos ({gen.fotos.length})
                      </Button>
                    )}

                    {/* 🟢 BOTÓN AGREGAR FOTO */}
                    {(userRole === "admin" || userRole === "supervisor") && (
                      <IconButton
                        color="success"
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
                            handleSubirFotoGenerador(gen.id_generador, e)
                          }
                        />
                      </IconButton>
                    )}
                    {/* 🔵 BOTÓN MODIFICAR */}
                    {(userRole === "admin" || userRole === "supervisor") && (
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => handleOpenGenerador(gen)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}

                    {/* 🔴 BOTÓN ELIMINAR (Solo Admin) */}
                    {userRole === "admin" && (
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() =>
                          handleEliminarGenerador(gen.id_generador)
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* DATOS PRINCIPALES (MADRE) */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Especificaciones Eléctricas Principales:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2">
                        <b>Potencia:</b> {gen.potencia_principal} kW
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2">
                        <b>Voltaje:</b> {gen.voltaje} V
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2">
                        <b>Fase:</b> {gen.fase}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2">
                        <b>Corriente:</b> {gen.corriente} A
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2">
                        <b>Frecuencia:</b> {gen.frecuencia} Hz
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2">
                        <b>Revolución:</b> {gen.revolucion} RPM
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2">
                        <b>Factor Potencia:</b> {gen.factor_potencia}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2">
                        <b>Cableado:</b> {gen.cableado}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2">
                        <b>Clase Protección:</b> {gen.clase_proteccion}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2">
                        <b>Clase Aislamiento:</b> {gen.clase_aislamiento}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <b>Rodamiento:</b> {gen.rodamiento}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* ACORDEÓN 1: ESPECIFICACIONES DEL MOTOR */}
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
                        ⚙️ Especificaciones del Motor
                      </Typography>

                      <Box>
                        {!gen.motor &&
                        (userRole === "admin" || userRole === "supervisor") ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<PostAddIcon />}
                            onClick={(e) => handleOpenMotor(gen, false, e)}
                          >
                            Registrar Motor
                          </Button>
                        ) : gen.motor ? (
                          <>
                            {(userRole === "admin" ||
                              userRole === "supervisor") && (
                              <IconButton
                                color="info"
                                size="small"
                                onClick={(e) => handleOpenMotor(gen, true, e)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {userRole === "admin" && (
                              <IconButton
                                color="error"
                                size="small"
                                onClick={(e) =>
                                  handleEliminarMotor(gen.id_generador, e)
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

                  {gen.motor ? (
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Marca:</b> {gen.motor.marca}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Modelo:</b> {gen.motor.modelo}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Aspiración:</b> {gen.motor.aspiracion}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Nº Cilindros:</b> {gen.motor.num_cilindros}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Potencia Motor:</b> {gen.motor.potencia_motor} HP
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Velocidad Nominal:</b>{" "}
                            {gen.motor.velocidad_nominal} RPM
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Tipo Regulación:</b> {gen.motor.tipo_regulacion}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Arranque:</b> {gen.motor.sistema_arranque}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Circuito Eléctrico:</b>{" "}
                            {gen.motor.circuito_electrico} V
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Refrigeración:</b>{" "}
                            {gen.motor.refrigeracion === 1 ? "Sí" : "No"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Regulador de Velocidad:</b>{" "}
                            {gen.motor.regulador_velocidad === 1 ? "Sí" : "No"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Combustible:</b>{" "}
                            {gen.motor.combistible === 1
                              ? "Diésel"
                              : gen.motor.combistible === 2
                                ? "Gasolina"
                                : gen.motor.combistible === 3
                                  ? "Gas Natural"
                                  : "No especificado"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  ) : (
                    <AccordionDetails sx={{ textAlign: "center", py: 2 }}>
                      <Typography color="text.secondary">
                        No hay datos del motor registrados. Haga clic en el
                        botón superior para agregar.
                      </Typography>
                    </AccordionDetails>
                  )}
                </Accordion>

                {/* ACORDEÓN 2: DIMENSIONES Y PESO */}
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
                        📏 Dimensiones y Peso
                      </Typography>

                      <Box>
                        {!gen.dimension_peso &&
                        (userRole === "admin" || userRole === "supervisor") ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<PostAddIcon />}
                            onClick={(e) =>
                              handleOpenDimensiones(gen, false, e)
                            }
                          >
                            Registrar Dimensiones
                          </Button>
                        ) : gen.dimension_peso ? (
                          <>
                            {(userRole === "admin" ||
                              userRole === "supervisor") && (
                              <IconButton
                                color="info"
                                size="small"
                                onClick={(e) =>
                                  handleOpenDimensiones(gen, true, e)
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {/* 🔴 Botón eliminar estricto para Admin */}
                            {userRole === "admin" && (
                              <IconButton
                                color="error"
                                size="small"
                                onClick={(e) =>
                                  handleEliminarDimensiones(gen.id_generador, e)
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

                  {gen.dimension_peso ? (
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Largo:</b> {gen.dimension_peso.largo} m
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Ancho:</b> {gen.dimension_peso.ancho} m
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Alto:</b> {gen.dimension_peso.alto} m
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2">
                            <b>Peso:</b> {gen.dimension_peso.peso} kg
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <b>Cap. Depósito Propio:</b>{" "}
                            {gen.dimension_peso.cap_deposito_combustible_propio}{" "}
                            L
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <b>Autonomía:</b> {gen.dimension_peso.autonomia}{" "}
                            horas
                          </Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  ) : (
                    <AccordionDetails sx={{ textAlign: "center", py: 2 }}>
                      <Typography color="text.secondary">
                        No hay dimensiones registradas. Haga clic en el botón
                        superior para agregar.
                      </Typography>
                    </AccordionDetails>
                  )}
                </Accordion>

                {/* ACORDEÓN 3: COMBUSTIBLE Y LUBRICANTE */}
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
                        🛢️ Combustible y Lubricante
                      </Typography>

                      <Box>
                        {!gen.combustible_lubricante &&
                        (userRole === "admin" || userRole === "supervisor") ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<PostAddIcon />}
                            onClick={(e) =>
                              handleOpenCombustible(gen, false, e)
                            }
                          >
                            Registrar Consumo
                          </Button>
                        ) : gen.combustible_lubricante ? (
                          <>
                            {(userRole === "admin" ||
                              userRole === "supervisor") && (
                              <IconButton
                                color="info"
                                size="small"
                                onClick={(e) =>
                                  handleOpenCombustible(gen, true, e)
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}

                            {/* 🔴 Botón eliminar estricto para Admin */}
                            {userRole === "admin" && (
                              <IconButton
                                color="error"
                                size="small"
                                onClick={(e) =>
                                  handleEliminarCombustible(gen.id_generador, e)
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

                  {gen.combustible_lubricante ? (
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <b>Consumo Combustible:</b>{" "}
                            {gen.combustible_lubricante.consumo_combustible} L/h
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <b>Capacidad Aceite:</b>{" "}
                            {gen.combustible_lubricante.cap_aceite_lubricante} L
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <b>Consumo Lubricante:</b>{" "}
                            {gen.combustible_lubricante.consumo_lubricante} L/h
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <b>Tipo Lubricante:</b>{" "}
                            {gen.combustible_lubricante.tipo_lubricante ||
                              "No especificado"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  ) : (
                    <AccordionDetails sx={{ textAlign: "center", py: 2 }}>
                      <Typography color="text.secondary">
                        No hay datos de consumo registrados. Haga clic en el
                        botón superior para agregar.
                      </Typography>
                    </AccordionDetails>
                  )}
                </Accordion>

                {/* SECCIÓN INTERSECCIÓN: TANQUES ASOCIADOS */}
                {/* SECCIÓN INTERSECCIÓN: TANQUES ASOCIADOS */}
                <Box
                  sx={{
                    mt: 3,
                    p: 3,
                    bgcolor: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: 2,
                  }}
                >
                  {/* 👑 CABECERA FLEX: Título a la izquierda, Botón a la derecha */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="warning.dark"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontWeight: "bold",
                        fontSize: "1rem",
                      }}
                    >
                      <LocalGasStationIcon fontSize="small" /> Suministro de
                      Combustible Externo
                    </Typography>

                    {(userRole === "admin" || userRole === "supervisor") && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<LinkIcon />}
                        onClick={() => handleOpenAsociacion(gen.id_generador)}
                        sx={{
                          bgcolor: "white",
                          fontWeight: "bold",
                          textTransform: "none",
                          borderRadius: 1.5,
                        }}
                      >
                        Vincular Tanque
                      </Button>
                    )}
                  </Box>

                  {gen.tanques_asociados && gen.tanques_asociados.length > 0 ? (
                    <Grid container spacing={2}>
                      {gen.tanques_asociados.map((tanque) => (
                        <Grid item xs={12} sm={6} key={tanque.id_tanque}>
                          <Box
                            sx={{
                              p: 2.5,
                              bgcolor: "white",
                              border: "1px solid #e2e8f0",
                              borderRadius: 2,
                              position: "relative",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                          >
                            {/* 🛠️ BOTONERA INTERNA: Alineada arriba a la derecha de forma limpia */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                display: "flex",
                                gap: 0.5,
                                bgcolor: "#f1f5f9",
                                p: 0.5,
                                borderRadius: 1.5,
                              }}
                            >
                              {(userRole === "admin" ||
                                userRole === "supervisor") && (
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAsociacion(
                                      gen.id_generador,
                                      tanque,
                                    );
                                  }}
                                  sx={{
                                    p: 0.5,
                                    "&:hover": { bgcolor: "#e2e8f0" },
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              )}
                              {userRole === "admin" && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEliminarConexion(
                                      tanque.id_tanque,
                                      gen.id_generador,
                                    );
                                  }}
                                  sx={{
                                    p: 0.5,
                                    "&:hover": { bgcolor: "#fee2e2" },
                                  }}
                                >
                                  <LinkOffIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              )}
                            </Box>

                            {/* CONTENIDO TÉCNICO */}
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              sx={{
                                pr: 8,
                                color: "text.primary",
                                mb: 1,
                                fontSize: "0.95rem",
                              }}
                            >
                              Tanque -{" "}
                              {tanque.material_tanque || "Material N/A"}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{ mb: 0.5, color: "text.secondary" }}
                            >
                              <b style={{ color: "#334155" }}>Volumen:</b>{" "}
                              {tanque.volumen?.toLocaleString()} L
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ mb: 0.5, color: "text.secondary" }}
                            >
                              <b style={{ color: "#334155" }}>Suministro:</b>{" "}
                              {tanque.tipo_suministro}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              <b style={{ color: "#334155" }}>Tubería:</b> Ø{" "}
                              {tanque.diametro_tuberia}" |{" "}
                              <b style={{ color: "#334155" }}>Longitud:</b>{" "}
                              {tanque.longitud_linea} m
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic", textAlign: "center", py: 1 }}
                    >
                      Este generador no tiene tanques externos asociados. Se
                      alimenta de su depósito propio.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </>
      )}

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
        // onDelete={... se implementará luego}
        userRole={userRole}
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
        onDelete={eliminarFotoMaster} // 👈 ¡Conectado al backend!
        userRole={userRole}
      />

      {/* RENDER DEL MODAL */}
      <GeneradorModal
        open={modalGenerador.open}
        onClose={() => setModalGenerador({ open: false, data: null })}
        idEstacion={idEstacion}
        generadorData={modalGenerador.data}
        onSuccess={cargarDatos}
      />

      {/* MODAL EXTERNO DE ESPECIFICACIONES DEL MOTOR */}
      <MotorModal
        open={modalMotor.open}
        onClose={() =>
          setModalMotor({ open: false, motorData: null, idGenerador: null })
        }
        idGenerador={modalMotor.idGenerador}
        motorData={modalMotor.motorData}
        onSuccess={cargarDatos}
      />

      {/* MODAL EXTERNO DE COMBUSTIBLE Y LUBRICANTE */}
      <CombustibleLubricanteModal
        open={modalCombustible.open}
        onClose={() =>
          setModalCombustible({
            open: false,
            combustibleData: null,
            idGenerador: null,
          })
        }
        idGenerador={modalCombustible.idGenerador}
        combustibleData={modalCombustible.combustibleData}
        onSuccess={cargarDatos}
      />

      {/* MODAL EXTERNO DE DIMENSIONES Y PESO */}
      <DimensionesPesoModal
        open={modalDimensiones.open}
        onClose={() =>
          setModalDimensiones({
            open: false,
            dimensionesData: null,
            idGenerador: null,
          })
        }
        idGenerador={modalDimensiones.idGenerador}
        dimensionesData={modalDimensiones.dimensionesData}
        onSuccess={cargarDatos}
      />

      <AsociarTanqueModal
        open={modalAsociacion.open}
        onClose={() =>
          setModalAsociacion({
            open: false,
            conexionData: null,
            idGenerador: null,
          })
        }
        idEstacion={idEstacion}
        idGenerador={modalAsociacion.idGenerador}
        conexionData={modalAsociacion.conexionData}
        onSuccess={cargarDatos}
      />
    </Box>
  );
}
