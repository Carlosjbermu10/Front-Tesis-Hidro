import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import LayersIcon from "@mui/icons-material/Layers";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import ShieldIcon from "@mui/icons-material/Shield";
import RouterIcon from "@mui/icons-material/Router";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Swal from "sweetalert2";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import TanqueFotosModal from "./TanqueFotosModal";
import TanqueModal from "./TanqueModal"; // Importa el modal que acabamos de crear
import tanqueService from "../../services/tanqueService";

export default function TanquesTab({ idEstacion, userRole }) {
  const [tanquesList, setTanquesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⚙️ ESTADOS DEL MODAL
  const [modalTanque, setModalTanque] = useState({ open: false, data: null });

  //ESTADOS
  const [modalFotos, setModalFotos] = useState({ open: false, tanque: null });

  const handleOpenFotos = (tanque) => {
    setModalFotos({ open: true, tanque });
  };

  const handleOpenTanque = (data = null) => {
    setModalTanque({ open: true, data });
  };

  const cargarTanques = async () => {
    try {
      setLoading(true);
      const res = await tanqueService.getTanquesTotal(idEstacion);
      setTanquesList(res.data || []);
    } catch (error) {
      console.error("Error al cargar los tanques consolidados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idEstacion) {
      // 🌟 Envoltura con setTimeout para que cargarTanques() se ejecute en el siguiente ciclo
      setTimeout(() => {
        cargarTanques();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEstacion]);

  // 🗑️ LÓGICA PARA ELIMINAR TANQUE
  const handleEliminarTanque = async (idTanque) => {
    const result = await Swal.fire({
      title: "¿Eliminar Tanque?",
      text: "Se borrará el tanque, sus fotografías y sus conexiones con los generadores de forma permanente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar definitivamente",
    });

    if (result.isConfirmed) {
      try {
        await tanqueService.deleteTanque(idTanque);
        Swal.fire({
          icon: "success",
          title: "Tanque Removido",
          timer: 1500,
          showConfirmButton: false,
        });
        cargarTanques(); // Refrescar lista
      } catch (error) {
        console.log(error);
        Swal.fire("Error", "No se pudo eliminar el equipo.", "error");
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
        <CircularProgress color="warning" />
        <Typography sx={{ ml: 2 }} color="text.secondary">
          Cargando sistemas de almacenamiento...
        </Typography>
      </Box>
    );
  }

  // Vista cuando la lista está vacía
  if (!tanquesList || tanquesList.length === 0) {
    return (
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
        <Typography color="text.secondary" sx={{ fontWeight: "medium" }}>
          No hay Tanques de combustible registrados en esta estación de bombeo.
        </Typography>
        {/* Aquí inyectaremos el botón de registrar en el paso 2 */}
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* ❌ CASO A: LISTA VACÍA */}
      {!tanquesList || tanquesList.length === 0 ? (
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
            sx={{ fontWeight: "medium", mb: 3 }}
          >
            No hay Tanques de combustible registrados en esta estación de
            bombeo.
          </Typography>
          {(userRole === "admin" || userRole === "supervisor") && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenTanque()}
              sx={{ fontWeight: "bold" }}
            >
              Registrar Primer Tanque
            </Button>
          )}
        </Box>
      ) : (
        /* 🟢 CASO B: LISTA CON DATOS */
        <>
          {(userRole === "admin" || userRole === "supervisor") && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenTanque()}
                sx={{ fontWeight: "bold" }}
              >
                Registrar Tanque
              </Button>
            </Box>
          )}

          <Grid container spacing={3}>
            {tanquesList.map((tanque) => (
              <Grid item xs={12} key={tanque.id_tanque}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderTop: "4px solid #0284c7",
                    borderRadius: 2,
                    position: "relative",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* 1. ENCABEZADO PRINCIPAL DEL TANQUE */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <LocalGasStationIcon
                          color="primary"
                          sx={{ fontSize: 28 }}
                        />
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="primary.dark"
                        >
                          Tanque de Almacenamiento
                        </Typography>
                        <Chip
                          label={`${tanque.volumen?.toLocaleString()} Litros Nominales`}
                          color="primary"
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      </Box>

                      {/* BOTONERA DE ACCIÓN ESTRICTA */}
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {(userRole === "admin" ||
                          userRole === "supervisor") && (
                          <IconButton
                            color="info"
                            onClick={() => handleOpenTanque(tanque)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {userRole === "admin" && (
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleEliminarTanque(tanque.id_tanque)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    <Grid container spacing={3}>
                      {/* 2. BLOQUE DE DATOS TÉCNICOS (Ficha Técnica) */}
                      <Grid item xs={12} md={7}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          fontWeight="bold"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1.5,
                          }}
                        >
                          <LayersIcon fontSize="small" /> Especificaciones del
                          Contenedor
                        </Typography>

                        <Grid
                          container
                          spacing={2}
                          sx={{
                            bgcolor: "#f8fafc",
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2">
                              <b>Material:</b>{" "}
                              {tanque.material_tanque || "No especificado"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2">
                              <b>Posición:</b>{" "}
                              {tanque.posicion || "No especificada"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2">
                              <b>Geometría:</b>{" "}
                              {tanque.geometria === 1
                                ? "Cilíndrico"
                                : tanque.geometria === 2
                                  ? "Prismático / Rectangular"
                                  : "Otra"}
                            </Typography>
                          </Grid>

                          <Grid item xs={12}>
                            <Divider sx={{ my: 0.5 }} />
                          </Grid>

                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2">
                              <b>Largo:</b>{" "}
                              {tanque.largo ? `${tanque.largo} m` : "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2">
                              <b>Ancho / Diámetro:</b>{" "}
                              {tanque.ancho ? `${tanque.ancho} m` : "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2">
                              <b>Espesor Plancha:</b>{" "}
                              {tanque.espesor ? `${tanque.espesor} m` : "N/A"}
                            </Typography>
                          </Grid>

                          <Grid item xs={12}>
                            <Divider sx={{ my: 0.5 }} />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <b>Capacidad Máxima:</b>{" "}
                              {tanque.cap_max_tanque?.toLocaleString()} L
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <b>Total Litros Útiles:</b>{" "}
                              {tanque.total_litros?.toLocaleString()} L
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* 3. SEGURIDAD Y ENTORNO */}
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          fontWeight="bold"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 2.5,
                            mb: 1.5,
                          }}
                        >
                          <ShieldIcon fontSize="small" /> Seguridad y Perímetro
                        </Typography>
                        <Grid
                          container
                          spacing={2}
                          sx={{
                            bgcolor: "#f0fdf4",
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid #bbf7d0",
                          }}
                        >
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2">
                              <b>Posee Extintor:</b>{" "}
                              {tanque.extintor === 1 ? "✅ Sí" : "❌ No"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2">
                              <b>Área Cercada:</b>{" "}
                              {tanque.area_cercada === 1 ? "✅ Sí" : "❌ No"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2">
                              <b>Tipo Cerramiento:</b>{" "}
                              {tanque.tipo_cerramiento || "Ninguno"}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>

                      {/* 4. GALERÍA FOTOGRÁFICA DEL TANQUE Y BOTONES DE ACCIÓN */}
                      <Grid
                        item
                        xs={12}
                        md={5}
                        sx={{ display: "flex", flexDirection: "column" }}
                      >
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          fontWeight="bold"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1.5,
                          }}
                        >
                          <AspectRatioIcon fontSize="small" /> Registro
                          Fotográfico
                        </Typography>

                        {/* Caja de la Galería */}
                        <Box
                          sx={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 2,
                            p: 1.5,
                            minHeight: 160,
                            display: "flex",
                            gap: 1.5,
                            flexWrap: "wrap",
                            bgcolor: "#fafafa",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 2, // Pequeño margen inferior para separar de los botones
                          }}
                        >
                          {tanque.fotos && tanque.fotos.length > 0 ? (
                            tanque.fotos.map((foto) => (
                              <Box
                                key={foto.id_tanque_foto}
                                component="img"
                                src={foto.foto_url}
                                alt="Registro de Tanque"
                                sx={{
                                  width: 130,
                                  height: 130,
                                  objectFit: "cover",
                                  borderRadius: 2,
                                  boxShadow: 1,
                                  border: "2px solid white",
                                  transition: "transform 0.2s",
                                  "&:hover": { transform: "scale(1.05)" },
                                }}
                              />
                            ))
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontStyle: "italic" }}
                            >
                              Sin imágenes registradas.
                            </Typography>
                          )}
                        </Box>

                        {/* BOTONERA DE ACCIÓN INTEGRADA */}
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                            mt: "auto",
                          }}
                        >
                          {/* 📷 Botón de Fotografías */}
                          <Button
                            variant="contained"
                            color="info"
                            size="small"
                            startIcon={<PhotoCameraIcon />}
                            onClick={() => handleOpenFotos(tanque)}
                            sx={{ textTransform: "none", fontWeight: "bold" }}
                          >
                            Fotos ({tanque.fotos?.length || 0})
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* 5. SECCIÓN RELACIONES VINCULADAS: GENERADORES QUE ALIMENTA */}
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="primary.dark"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          fontWeight: "bold",
                          mb: 1.5,
                        }}
                      >
                        <RouterIcon fontSize="small" /> Generadores de Respaldo
                        Alimentados por este Tanque
                      </Typography>

                      {tanque.generadores_asociados &&
                      tanque.generadores_asociados.length > 0 ? (
                        <Grid container spacing={2}>
                          {tanque.generadores_asociados.map((gen) => (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              key={gen.id_generador}
                            >
                              <Box
                                sx={{
                                  p: 2,
                                  bgcolor: "white",
                                  border: "1px solid #93c5fd",
                                  borderRadius: 1.5,
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  color="text.primary"
                                >
                                  ⚡ Generador — {gen.potencia_principal} kW
                                </Typography>
                                <Divider sx={{ my: 0.8 }} />
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  <b>Suministro:</b> {gen.tipo_suministro}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  <b>Tubería:</b> Ø {gen.diametro_tuberia}"
                                </Typography>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  <b>Longitud Línea:</b> {gen.longitud_linea} m
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          Este tanque no se encuentra vinculado a ninguna línea
                          de suministro de generadores actualmente.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* 🌟 RENDERIZADO DEL MODAL */}
      <TanqueModal
        open={modalTanque.open}
        onClose={() => setModalTanque({ open: false, data: null })}
        idEstacion={idEstacion}
        tanqueData={modalTanque.data}
        onSuccess={cargarTanques}
      />

      {/* 🌟 RENDERIZADO DEL MODAL DE FOTOS */}
      <TanqueFotosModal
        open={modalFotos.open}
        onClose={() => setModalFotos({ open: false, tanque: null })}
        tanque={modalFotos.tanque}
        userRole={userRole}
        onSuccess={cargarTanques}
      />
    </Box>
  );
}
