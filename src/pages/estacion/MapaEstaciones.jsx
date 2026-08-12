import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import {
  Map as MapIcon,
  WaterDrop,
  LocationOn,
  SettingsInputComponent,
  Lan,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import dashboardService from "../../services/dashboardService";

// 🎨 Pines CSS nativos con animación SCADA
const crearIconoScada = (color) => {
  return new L.DivIcon({
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <span style="background-color: ${color}; width: 20px; height: 20px; display: block; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px ${color}; position: absolute; z-index: 2;"></span>
        <span style="background-color: ${color}; width: 20px; height: 20px; display: block; border-radius: 50%; position: absolute; animation: pulse 1.5s infinite ease-in-out; opacity: 0.6; z-index: 1;"></span>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      </style>
    `,
    className: "custom-scada-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 13, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

export default function MapaEstaciones() {
  const [loading, setLoading] = useState(true);
  const [estaciones, setEstaciones] = useState([]);
  const [tanques, setTanques] = useState([]);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null);

  const centroInicial = [10.9971, -63.9115];

  useEffect(() => {
    const cargarDatosMapa = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getResumenOperativo();
        setEstaciones(data.estaciones || []);
        setTanques(data.tanques || []);
      } catch (error) {
        console.error("Error cargando el mapa:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatosMapa();
  }, []);

  const nodosMapa = useMemo(() => {
    return estaciones
      .map((est) => {
        let lat = null;
        let lng = null;

        // 🛡️ FILTRO CAZADOR DE ERRORES: Validamos que exista y que sea un texto real antes de usar .includes
        if (
          est.coordenada_gps &&
          typeof est.coordenada_gps === "string" &&
          est.coordenada_gps.includes(",")
        ) {
          const partes = est.coordenada_gps.split(",");

          // Verificamos que al separar por la coma tengamos exactamente 2 partes (Lat y Lng)
          if (partes.length === 2) {
            lat = parseFloat(partes[0].trim());
            lng = parseFloat(partes[1].trim());
          }
        }

        // Si la coordenada fue nula, no era un texto o no se pudo procesar, la saltamos con seguridad
        if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
          return null;
        }

        // Si pasó el filtro, procesamos sus tanques normales
        const tanquesAsociados = tanques.filter(
          (t) => t.est_bombeo_id_est === est.id_est,
        );
        const tieneAlerta = tanquesAsociados.some(
          (t) =>
            t.cap_max_tanque &&
            Number(t.total_litros) / Number(t.cap_max_tanque) <= 0.2,
        );

        return { ...est, posicion: [lat, lng], critico: tieneAlerta };
      })
      .filter(Boolean); // 🧹 La escoba barre los "null" y los saca del mapa sin romper nada
  }, [estaciones, tanques]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 100px)",
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* ENCABEZADO */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight="900"
          color="text.primary"
          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <MapIcon color="primary" fontSize="large" />
          Centro Cartográfico
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitoreo geográfico en tiempo real de la red de bombeo.
        </Typography>
      </Box>

      {/* 🌟 EL CONTENEDOR FLEXBOX QUE SÍ FUNCIONA 🌟 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" }, // Responsivo
          gap: 3,
        }}
      >
        {/* PANEL IZQUIERDO: EL MAPA GIGANTE */}
        <Box sx={{ flex: 2, minWidth: { xs: "100%", lg: "65%" } }}>
          <Paper
            elevation={4}
            sx={{
              height: "650px",
              width: "100%",
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid #cbd5e1",
            }}
          >
            <MapContainer
              center={centroInicial}
              zoom={11}
              style={{ height: "100%", width: "100%", zIndex: 1 }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* TUS PINES ANIMADOS RECIÉN SALIDOS DEL HORNO */}
              {nodosMapa.map((nodo) => (
                <Marker
                  key={nodo.id_est}
                  position={nodo.posicion}
                  icon={crearIconoScada(nodo.critico ? "#e11d48" : "#22c55e")}
                  eventHandlers={{ click: () => setEstacionSeleccionada(nodo) }}
                >
                  <Popup>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {nodo.nombre_est}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={nodo.critico ? "error" : "success.main"}
                      fontWeight="bold"
                    >
                      {nodo.critico
                        ? "🔴 Combustible Crítico"
                        : "🟢 Operando Normal"}
                    </Typography>
                  </Popup>
                </Marker>
              ))}

              {estacionSeleccionada && (
                <RecenterMap coords={estacionSeleccionada.posicion} />
              )}
            </MapContainer>
          </Paper>
        </Box>

        {/* PANEL DERECHO: TARJETA DE TELEMETRÍA ELEGANTE */}
        <Box sx={{ flex: 1, minWidth: { xs: "100%", lg: "300px" } }}>
          <Card
            elevation={4}
            sx={{
              height: "650px",
              borderRadius: 3,
              borderTop: "6px solid #0284c7",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent sx={{ p: 4, flexGrow: 1, overflowY: "auto" }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <SettingsInputComponent color="primary" /> Telemetría
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {estacionSeleccionada ? (
                <Box>
                  <Box
                    sx={{
                      mb: 4,
                      p: 2.5,
                      bgcolor: "#f0f9ff",
                      borderRadius: 2,
                      border: "1px solid #bae6fd",
                    }}
                  >
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      fontWeight="bold"
                    >
                      ESTACIÓN
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="900"
                      color="#0369a1"
                      sx={{ lineHeight: 1.2, mb: 0.5 }}
                    >
                      {estacionSeleccionada.nombre_est}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Código: <b>{estacionSeleccionada.codigo}</b>
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ p: 1, bgcolor: "#f1f5f9", borderRadius: 1.5 }}>
                        <Lan color="action" />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="bold"
                        >
                          SISTEMA
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {estacionSeleccionada.nombre_sistema}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ p: 1, bgcolor: "#f1f5f9", borderRadius: 1.5 }}>
                        <WaterDrop color="action" />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="bold"
                        >
                          TIPO
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {estacionSeleccionada.tipo_est || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 5 }}>
                    <Chip
                      label={
                        estacionSeleccionada.critico
                          ? "ALERTA CRÍTICA"
                          : "SISTEMA ESTABLE"
                      }
                      color={estacionSeleccionada.critico ? "error" : "success"}
                      sx={{
                        fontWeight: "900",
                        py: 3,
                        fontSize: "1rem",
                        width: "100%",
                        borderRadius: 2,
                      }}
                    />
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    textAlign: "center",
                    color: "text.secondary",
                    pb: 5,
                  }}
                >
                  <LocationOn sx={{ fontSize: 60, color: "#cbd5e1", mb: 2 }} />
                  <Typography variant="h6" fontWeight="medium" color="#94a3b8">
                    Esperando selección
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, px: 2 }}>
                    Haz clic en cualquier nodo del mapa.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
