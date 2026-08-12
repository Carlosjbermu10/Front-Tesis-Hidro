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
};

export default usuarioService;
