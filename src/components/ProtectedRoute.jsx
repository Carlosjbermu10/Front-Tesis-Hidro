import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Verificamos si existe el token guardado en el navegador
  const token = localStorage.getItem("token");

  // Si no hay token, lo redirigimos al login de inmediato
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, permitimos que vea la página protegida
  return children;
};

export default ProtectedRoute;
