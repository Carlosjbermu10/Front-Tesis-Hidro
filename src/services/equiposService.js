// src/services/equiposService.js
import API from "./api";

export const equiposService = {
  // 1. Traer todas las estaciones para el primer selector
  getEstaciones: async () => {
    const res = await API.get("/estaciones"); // ⚠️ Ajusta esta ruta si tu endpoint de estaciones se llama diferente
    return res.data;
  },

  // 2. Traer los equipos filtrados por el ID de la estación
  getMotoresPorEstacion: async (id_est) => {
    const res = await API.get(`/motor/estacion/${id_est}`);
    return res.data;
  },
  getBombasPorEstacion: async (id_est) => {
    const res = await API.get(`/bomba/estacion/${id_est}`);
    return res.data;
  },
  getValvulasPorEstacion: async (id_est) => {
    const res = await API.get(`/valvula/estacion/${id_est}`);
    return res.data;
  },
  getCCMsPorEstacion: async (id_est) => {
    const res = await API.get(`/ccm/estacion/${id_est}`);
    return res.data;
  },
  getGeneradoresPorEstacion: async (id_est) => {
    const res = await API.get(`/generador/estacion/${id_est}`); // Asumiendo que también creaste esta
    return res.data;
  },
};
