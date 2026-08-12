// src/services/bombaService.js
import API from "./api"; // la ruta

export const bombaService = {
  // ➕ Registrar bomba (Requiere el ID de la Línea)
  addBomba: async (idLinea, data) => {
    const response = await API.post(`bomba/add/${idLinea}`, data);
    return response.data;
  },

  // ✏️ Modificar bomba (Requiere el ID de la Bomba)
  updateBomba: async (idBomba, data) => {
    const response = await API.put(`bomba/update/${idBomba}`, data);
    return response.data;
  },

  // ❌ Eliminar bomba (Requiere el ID de la Bomba)
  deleteBomba: async (idBomba) => {
    const response = await API.delete(`bomba/delete/${idBomba}`);
    return response.data;
  },

  // ➕ Registrar Detalles Técnicos (Ficha) - Recibe ID de la Bomba
  addDetalleBomba: async (idBomba, data) => {
    const response = await API.post(`detalle_bomba/add/${idBomba}`, data);
    return response.data;
  },

  // ✏️ Modificar Detalles Técnicos - Recibe ID del Detalle
  updateDetalleBomba: async (idDetalleBomba, data) => {
    const response = await API.put(
      `detalle_bomba/update/${idDetalleBomba}`,
      data,
    );
    return response.data;
  },

  // ❌ Eliminar Detalles Técnicos - Recibe ID del Detalle
  deleteDetalleBomba: async (idDetalleBomba) => {
    const response = await API.delete(`detalle_bomba/delete/${idDetalleBomba}`);
    return response.data;
  },

  // ❌ Mostrar detalles de una bomba (Requiere el ID de la Bomba)
  getDetalleBomba: async (idBomba) => {
    const response = await API.get(`detalle_bomba/${idBomba}`);
    return response.data;
  },

  // 📸 Subir una o varias fotos a una bomba específica (hasta 5)
  uploadFotosBomba: async (idBomba, formData) => {
    const response = await API.post(`foto_bomba/add/${idBomba}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 🗑️ Eliminar una foto específica por su ID
  deleteFotoBomba: async (idFoto) => {
    return await API.delete(`/foto_bomba/delete/${idFoto}`);
  },
};
