import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/", // <-- Ajusta el puerto y ruta de tu API aquí
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adjuntar el Token JWT automáticamente en cada petición futura
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default API;
