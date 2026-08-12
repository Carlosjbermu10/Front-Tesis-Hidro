import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Tabs, Tab } from "@mui/material";
import { HistorialHorometro } from "./HistorialHorometro";

import { HistorialMantenimiento } from "./HistorialMantenimiento";
import { ModalOrdenMantenimiento } from "./ModalOrdenMantenimiento";
import { equiposService } from "../../services/equiposService";

export const GestionMantenimiento = () => {
  // 💡 ESTADOS NUEVOS: Para manejar el primer selector (Estaciones)
  const [listaEstaciones, setListaEstaciones] = useState([]);
  const [estacionId, setEstacionId] = useState("");
  const [cargandoEstaciones, setCargandoEstaciones] = useState(false);

  // Estados del Filtro 2 y 3
  const [tipoEquipo, setTipoEquipo] = useState("");
  const [equipoId, setEquipoId] = useState("");
  const [listaEquipos, setListaEquipos] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);

  // Estados para la tabla
  const [busquedaActiva, setBusquedaActiva] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [tabValue, setTabValue] = useState(0);

  const formatearDatos = (tipo, datosCrudos) => {
    switch (tipo) {
      case "MOTOR":
        return datosCrudos.map((item) => ({
          id: item.id_motor,
          label: `Motor ${item.marca_motor} - ${item.codigo_motor}`,
        }));
      case "BOMBA":
        return datosCrudos.map((item) => ({
          id: item.id_bomba,
          label: `Bomba ${item.marca_bomba} - ${item.modelo_bomba}`,
        }));
      case "VALVULA":
        return datosCrudos.map((item) => ({
          id: item.id_valvula,
          label: `Válvula ${item.marca_valvula} - ${item.modelo_valvula}`,
        }));
      case "CCM":
        return datosCrudos.map((item) => ({
          id: item.id_ccm,
          label: `CCM Tablero #${item.id_ccm}`,
        }));
      case "GENERADOR":
        return datosCrudos.map((item) => ({
          id: item.id_generador,
          label: `Generador ${item.potencia_principal}kW - ${item.fase} Fases`,
        }));
      default:
        return [];
    }
  };

  // 💡 EFECTO 1: Cargar la lista de Estaciones al abrir la pantalla
  useEffect(() => {
    const cargarEstaciones = async () => {
      setCargandoEstaciones(true);
      try {
        const res = await equiposService.getEstaciones();
        if (res && res.status === "ok" && res.data) {
          setListaEstaciones(res.data);
        }
      } catch (error) {
        console.error("Error cargando estaciones:", error);
      } finally {
        setCargandoEstaciones(false);
      }
    };
    cargarEstaciones();
  }, []);

  // 💡 EFECTO 2: Cargar equipos SOLO cuando el usuario ya eligió Estación y Tipo
  useEffect(() => {
    const cargarEquipos = async () => {
      // Si falta la estación o el tipo, no buscamos nada y vaciamos el abanico
      if (!estacionId || !tipoEquipo) {
        setListaEquipos([]);
        return;
      }

      setCargandoLista(true);
      setEquipoId(""); // Limpiamos el equipo si cambia la estación o el tipo

      try {
        let res;
        if (tipoEquipo === "MOTOR")
          res = await equiposService.getMotoresPorEstacion(estacionId);
        else if (tipoEquipo === "BOMBA")
          res = await equiposService.getBombasPorEstacion(estacionId);
        else if (tipoEquipo === "VALVULA")
          res = await equiposService.getValvulasPorEstacion(estacionId);
        else if (tipoEquipo === "CCM")
          res = await equiposService.getCCMsPorEstacion(estacionId);
        else if (tipoEquipo === "GENERADOR")
          res = await equiposService.getGeneradoresPorEstacion(estacionId);

        if (res && res.status === "ok" && res.data) {
          const opcionesListas = formatearDatos(tipoEquipo, res.data);
          setListaEquipos(opcionesListas);
        }
      } catch (error) {
        console.error("Error cargando la lista de equipos:", error);
      } finally {
        setCargandoLista(false);
      }
    };

    cargarEquipos();
  }, [estacionId, tipoEquipo]); // Se dispara cuando cualquiera de estos dos cambia

  const handleBuscar = () => {
    if (equipoId !== "") {
      setBusquedaActiva({ tipo: tipoEquipo, id: equipoId });
    }
  };

  const recargarTabla = () => {
    setBusquedaActiva({ ...busquedaActiva });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        Gestión de Mantenimiento
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: "#f9fafb" }}>
        <Typography variant="h6" gutterBottom>
          Filtro de Búsqueda por Estación
        </Typography>

        {/* 💡 CONTENEDOR PRINCIPAL FLEXBOX (Fuerza las filas) */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          {/* FILA 1: SELECTORES */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {/* SELECTOR 1: ESTACIÓN */}
            <TextField
              select
              label="Estación de Bombeo"
              value={estacionId}
              onChange={(e) => {
                setEstacionId(e.target.value);
                setTipoEquipo("");
              }}
              variant="outlined"
              disabled={cargandoEstaciones}
              sx={{ flex: "1 1 250px" }} // 💡 Mínimo 250px de ancho, el navegador NO puede aplastarlo
            >
              {listaEstaciones.map((est) => (
                <MenuItem key={est.id_est} value={est.id_est}>
                  {est.nombre_est}
                </MenuItem>
              ))}
            </TextField>

            {/* SELECTOR 2: TIPO */}
            <TextField
              select
              label="Tipo de Máquina"
              value={tipoEquipo}
              onChange={(e) => setTipoEquipo(e.target.value)}
              variant="outlined"
              disabled={!estacionId}
              sx={{ flex: "1 1 200px" }} // 💡 Mínimo 200px de ancho
            >
              <MenuItem value="MOTOR">Motor</MenuItem>
              <MenuItem value="BOMBA">Bomba</MenuItem>
              <MenuItem value="GENERADOR">Generador</MenuItem>
              <MenuItem value="VALVULA">Válvula</MenuItem>
              <MenuItem value="CCM">Tablero CCM</MenuItem>
            </TextField>

            {/* SELECTOR 3: EQUIPO (El más ancho) */}
            <TextField
              select
              label="Seleccione Equipo"
              value={equipoId}
              onChange={(e) => setEquipoId(e.target.value)}
              variant="outlined"
              disabled={
                !tipoEquipo || cargandoLista || listaEquipos.length === 0
              }
              sx={{ flex: "2 1 350px" }} // 💡 Mínimo 350px de ancho, crecerá más que los otros
              InputProps={{
                startAdornment: cargandoLista ? (
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                ) : null,
              }}
            >
              {listaEquipos.length === 0 && !cargandoLista ? (
                <MenuItem disabled value="">
                  No hay equipos
                </MenuItem>
              ) : (
                listaEquipos.map((equipo) => (
                  <MenuItem key={equipo.id} value={equipo.id}>
                    {equipo.label}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Box>

          {/* FILA 2: BOTONES ALINEADOS A LA DERECHA */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SearchIcon />}
              onClick={handleBuscar}
              disabled={equipoId === ""}
              sx={{ px: 4, height: "56px" }}
            >
              Cargar
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setModalOpen(true)}
              disabled={!busquedaActiva}
              sx={{ px: 4, height: "56px", borderWidth: 2 }}
            >
              Programar
            </Button>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      {/* RENDERIZADO CONDICIONAL CON PESTAÑAS */}
      {busquedaActiva ? (
        <Box sx={{ width: "100%" }}>
          {/* Navegación de pestañas */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab
                label="Órdenes de Trabajo"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              />
              <Tab
                label="Historial de Horómetro"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              />
            </Tabs>
          </Box>

          {/* Contenido de la Pestaña 0 (Mantenimiento) */}
          {tabValue === 0 && (
            <HistorialMantenimiento
              tipo_equipo={busquedaActiva.tipo}
              equipo_id={busquedaActiva.id}
            />
          )}

          {/* Contenido de la Pestaña 1 (Horómetro) */}
          {tabValue === 1 && (
            <HistorialHorometro
              tipo_equipo={busquedaActiva.tipo}
              equipo_id={busquedaActiva.id}
            />
          )}
        </Box>
      ) : (
        <Box textAlign="center" mt={5} color="text.secondary">
          <Typography variant="h6">
            Seleccione una estación y un equipo para visualizar su historial
            técnico.
          </Typography>
        </Box>
      )}

      {/* Tu modal de creación de ordenes (se queda igual) */}
      {busquedaActiva && (
        <ModalOrdenMantenimiento
          open={modalOpen}
          handleClose={() => setModalOpen(false)}
          tipo_equipo={busquedaActiva.tipo}
          equipo_id={busquedaActiva.id}
          onSuccess={recargarTabla}
        />
      )}

      {busquedaActiva && (
        <ModalOrdenMantenimiento
          open={modalOpen}
          handleClose={() => setModalOpen(false)}
          tipo_equipo={busquedaActiva.tipo}
          equipo_id={busquedaActiva.id}
          onSuccess={recargarTabla}
        />
      )}
    </Box>
  );
};

export default GestionMantenimiento;
