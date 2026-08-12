import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/usuario/Login";
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Estaciones from "./pages/estacion/Estaciones";
import GestionEstacion from "./pages/estacion/GestionEstacion";
import Usuarios from "./pages/usuario/Usuarios";
import Reportes from "./pages/Reportes";
import Dashboard from "./pages/Dashboard";
import MapaEstaciones from "./pages/estacion/MapaEstaciones";
import Bitacora from "./pages/Bitacora";
import Mantenimiento from "./pages/mantenimiento/GestionMantenimiento";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* 🔐 RUTAS PROTEGIDAS: Envueltas con el Guardián */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/estaciones"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Estaciones />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/estacion/gestion/:id"
          element={
            <ProtectedRoute>
              <GestionEstacion />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Reportes />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 👥 Gestión de Personal del Sistema */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Usuarios />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 🌟 RUTA DEL MAPA */}
        <Route
          path="/mapa"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MapaEstaciones />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 🌟 RUTA DE LA BITACORA */}
        <Route
          path="/bitacoras"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Bitacora />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 🌟 RUTA DE LA Mantenimiento */}
        <Route
          path="/mantenimiento"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Mantenimiento />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirecciones automáticas de escape */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
