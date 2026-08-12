import { useRef } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 📍 Configuramos el ícono estándar de Leaflet para el minimapa
const pinIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 🖱️ Subcomponente invisible que "escucha" los clics en el mapa
const DetectorDeClics = ({ alHacerClic }) => {
  useMapEvents({
    click(evento) {
      alHacerClic(evento.latlng.lat, evento.latlng.lng);
    },
  });
  return null;
};

export default function SelectorCoordenadas({ valorCoordenada, onChange }) {
  // Centro por defecto: Isla de Margarita
  const centroDefault = [10.9971, -63.9115];
  const markerRef = useRef(null);

  // 🌟 ESTADO DERIVADO: Calculamos la posición directamente desde la prop "valorCoordenada"
  // Esto elimina useState y useEffect, solucionando el error de renders en cascada de raíz.
  let posicion = null;

  if (
    valorCoordenada &&
    typeof valorCoordenada === "string" &&
    valorCoordenada.includes(",")
  ) {
    const partes = valorCoordenada.split(",");
    if (partes.length === 2) {
      const lat = parseFloat(partes[0].trim());
      const lng = parseFloat(partes[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        posicion = [lat, lng];
      }
    }
  }

  // Función que formatea los números y los envía a tu formulario padre
  const actualizarFormulario = (lat, lng) => {
    const formatoLimpio = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    onChange(formatoLimpio);
  };

  // Manejador para cuando el usuario hace clic en el mapa
  const manejarClicMapa = (lat, lng) => {
    actualizarFormulario(lat, lng);
  };

  // Manejador para cuando el usuario arrastra el marcador soltándolo en otro lado
  const manejarArrastre = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        actualizarFormulario(lat, lng);
      }
    },
  };

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        fontWeight="bold"
        gutterBottom
      >
        Geolocalización GPS
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 1 }}
      >
        Navega en el mapa y haz clic para fijar la posición exacta de la
        estación. Puedes arrastrar el marcador para mayor precisión.
      </Typography>

      {/* 🗺️ CONTENEDOR DEL MINIMAPA */}
      <Box
        sx={{
          height: 250,
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #cbd5e1",
          mb: 2,
          zIndex: 0,
        }}
      >
        <MapContainer
          center={posicion || centroDefault}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <DetectorDeClics alHacerClic={manejarClicMapa} />

          {posicion && (
            <Marker
              position={posicion}
              icon={pinIcon}
              draggable={true}
              eventHandlers={manejarArrastre}
              ref={markerRef}
            />
          )}
        </MapContainer>
      </Box>

      {/* 🔒 INPUT BLOQUEADO (Solo lectura) */}
      <TextField
        fullWidth
        label="Coordenadas Guardadas (Latitud, Longitud)"
        value={valorCoordenada || ""}
        variant="filled"
        InputProps={{
          readOnly: true,
          style: { backgroundColor: "#f8fafc", fontWeight: "bold" },
        }}
        helperText={
          valorCoordenada
            ? "Coordenada válida capturada."
            : "Esperando selección en el mapa..."
        }
        FormHelperTextProps={{
          style: {
            color: valorCoordenada ? "#16a34a" : "#94a3b8",
            fontWeight: "bold",
          },
        }}
      />
    </Box>
  );
}
