// generadorService.js
import api from "./api";

const generadorService = {
  // 🔍 Obtener todo el Generador consolidado por Estación
  getGeneradorTotalForIdEstacion: async (idEstacion) => {
    const response = await api.get(`/generador/estacion/total/${idEstacion}`);
    return response.data;
  },

  // ⚡ CRUD: Generador Madre
  addGenerador: async (idEstacion, data) => {
    const response = await api.post(`/generador/add/${idEstacion}`, data);
    return response.data;
  },
  updateGenerador: async (idGenerador, data) => {
    const response = await api.put(`/generador/update/${idGenerador}`, data);
    return response.data;
  },
  deleteGenerador: async (idGenerador) => {
    const response = await api.delete(`/generador/delete/${idGenerador}`);
    return response.data;
  },

  // 📸 Subir hasta 5 fotos simultáneas al Generador
  uploadFotosGenerador: async (idGenerador, formData) => {
    const response = await api.post(
      `/foto_generador/add/${idGenerador}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // 🗑️ Eliminar una fotografía específica del Generador
  deleteFotoGenerador: async (idFoto) => {
    const response = await api.delete(`/foto_generador/delete/${idFoto}`);
    return response.data;
  },

  // ⚙️ CRUD: Especificaciones del Motor del Generador
  addMotorGenerador: async (idGenerador, data) => {
    const response = await api.post(
      `/motor_generador/add/${idGenerador}`,
      data,
    );
    return response.data;
  },
  updateMotorGenerador: async (idGenerador, data) => {
    const response = await api.put(
      `/motor_generador/update/${idGenerador}`,
      data,
    );
    return response.data;
  },
  deleteMotorGenerador: async (idGenerador) => {
    const response = await api.delete(`/motor_generador/delete/${idGenerador}`);
    return response.data;
  },

  // 📏 CRUD: Dimensiones y Peso del Generador
  addDimensionesGenerador: async (idGenerador, data) => {
    const response = await api.post(
      `/dimension_peso_generador/add/${idGenerador}`,
      data,
    );
    return response.data;
  },
  updateDimensionesGenerador: async (idGenerador, data) => {
    const response = await api.put(
      `/dimension_peso_generador/update/${idGenerador}`,
      data,
    );
    return response.data;
  },
  // 🗑️ Eliminar Dimensiones y Peso
  deleteDimensionesGenerador: async (idGenerador) => {
    const response = await api.delete(
      `/dimension_peso_generador/delete/${idGenerador}`,
    );
    return response.data;
  },

  // 🛢️ CRUD: Combustible y Lubricante del Generador
  addCombustibleGenerador: async (idGenerador, data) => {
    const response = await api.post(
      `/combustible_lubricante_generador/add/${idGenerador}`,
      data,
    );
    return response.data;
  },
  updateCombustibleGenerador: async (idGenerador, data) => {
    const response = await api.put(
      `/combustible_lubricante_generador/update/${idGenerador}`,
      data,
    );
    return response.data;
  },
  // 🗑️ Eliminar Combustible y Lubricante
  deleteCombustibleGenerador: async (idGenerador) => {
    const response = await api.delete(
      `/combustible_lubricante_generador/delete/${idGenerador}`,
    );
    return response.data;
  },

  // 🔗 CRUD: Asociación Tanque - Generador (Tabla Pivote)
  getTanquesForEstacion: async (idEstacion) => {
    const response = await api.get(`/tanque/estacion/${idEstacion}`);
    return response.data;
  },
  addTanqueGenerador: async (idTanque, idGenerador, data) => {
    const response = await api.post(
      `/tanque_generador/add/${idTanque}/${idGenerador}`,
      data,
    );
    return response.data;
  },
  updateTanqueGenerador: async (idTanque, idGenerador, data) => {
    const response = await api.put(
      `/tanque_generador/update/${idTanque}/${idGenerador}`,
      data,
    );
    return response.data;
  },
  deleteTanqueGenerador: async (idTanque, idGenerador) => {
    const response = await api.delete(
      `/tanque_generador/delete/${idTanque}/${idGenerador}`,
    );
    return response.data;
  },
};

export default generadorService;
