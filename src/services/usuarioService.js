import API from "./api";

const usuarioService = {
  // 👥 GET: Obtener la lista total de usuarios (Permitido para Admin y Supervisor)
  getUsuarios: async () => {
    const response = await API.get("/auth/register");
    return response.data;
  },

  // ➕ POST: Registrar nuevo usuario (Estricto: Solo Admin)
  addUsuario: async (userData) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
  },

  // 🔄 PUT: Cambiar el estado (activo/inactivo) de un usuario (Estricto: Solo Admin)
  toggleEstadoUsuario: async (id_usuario, data) => {
    // data recibe un objeto como este: { estado: 0 } o { estado: 1 }
    const response = await API.put(`/auth/usuarios/${id_usuario}/estado`, data);
    return response.data;
  },
};

export default usuarioService;
