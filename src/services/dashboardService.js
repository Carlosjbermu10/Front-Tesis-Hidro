import API from "./api";

const dashboardService = {
  // Obtenemos toda la infraestructura de golpe
  getResumenOperativo: async () => {
    const [estacionesRes, tanquesRes, generadoresRes] = await Promise.all([
      API.get("/estaciones"),
      API.get("/tanque"),
      API.get("/generador"),
    ]);

    // Adaptamos el retorno asumiendo que tu backend devuelve { data: [...] }
    return {
      estaciones: estacionesRes.data?.data || estacionesRes.data || [],
      tanques: tanquesRes.data?.data || tanquesRes.data || [],
      generadores: generadoresRes.data?.data || generadoresRes.data || [],
    };
  },

  // 🌟 Módulo de Bitácora adaptado y protegido
  obtenerBitacora: async () => {
    const response = await API.get("/bitacora");
    // Extraemos directamente el arreglo alojado en .data, o un arreglo vacío si falla
    return response.data?.data || response.data || [];
  },
};

export default dashboardService;
