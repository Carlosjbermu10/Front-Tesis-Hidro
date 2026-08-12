import API from "./api";

export const transformadorService = {
  // 🔍 Obtener todos los transformadores de una estación con sus fotos agrupadas
  getTransformadoresByEstacion: async (idEstacion) => {
    const response = await API.get(
      `/banco_transformadores/estacion/${idEstacion}`,
    );
    return response.data;
  },

  // ➕ Registrar un nuevo banco de transformadores
  addTransformador: async (idEstacion, data) => {
    const response = await API.post(
      `/banco_transformadores/add/${idEstacion}`,
      data,
    );
    return response.data;
  },

  // ✏️ Modificar un banco de transformadores existente
  updateTransformador: async (idTransformador, data) => {
    const response = await API.put(
      `/banco_transformadores/update/${idTransformador}`,
      data,
    );
    return response.data;
  },

  // 🗑️ Eliminar un banco de transformadores (Acción estricta)
  deleteTransformador: async (idTransformador) => {
    const response = await API.delete(
      `/banco_transformadores/delete/${idTransformador}`,
    );
    return response.data;
  },

  // 📸 Subir hasta 5 fotos simultáneas al banco de transformadores
  uploadFotos: async (idTransformador, formData) => {
    const response = await API.post(
      `/foto_banco_transformadores/add/${idTransformador}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // 🗑️ Eliminar una fotografía específica por su ID
  deleteFoto: async (idFoto) => {
    const response = await API.delete(
      `/foto_banco_transformadores/delete/${idFoto}`,
    );
    return response.data;
  },
};
