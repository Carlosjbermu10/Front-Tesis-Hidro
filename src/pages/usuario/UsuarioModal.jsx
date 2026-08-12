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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Swal from "sweetalert2";
import usuarioService from "../../services/usuarioService";

export default function UsuarioModal({ open, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await usuarioService.addUsuario(formData);

      Swal.fire({
        icon: "success",
        title: "Usuario Registrado",
        text: "El personal ha sido dado de alta exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      setFormData(initialState); // Limpiamos el formulario
      onSuccess(); // Recargamos la tabla
      onClose(); // Cerramos el modal
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.description ||
        "No se pudo registrar el usuario. Verifique si el 'username' ya existe.";
      Swal.fire("Error en el Registro", errorMsg, "error");
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
            <Grid item xs={12}>
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contraseña Temporal"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
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
