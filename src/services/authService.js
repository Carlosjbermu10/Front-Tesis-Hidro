import API from "./api";

export const authService = {
  login: async (username, password) => {
    // Hace la petición exacta a la ruta de Node.js
    const response = await API.post("/auth/login", { username, password });

    // Mapeamos de acuerdo a TU JSON:
    // response.data es todo el JSON que me pasaste.
    if (response.data && response.data.token) {
      // Guardamos el token en el navegador
      localStorage.setItem("token", response.data.token);
      // Guardamos el objeto de usuario (donde está id_usuario, nombre_completo, etc.)
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }

    return response.data;
  },

  logout: async () => {
    try {
      // Le avisamos al backend para que invalide el token de su lado
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Error avisando del logout al backend", error);
    } finally {
      // Pase lo que pase, limpiamos el navegador para seguridad del usuario
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
};
