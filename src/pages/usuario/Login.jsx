import logoMinaguas from "../../assets/logo_minaguas.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import Swal from "sweetalert2";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import {
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!credentials.username || !credentials.password) {
      setError("Por favor, rellene todos los campos.");
      return;
    }

    try {
      // Llamamos a la API
      await authService.login(credentials.username, credentials.password);

      // Si todo sale bien, saltamos directo al Dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      // Capturamos la propiedad "description" exacta que manda tu Node.js
      const mensajeError =
        err.response?.data?.description || "Usuario o contraseña incorrectos.";

      // Mantenemos el error en pantalla por si acaso
      setError(mensajeError);

      // Disparamos el SweetAlert con el mensaje del backend
      Swal.fire({
        icon: "error",
        title: "Acceso Denegado",
        text: mensajeError,
        confirmButtonColor: "#1976d2", // Azul acorde a MUI y Minaguas
        confirmButtonText: "Entendido",
      });
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="xs">
        <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Encabezado Corporativo */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              {/* 🖼️ LOGO INSTITUCIONAL DE MINAGUAS */}
              <Box
                component="img"
                src={logoMinaguas}
                alt="Logo MinAguas"
                sx={{
                  width: "180px", // Ajusta el tamaño según se adapte mejor tu imagen
                  height: "auto",
                  mb: 2,
                }}
              />
              <Typography
                variant="h5"
                component="h1"
                fontWeight="bold"
                color="primary.main"
                gutterBottom
              >
                SISTEMA DE CONTROL
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight="medium"
              >
                MINAGUAS / HIDROCARIBE
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Formulario */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Usuario o Correo"
                name="username"
                autoComplete="username"
                autoFocus
                value={credentials.username}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 1, fontWeight: "bold", textTransform: "none" }}
              >
                Iniciar Sesión
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
