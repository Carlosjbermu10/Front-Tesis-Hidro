import API from "./api";

export const estacionService = {
  // Obtener todas las estaciones para la tabla principal
  getAll: async () => {
    const response = await API.get("/estaciones");
    return response.data;
  },

  // Obtener una sola estación con todo su detalle
  getById: async (id) => {
    const response = await API.get(`/detalle_estacion/${id}`);
    return response.data;
  },

  // 📸 Obtener el listado de fotos de la estación desde Cloudinary
  getFotosById: async (id) => {
    const response = await API.get(`/foto_Estacion/${id}`);
    return response.data;
  },

  // 🚀 4. Registrar una nueva estación (POST)
  create: async (data) => {
    const response = await API.post("/estacion/add", data);
    return response.data;
  },

  // 🚀 5. Modificar datos de una estación (PUT)
  update: async (id, data) => {
    const response = await API.put(`/estacion/update/${id}`, data);
    return response.data;
  },

  // 🚀 6. Eliminar una estación (DELETE)
  delete: async (id) => {
    const response = await API.delete(`/estacion/delete/${id}`);
    return response.data;
  },

  // 🚀 Registrar Detalles en una estación (POST)
  createDetalles: async (id, data) => {
    const response = await API.post(`/detalle_estacion/add/${id}`, data);
    return response.data;
  },

  // Eliminar Detalles  una estación (DELETE)
  deleteDetalles: async (id) => {
    // Pasamos el ID de la estación en la URL para borrar su fila hija
    const response = await API.delete(`/detalle_estacion/delete/${id}`);
    return response.data;
  },

  //Modificar Los detalles de una Estacion
  updateDetalles: async (id, payload) => {
    const response = await API.put(`/detalle_estacion/update/${id}`, payload);
    return response.data;
  },

  // 📸 SUBIR FOTO
  uploadFoto: async (estacionId, file) => {
    // Para enviar archivos, usamos FormData nativo de JS
    const formData = new FormData();
    formData.append("image", file); // "image" es la key exacta que pide tu Postman

    const response = await API.post(
      `/foto_Estacion/add/${estacionId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // 🗑️ ELIMINAR FOTO
  deleteFoto: async (fotoId) => {
    // Atención: Aquí pasamos el ID de la foto, no el de la estación
    const response = await API.delete(`/foto_Estacion/delete/${fotoId}`);
    return response.data;
  },
};
