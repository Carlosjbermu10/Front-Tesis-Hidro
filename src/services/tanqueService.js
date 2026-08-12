import API from "./api";

export const tanqueService = {
  // 🛢️ Obtener Tanques consolidados con Fotos y Conexiones (Pestaña 6)
  getTanquesTotal: async (idEstacion) => {
    const response = await API.get(`/tanque/estacion/total/${idEstacion}`);
    return response.data;
  },

  // ➕ POST: Registrar nuevo tanque
  addTanque: async (idEstacion, data) => {
    const response = await API.post(`/tanque/add/${idEstacion}`, data);
    return response.data;
  },

  // ✏️ PUT: Modificar tanque existente
  updateTanque: async (idTanque, data) => {
    const response = await API.put(`/tanque/update/${idTanque}`, data);
    return response.data;
  },

  // 🗑️ DELETE: Eliminar tanque
  deleteTanque: async (idTanque) => {
    const response = await API.delete(`/tanque/delete/${idTanque}`);
    return response.data;
  },

  // 📸 POST: Subir fotos del tanque (Hasta 5)
  addFotosTanque: async (idTanque, formData) => {
    const response = await API.post(`/foto_tanque/add/${idTanque}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // 🗑️ DELETE: Eliminar una foto específica
  deleteFotoTanque: async (idFoto) => {
    const response = await API.delete(`/foto_tanque/delete/${idFoto}`);
    return response.data;
  },
};

export default tanqueService;
