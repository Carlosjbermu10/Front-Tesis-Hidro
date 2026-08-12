import API from "./api"; // Ajusta la ruta de tu instancia Axios si es distinta

export const motorService = {
  // Crear motor asociado a una bomba
  addMotor: async (idBomba, data) => {
    const response = await API.post(`/motor/add/${idBomba}`, data);
    return response.data;
  },

  // Actualizar motor existente
  updateMotor: async (idMotor, data) => {
    const response = await API.put(`/motor/update/${idMotor}`, data);
    return response.data;
  },

  // Eliminar motor
  deleteMotor: async (idMotor) => {
    const response = await API.delete(`/motor/delete/${idMotor}`);
    return response.data;
  },

  // --- DETALLES DEL MOTOR ---
  // Consultar el detalle de un motor
  getDetalleMotor: async (idMotor) => {
    const response = await API.get(`/detalle_motor/${idMotor}`);
    return response; // Retornamos el response completo para el extractor inteligente
  },

  // Crear detalle para un motor
  addDetalleMotor: async (idMotor, data) => {
    const response = await API.post(`/detalle_motor/add/${idMotor}`, data);
    return response.data;
  },

  // Actualizar detalle existente (Recibe id_detalle_motor)
  updateDetalleMotor: async (idDetalleMotor, data) => {
    const response = await API.put(
      `/detalle_motor/update/${idDetalleMotor}`,
      data,
    );
    return response.data;
  },

  // Eliminar detalle (Recibe id_detalle_motor)
  deleteDetalleMotor: async (idDetalleMotor) => {
    const response = await API.delete(
      `/detalle_motor/delete/${idDetalleMotor}`,
    );
    return response.data;
  },

  // 📸 Subir hasta 5 fotos simultáneas a un motor específico
  uploadFotosMotor: async (idMotor, formData) => {
    const response = await API.post(`/foto_motor/add/${idMotor}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 🗑️ Eliminar una fotografía específica del motor por su ID primario
  deleteFotoMotor: async (idFoto) => {
    const response = await API.delete(`/foto_motor/delete/${idFoto}`);
    return response.data;
  },
};
