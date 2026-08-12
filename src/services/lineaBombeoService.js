import API from "./api"; // la ruta

export const lineaBombeoService = {
  // 🌳 GET: Obtener el árbol operativo completo de una estación
  getArbolOperativo: async (idEstacion) => {
    const response = await API.get(`/estacion/${idEstacion}/arbol-operativo`);
    return response.data; // Devuelve directamente el { status: "ok", data: [...] }
  },

  // 📸 POST: Registrar una nueva foto en una línea de bombeo específica
  uploadFotoLinea: async (idLinea, file) => {
    const formData = new FormData();

    // 🌟 foto_url' para que coincida con tu Multer
    formData.append("image", file);

    const response = await API.post(
      `/foto_linea_bombeo/add/${idLinea}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // 🗑️ DELETE: Eliminar una foto de la línea de bombeo usando su ID único
  deleteFotoLinea: async (idFoto) => {
    const response = await API.delete(`/foto_linea_bombeo/delete/${idFoto}`);
    return response.data;
  },

  // ➕ POST: Registrar una nueva línea de bombeo a una estación
  // Espera el ID de la ESTACIÓN padre (:id) y un objeto con los datos (payload)
  addLineaBombeo: async (idEstacion, datosLinea) => {
    const response = await API.post(
      `/linea_bombeo/add/${idEstacion}`,
      datosLinea,
    );
    return response.data;
  },

  // ✏️ PUT: Modificar los datos de una línea de bombeo existente
  // Espera el ID de la LÍNEA DE BOMBEO (:id) y el objeto con los datos actualizados
  updateLineaBombeo: async (idLinea, datosActualizados) => {
    const response = await API.put(
      `/linea_bombeo/update/${idLinea}`,
      datosActualizados,
    );
    return response.data;
  },

  // ❌ DELETE: Eliminar una línea de bombeo de forma estricta
  // Espera el ID de la LÍNEA DE BOMBEO (:id)
  deleteLineaBombeo: async (idLinea) => {
    const response = await API.delete(`/linea_Bombeo/delete/${idLinea}`);
    return response.data;
  },
};
