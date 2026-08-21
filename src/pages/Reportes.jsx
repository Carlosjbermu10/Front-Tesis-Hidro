import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Paper,
  Alert,
} from "@mui/material";
import {
  Assessment as ReporteIcon,
  PictureAsPdf as PdfIcon,
  WaterDrop as EstacionIcon,
  Search as SearchIcon,
  CloudDownload as DownloadIcon,
  AdminPanelSettings as ShieldIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import reporteService from "../services/reporteService";

export default function Reportes() {
  const [estaciones, setEstaciones] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [descargandoGlobal, setDescargandoGlobal] = useState(false);
  const [descargandoIndividual, setDescargandoIndividual] = useState(false);

  // 👤 Obtenemos rol para validaciones visuales de seguridad
  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : {};
  const tienePermiso =
    userData.rol === "admin" || userData.rol === "supervisor";

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const res = await reporteService.getEstaciones();
        setEstaciones(res.data || []);
      } catch (error) {
        console.error("Error al recuperar las estaciones:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // 📥 Utilidad nativa para disparar la descarga del archivo Blob
  const procesarDescarga = (response, nombreSugerido) => {
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", nombreSugerido);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDescargaGlobal = async () => {
    try {
      setDescargandoGlobal(true);
      Swal.fire({
        title: "Compilando Matriz...",
        text: "Preparando el reporte institucional global.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await reporteService.exportarTodasPDF();
      procesarDescarga(res, "Matriz_General_Estaciones_Bombeo.pdf");

      Swal.close();
    } catch (error) {
      console.log(error);
      Swal.fire(
        "Error",
        "No se pudo generar el reporte general consolidado.",
        "error",
      );
    } finally {
      setDescargandoGlobal(false);
    }
  };

  const handleDescargaIndividual = async () => {
    if (!estacionSeleccionada) return;
    try {
      setDescargandoIndividual(true);
      Swal.fire({
        title: "Generando Ficha...",
        text: `Extrayendo datos de: ${estacionSeleccionada.nombre_est}`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // 🌟 Usamos id_est que viene de tu JSON real
      const res = await reporteService.exportarEstacionPDF(
        estacionSeleccionada.id_est,
      );
      const nombreArchivo = `Ficha_Tecnica_${estacionSeleccionada.nombre_est.replace(/\s+/g, "_")}.pdf`;
      procesarDescarga(res, nombreArchivo);

      Swal.close();
    } catch (error) {
      console.log(error);
      Swal.fire(
        "Error",
        "No se pudo generar la ficha técnica de esta estación.",
        "error",
      );
    } finally {
      setDescargandoIndividual(false);
    }
  };

  // 🔍 Filtrar estaciones según la barra de búsqueda mapeando 'nombre_est'
  const estacionesFiltradas = estaciones.filter(
    (est) =>
      est.nombre_est?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.nombre_sistema?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
          Inicializando módulos de impresión...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      {/* ENCABEZADO */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          color="text.primary"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <ReporteIcon color="primary" fontSize="large" /> Núcleo de Reportes e
          Ingeniería
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Exportación de documentos de auditoría técnica y matrices consolidadas
          en formato PDF oficial.
        </Typography>
      </Box>

      {!tienePermiso && (
        <Alert
          severity="warning"
          icon={<ShieldIcon />}
          sx={{ mb: 3, fontWeight: "medium" }}
        >
          Su cuenta actual posee acceso restringido para la generación de
          archivos PDF. Requiere credenciales de Supervisor o Administrador.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* PANEL IZQUIERDO: REPORTE GENERAL RED INSTITUCIONAL */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              height: "100%",
              boxShadow: 3,
              borderTop: "4px solid #1d4ed8",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
              >
                <PdfIcon color="error" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Reporte General Consolidado
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, textAlign: "justify" }}
              >
                Este informe genera de forma automática una matriz completa con
                el listado global de todas las estaciones registradas en la base
                de datos, resumiendo sus capacidades operativas de bombeo y
                estatus actual del sistema.
              </Typography>

              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f8fafc",
                  borderRadius: 2,
                  border: "1px dashed #cbd5e1",
                }}
              >
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  🔹 FORMATO SALIDA: PDF Estándar
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  🔹 ÁMBITO: Toda la Red Regional
                </Typography>
              </Box>
            </CardContent>

            <Box sx={{ p: 3, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDescargaGlobal}
                disabled={descargandoGlobal || !tienePermiso}
                sx={{ fontWeight: "bold", py: 1.5, textTransform: "none" }}
              >
                {descargandoGlobal
                  ? "Compilando Documento..."
                  : "Exportar Red Completa PDF"}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* PANEL DERECHO: SELECTOR VISUAL / FICHA TÉCNICA INDIVIDUAL */}
        <Grid item xs={12} md={7}>
          <Card sx={{ boxShadow: 3, borderTop: "4px solid #059669" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
              >
                <EstacionIcon color="success" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Ficha Técnica Completa por Estación de Bombeo
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Seleccione una estación de la lista interactiva para extraer su
                expediente técnico completo.
              </Typography>

              {/* BUSCADOR */}
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por nombre o sistema..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                  ),
                }}
              />

              {/* CONTENEDOR SCROLLABLE */}
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 220,
                  overflow: "auto",
                  mb: 3,
                  bgcolor: "#fafafa",
                }}
              >
                <List disablePadding>
                  {estacionesFiltradas.map((est) => {
                    // 🌟 Corrección: Comparamos usando 'id_est'
                    const seleccionado =
                      estacionSeleccionada?.id_est === est.id_est;
                    return (
                      <ListItemButton
                        key={est.id_est}
                        selected={seleccionado}
                        onClick={() => setEstacionSeleccionada(est)}
                        sx={{
                          borderBottom: "1px solid #e2e8f0",
                          "&.Mui-selected": {
                            bgcolor: "#ecfdf5",
                            color: "#047857",
                            "&:hover": { bgcolor: "#d1fae5" },
                            "& .MuiListItemIcon-root": { color: "#047857" },
                          },
                        }}
                      >
                        <ListItemIcon>
                          <EstacionIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={est.nombre_est} // 🌟 Ajustado a tu JSON
                          secondary={`${est.nombre_sistema} — [${est.codigo}]`} // 🌟 Ajustado a tu JSON
                          primaryTypographyProps={{
                            fontWeight: seleccionado ? "bold" : "medium",
                            fontSize: "0.95rem",
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                  {estacionesFiltradas.length === 0 && (
                    <Typography
                      variant="body2"
                      sx={{
                        p: 3,
                        textAlign: "center",
                        color: "text.secondary",
                        fontStyle: "italic",
                      }}
                    >
                      No se encontraron estaciones coincidentes.
                    </Typography>
                  )}
                </List>
              </Paper>

              {/* ACCIÓN DE GENERACIÓN */}
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<PdfIcon />}
                disabled={
                  !estacionSeleccionada ||
                  descargandoIndividual ||
                  !tienePermiso
                }
                onClick={handleDescargaIndividual}
                sx={{ fontWeight: "bold", py: 1.5, textTransform: "none" }}
              >
                {estacionSeleccionada
                  ? `Generar Ficha: ${estacionSeleccionada.nombre_est}`
                  : "Seleccione una estación de la lista"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
