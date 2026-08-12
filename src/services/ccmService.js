// ccmService.js
import api from "./api"; // O la ruta a tu instancia de Axios

const ccmService = {
  // 🔍 MOSTRAR: Obtener todo el CCM consolidado por Estación
  getCCMTotalForIdEstacion: async (idEstacion) => {
    const response = await api.get(`/ccm/estacion/total/${idEstacion}`);
    return response.data;
  },

  // 🟢 AGREGAR: Registrar un nuevo CCM Maestro
  addCCM: async (idEstacion, data) => {
    const response = await api.post(`/ccm/add/${idEstacion}`, data);
    return response.data;
  },

  // 🔵 MODIFICAR: Actualizar los datos del CCM Maestro
  updateCCM: async (idCcm, data) => {
    const response = await api.put(`/ccm/update/${idCcm}`, data);
    return response.data;
  },

  // 🔴 ELIMINAR: Remover por completo el CCM Maestro (Cascada)
  deleteCCM: async (idCcm) => {
    const response = await api.delete(`/ccm/delete/${idCcm}`);
    return response.data;
  },

  // 📸 Subir hasta 5 fotos simultáneas al CCM
  uploadFotosCCM: async (idCcm, formData) => {
    const response = await api.post(`/foto_ccm/add/${idCcm}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 🗑️ Eliminar una fotografía específica del CCM por su ID
  deleteFotoCCM: async (idFoto) => {
    const response = await api.delete(`/foto_ccm/delete/${idFoto}`);
    return response.data;
  },

  // 🔌 CRUD: Especificaciones de Circuito CCM
  addCircuitoCCM: async (idCcm, data) => {
    const response = await api.post(`/circuito_ccm/add/${idCcm}`, data);
    return response.data;
  },
  updateCircuitoCCM: async (idCircuito, data) => {
    const response = await api.put(`/circuito_ccm/update/${idCircuito}`, data);
    return response.data;
  },
  deleteCircuitoCCM: async (idCircuito) => {
    const response = await api.delete(`/circuito_ccm/delete/${idCircuito}`);
    return response.data;
  },

  // ⚙️ CRUD: Tipos de Arrancadores CCM
  addArrancadoresCCM: async (idCcm, data) => {
    const response = await api.post(`/arrancadores_ccm/add/${idCcm}`, data);
    return response.data;
  },
  updateArrancadoresCCM: async (idArrancador, data) => {
    const response = await api.put(
      `/arrancadores_ccm/update/${idArrancador}`,
      data,
    );
    return response.data;
  },
  deleteArrancadoresCCM: async (idArrancador) => {
    const response = await api.delete(
      `/arrancadores_ccm/delete/${idArrancador}`,
    );
    return response.data;
  },

  // 🎛️ CRUD: Juegos de Contactos CCM
  addContactosCCM: async (idCcm, data) => {
    const response = await api.post(`/juegos_contacto_ccm/add/${idCcm}`, data);
    return response.data;
  },
  updateContactosCCM: async (idContacto, data) => {
    const response = await api.put(
      `/juegos_contacto_ccm/update/${idContacto}`,
      data,
    );
    return response.data;
  },
  deleteContactosCCM: async (idContacto) => {
    const response = await api.delete(
      `/juegos_contacto_ccm/delete/${idContacto}`,
    );
    return response.data;
  },
};

export default ccmService;
