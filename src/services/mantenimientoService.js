// src/services/mantenimientoService.js
import API from "./api";

export const mantenimientoService = {
  // 📖 Obtener historial de mantenimiento de un equipo (Requiere tipo de equipo y su ID)
  getHistorialMantenimiento: async (tipo_equipo, equipo_id) => {
    const response = await API.get(
      `mantenimiento/historial/${tipo_equipo}/${equipo_id}`,
    );
    return response.data;
  },

  // 📖 Obtener historial de horómetro (Requiere tipo de equipo y su ID)
  getHistorialHorometro: async (tipo_equipo, equipo_id) => {
    const response = await API.get(
      `horometro/historial/${tipo_equipo}/${equipo_id}`,
    );
    return response.data;
  },

  // ➕ Registrar nueva orden de mantenimiento (Recibe el payload completo)
  addOrdenMantenimiento: async (data) => {
    const response = await API.post(`mantenimiento/add`, data);
    return response.data;
  },

  // ✏️ Modificar/Cerrar orden de mantenimiento (Requiere el ID de la Orden)
  updateEstadoMantenimiento: async (idOrden, data) => {
    const response = await API.put(`mantenimiento/update/${idOrden}`, data);
    return response.data;
  },

  // ➕ Registrar lectura de horómetro (Recibe el payload completo)
  addLecturaHorometro: async (data) => {
    const response = await API.post(`horometro/add`, data);
    return response.data;
  },
};
