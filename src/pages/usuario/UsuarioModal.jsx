import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

import Swal from "sweetalert2";

import usuarioService from "../../services/usuarioService";

export default function UsuarioModal({ open, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);

  // 1. Estado para controlar la visibilidad (Falso por defecto para que oculte la clave)
  const [showPassword, setShowPassword] = useState(false);

  // 2. Funciones para cambiar el estado al hacer clic en el ojito
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const initialState = {
    nombre_completo: "",
    username: "",
    password: "",
    rol: "",
  };

  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      // Guardamos la respuesta del backend en una variable

      const response = await usuarioService.addUsuario(formData);

      Swal.fire({
        icon: "success",

        title: "¡Registro Exitoso!",

        // Usamos el mensaje de éxito del backend si existe, o uno por defecto

        text:
          response.data?.description ||
          "El personal ha sido dado de alta exitosamente.",

        timer: 2500,

        showConfirmButton: false,
      });

      setFormData(initialState); // 1. Limpiamos el formulario

      onSuccess(); // 2. Recargamos la tabla de fondo

      onClose(); // 3. Cerramos el modal
    } catch (error) {
      console.error("Error en submit de usuario:", error);

      // Capturamos EXACTAMENTE el mensaje de error que viene desde el backend

      const errorMsg =
        error.response?.data?.description ||
        "No se pudo registrar el usuario. Hubo un error de comunicación con el servidor.";

      // Mostramos la alerta configurada para el error

      Swal.fire({
        icon: "error",

        title: "Error en el Registro",

        text: errorMsg,

        confirmButtonColor: "#d33",

        confirmButtonText: "Entendido",

        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");

          if (swalContainer) swalContainer.style.zIndex = "9999";
        },
      });

      // 🛑 NOTA IMPORTANTE PARA LA INTERFAZ:

      // Como aquí NO llamamos a onClose() ni a setFormData(),

      // la pantalla se queda estática. El modal NO se cierra y no se borra lo que

      // el usuario ya había escrito. Podrá simplemente corregir el error y volver a intentar.
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialState);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && handleClose()}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{ bgcolor: "#0f172a", color: "white", fontWeight: "bold" }}
        >
          Registrar Nuevo Usuario
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Fila 1: Nombres */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre Completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre de Usuario (Username)"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ej. jperez"
                required
              />
            </Grid>

            {/* Fila 2: Rol y Contraseña */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Rol en el Sistema"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                required
              >
                <MenuItem value="">
                  <em>Seleccione...</em>
                </MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="supervisor">Supervisor</MenuItem>
                <MenuItem value="operador">Operador</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required variant="outlined">
                <InputLabel htmlFor="password-temporal">
                  Contraseña Temporal
                </InputLabel>
                <OutlinedInput
                  id="password-temporal"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Contraseña Temporal"
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#f8fafc" }}>
          <Button onClick={handleClose} color="inherit" disabled={submitting}>
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Confirmar Registro"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
