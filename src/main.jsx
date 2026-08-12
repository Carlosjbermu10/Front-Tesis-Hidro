import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "leaflet/dist/leaflet.css";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

// Creamos la paleta de colores oficial del sistema
const theme = createTheme({
  palette: {
    mode: "light", // Forzamos modo claro para evitar contrastes raros
    primary: {
      main: "#005088", // El azul corporativo de MINAGUAS
      dark: "#00335c",
      light: "#e3f2fd",
    },
    text: {
      primary: "#1e293b", // Gris oscuro/azul para textos principales (visibilidad 100%)
      secondary: "#64748b", // Gris medio para subtítulos
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* CssBaseline normaliza los estilos CSS nativos en todos los navegadores */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
