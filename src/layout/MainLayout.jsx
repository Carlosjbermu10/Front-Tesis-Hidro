import logoHidrocaribe from "../assets/logo_gobierno1.png";
import { useState } from "react";
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
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  WaterDrop as EstacionIcon,
  Assessment as ReporteIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  Group as UsuariosIcon,
} from "@mui/icons-material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { Map as MapIcon } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";

const drawerWidth = 260;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // 👤 Recuperamos los datos del usuario logueado desde el localStorage
  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : {};

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

          {/* 👤 NOMBRE COMPLETO DINÁMICO */}
          {userData.nombre_completo && (
            <Typography
              variant="body2"
              sx={{
                mr: 2,
                fontWeight: "bold",
                color: "#475569",
                display: { xs: "none", sm: "block" },
              }}
            >
              {userData.nombre_completo}
            </Typography>
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
    </Box>
  );
};

export default MainLayout;
