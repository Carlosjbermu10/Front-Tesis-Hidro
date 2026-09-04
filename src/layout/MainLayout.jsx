import logoHidrocaribe from "../assets/logo_gobierno1.png";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import usuarioService from "../services/usuarioService";
import Swal from "sweetalert2";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  WaterDrop as EstacionIcon,
  Assessment as ReporteIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  Group as UsuariosIcon,
  ArrowDropDown as ArrowDropDownIcon,
  VpnKey as VpnKeyIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { Map as MapIcon } from "@mui/icons-material";

const drawerWidth = 260;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // 👤 Recuperamos los datos del usuario logueado desde el localStorage
  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : {};

  const [anchorEl, setAnchorEl] = useState(null);
  const [openPwdModal, setOpenPwdModal] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [pwdData, setPwdData] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Manejadores del Menú superior
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Manejadores del Modal de Contraseña
  const handlePwdChange = (e) => {
    setPwdData({ ...pwdData, [e.target.name]: e.target.value });
  };

  const handleCloseModal = () => {
    setOpenPwdModal(false);
    setPwdData({ actual: "", nueva: "", confirmar: "" }); // Limpiamos al cerrar
    setShowPwd(false);
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    // 1. Validación en el frontend: que las nuevas contraseñas coincidan
    if (pwdData.nueva !== pwdData.confirmar) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "La nueva contraseña y la confirmación no coinciden.",
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = "9999";
        },
      });
      return;
    }

    try {
      setPwdLoading(true);
      // 2. Disparamos al backend
      await usuarioService.cambiarPasswordPersonal({
        passwordActual: pwdData.actual,
        passwordNueva: pwdData.nueva,
      });

      // 3. Éxito
      Swal.fire({
        icon: "success",
        title: "¡Contraseña Actualizada!",
        text: "Tu clave de acceso ha sido cambiada exitosamente.",
        timer: 2500,
        showConfirmButton: false,
      });
      handleCloseModal();
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      const mensajeError =
        error.response?.data?.description ||
        "Hubo un problema al actualizar tu contraseña.";
      Swal.fire({
        icon: "error",
        title: "No se pudo cambiar",
        text: mensajeError,
        didOpen: () => {
          const swalContainer = document.querySelector(".swal2-container");
          if (swalContainer) swalContainer.style.zIndex = "9999";
        },
      });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // 📋 MENÚ BASE (Visible para todos los roles)
  const menuItems = [
    { text: "Vista General", icon: <DashboardIcon />, path: "/dashboard" },
    {
      text: "Estaciones de Bombeo",
      icon: <EstacionIcon />,
      path: "/estaciones",
    },
    {
      text: "Gestión de Mantenimiento",
      icon: <EngineeringIcon />,
      path: "/mantenimiento",
    }, // 🛠️ NUEVO MÓDULO AQUÍ
    { text: "Reportes Técnicos", icon: <ReporteIcon />, path: "/reportes" },
    { text: "Mapa Geoespacial", icon: <MapIcon />, path: "/mapa" },
  ];

  // 🔐 CONDICIONAL DE ROL: Inyectar módulos restringidos solo si es Admin o Supervisor
  if (userData.rol === "admin" || userData.rol === "supervisor") {
    menuItems.push(
      {
        text: "Bitácoras",
        icon: <AssignmentIcon />,
        path: "/bitacoras",
      },
      {
        text: "Gestión de Usuarios",
        icon: <UsuariosIcon />,
        path: "/usuarios",
      },
    );
  }

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar
        sx={{
          backgroundColor: "#005088",
          color: "white",
          py: 2,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
        }}
      >
        {/* 🖼️ LOGO INSTITUCIONAL DE HIDROCARIBE */}
        <Box
          component="img"
          src={logoHidrocaribe}
          alt="Logo Hidrocaribe"
          sx={{
            width: "45px",
            height: "45px",
            objectFit: "contain",
            borderRadius: "4px",
            backgroundColor: "white",
            p: 0.5,
            mr: 0,
          }}
        />
        <Typography variant="subtitle1" fontWeight="bold">
          SISTEMA CONTROL
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          MINAGUAS / HIDROCARIBE
        </Typography>
      </Toolbar>
      <Divider />

      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={isSelected}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: "#e3f2fd",
                    color: "#005088",
                    "& .MuiListItemIcon-root": { color: "#005088" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? "#005088" : "inherit",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: isSelected ? "bold" : "medium",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      {/* 🔴 Logout en el Sidebar */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ mx: 1, borderRadius: 2, mb: 1, color: "#d32f2f" }}
          >
            <ListItemIcon sx={{ color: "#d32f2f", minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Cerrar Sesión"
              primaryTypographyProps={{ fontWeight: "bold" }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f8" }}
    >
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: "none",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "white",
          color: "#334155",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            {menuItems.find((item) => item.path === location.pathname)?.text ||
              "Panel de Control"}
          </Typography>

          {/* 👤 MENÚ DESPLEGABLE DEL USUARIO */}
          {userData.nombre_completo && (
            <>
              <Button
                onClick={handleMenuOpen}
                sx={{
                  textTransform: "none",
                  color: "#475569",
                  fontWeight: "bold",
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  mr: 2,
                }}
              >
                {userData.nombre_completo}
                <ArrowDropDownIcon />
              </Button>

              {/* Contenido del Menú Desplegable */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{ elevation: 3, sx: { mt: 1, minWidth: 200 } }}
              >
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setOpenPwdModal(true);
                  }}
                >
                  <ListItemIcon>
                    <VpnKeyIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <Typography variant="body2" fontWeight="medium">
                    Cambiar Contraseña
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          )}

          {/* 🔴 Logout en el Header */}
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              borderRadius: 2,
              display: { xs: "none", sm: "flex" },
            }}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              borderRight: "1px solid #e0e0e0",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
        }}
      >
        {children}
      </Box>

      {/* 🌟 MODAL: CAMBIAR CONTRASEÑA */}
      <Dialog
        open={openPwdModal}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: "#005088",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <VpnKeyIcon /> Seguridad de Cuenta
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmitPassword}>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Por favor, ingresa tu contraseña actual para verificar tu
              identidad y luego escribe tu nueva clave de acceso.
            </Typography>

            <TextField
              fullWidth
              label="Contraseña Actual"
              name="actual"
              type={showPwd ? "text" : "password"}
              value={pwdData.actual}
              onChange={handlePwdChange}
              required
              margin="dense"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd(!showPwd)} edge="end">
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Nueva Contraseña"
              name="nueva"
              type={showPwd ? "text" : "password"}
              value={pwdData.nueva}
              onChange={handlePwdChange}
              required
              margin="dense"
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Confirmar Nueva Contraseña"
              name="confirmar"
              type={showPwd ? "text" : "password"}
              value={pwdData.confirmar}
              onChange={handlePwdChange}
              required
              margin="dense"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: "#f8fafc" }}>
            <Button
              onClick={handleCloseModal}
              color="inherit"
              disabled={pwdLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={pwdLoading}
            >
              {pwdLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default MainLayout;
