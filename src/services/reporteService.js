import API from "./api";

const reporteService = {
  // 💧 GET: Listar las estaciones para alimentar el buscador visual
  getEstaciones: async () => {
    const response = await API.get("/estaciones");
    return response.data;
  },

  // 📊 GET (Blob): Descargar PDF consolidado de toda la red institucional
  exportarTodasPDF: async () => {
    const response = await API.get("/estacion/exportar/pdf", {
      responseType: "blob",
    });
    return response;
  },

  // 🛢️ GET (Blob): Descargar la Ficha Técnica PDF de una estación específica por ID
  exportarEstacionPDF: async (id) => {
    const response = await API.get(`/estacion/exportar/pdf/${id}`, {
      responseType: "blob",
    });
    return response;
  },
};

export default reporteService;
