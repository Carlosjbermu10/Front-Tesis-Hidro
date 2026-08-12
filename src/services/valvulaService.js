// src/services/valvulaService.js
import API from "./api"; // la ruta

export const valvulaService = {
  // ➕ Registrar válvula (Requiere el ID de la Línea de Bombeo)
  addValvula: async (idLinea, data) => {
    const response = await API.post(`valvula/add/${idLinea}`, data);
    return response.data;
  },

  // ✏️ Modificar válvula (Requiere el ID de la Válvula)
  updateValvula: async (idValvula, data) => {
    const response = await API.put(`valvula/update/${idValvula}`, data);
    return response.data;
  },

  // ❌ Eliminar válvula (Requiere el ID de la Válvula)
  deleteValvula: async (idValvula) => {
    const response = await API.delete(`valvula/delete/${idValvula}`);
    return response.data;
  },

  // ➕ Subir fotos a la válvula (Recibe el ID de la válvula y un objeto FormData)
  uploadFotosValvula: async (idValvula, formData) => {
    const response = await API.post(`foto_valvula/add/${idValvula}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // ❌ Eliminar una foto de la válvula (Recibe el ID de la foto)
  deleteFotoValvula: async (idFoto) => {
    const response = await API.delete(`foto_valvula/delete/${idFoto}`);
    return response.data;
  },
};
