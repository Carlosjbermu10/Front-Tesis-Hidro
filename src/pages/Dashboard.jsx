import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  WaterDrop,
  LocalGasStation,
  Bolt,
  AssignmentTurnedIn,
  WarningAmber,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import dashboardService from "../services/dashboardService";

const COLORES_PIE = ["#0284c7", "#059669", "#d97706", "#7c3aed", "#e11d48"];

// 🌟 TARJETA REUTILIZABLE AISLADA (Para evitar el error de render)
const KpiCard = ({ titulo, valor, subtitulo, icon, color, alerta }) => (
  <Card
    sx={{
      borderBottom: `4px solid ${alerta ? "#e11d48" : color}`,
      boxShadow: 2,
      height: "100%",
      position: "relative",
    }}
  >
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          bgcolor: alerta ? "#ffe4e6" : `${color}1A`,
          p: 1.5,
          borderRadius: 2,
          display: "flex",
        }}
      >
        {React.cloneElement(icon, {
          sx: { color: alerta ? "#e11d48" : color, fontSize: 36 },
        })}
      </Box>
      <Box>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight="bold"
          sx={{ textTransform: "uppercase" }}
        >
          {titulo}
        </Typography>
        <Typography
          variant="h4"
          fontWeight="900"
          color={alerta ? "error.main" : "text.primary"}
        >
          {valor}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitulo}
        </Typography>
      </Box>
      {alerta && (
        <Chip
          label="ALERTA"
          color="error"
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            fontWeight: "bold",
            fontSize: "0.65rem",
          }}
        />
      )}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState({
    estaciones: [],
    tanques: [],
    generadores: [],
  });
  const [filtroSistema, setFiltroSistema] = useState("Todos");

  // 1. CARGA INICIAL (Solo va al backend 1 vez)
  useEffect(() => {
    const cargarTablero = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getResumenOperativo();
        setRawData(data);
      } catch (error) {
        console.error("Error al cargar la inteligencia de datos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarTablero();
  }, []);

  // 2. MOTOR REACTIVO (Recalcula todo en milisegundos cuando cambias el filtro)
  const {
    metricas,
    sistemasDisponibles,
    estacionesFiltradas,
    tanquesCriticos,
  } = useMemo(() => {
    if (!rawData.estaciones.length) {
      return {
        metricas: null,
        sistemasDisponibles: [],
        estacionesFiltradas: [],
        tanquesCriticos: false,
      };
    }

    // Extraer sistemas únicos para el selector
    const sistemas = [
      "Todos",
      ...new Set(
        rawData.estaciones.map((e) => e.nombre_sistema).filter(Boolean),
      ),
    ];

    // Filtrar estaciones según selección
    const estFiltradas =
      filtroSistema === "Todos"
        ? rawData.estaciones
        : rawData.estaciones.filter((e) => e.nombre_sistema === filtroSistema);

    const idsFiltrados = estFiltradas.map((e) => e.id_est);

    // Filtrar equipos correspondientes a las estaciones visibles
    const tanquesFiltrados = rawData.tanques.filter((t) =>
      idsFiltrados.includes(t.est_bombeo_id_est),
    );
    const genFiltrados = rawData.generadores.filter((g) =>
      idsFiltrados.includes(g.est_bombeo_id_est),
    );

    // 🧮 A. INDICADORES GLOBALES
    const litros = tanquesFiltrados.reduce(
      (sum, t) => sum + (Number(t.total_litros) || 0),
      0,
    );
    const potencia = genFiltrados.reduce(
      (sum, g) => sum + (Number(g.potencia_principal) || 0),
      0,
    );

    // 🚨 B. DETECCIÓN DE ALERTAS (Tanques con menos del 20% de capacidad)
    let hayCriticos = false;
    tanquesFiltrados.forEach((t) => {
      if (t.cap_max_tanque && t.total_litros) {
        const porcentaje =
          (Number(t.total_litros) / Number(t.cap_max_tanque)) * 100;
        if (porcentaje <= 20) hayCriticos = true;
      }
    });

    // 🧮 C. DATOS DONA
    const conteoTipos = {};
    estFiltradas.forEach((est) => {
      const tipo = est.tipo_est || "Sin Clasificar";
      conteoTipos[tipo] = (conteoTipos[tipo] || 0) + 1;
    });
    const distribucionTipos = Object.keys(conteoTipos).map((key) => ({
      name: key,
      value: conteoTipos[key],
    }));

    // 🧮 D. DATOS BARRAS
    const capacidadPorEstacion = {};
    tanquesFiltrados.forEach((t) => {
      capacidadPorEstacion[t.est_bombeo_id_est] =
        (capacidadPorEstacion[t.est_bombeo_id_est] || 0) +
        (Number(t.total_litros) || 0);
    });

    const rankingLitros = Object.keys(capacidadPorEstacion)
      .map((idEst) => {
        const estacion = estFiltradas.find((e) => e.id_est === Number(idEst));
        return {
          nombre: estacion ? estacion.nombre_est : `ID ${idEst}`,
          litros: capacidadPorEstacion[idEst],
        };
      })
      .sort((a, b) => b.litros - a.litros)
      .slice(0, 5);

    return {
      metricas: {
        totalEstaciones: estFiltradas.length,
        litrosTotales: litros,
        potenciaTotal: potencia,
        distribucionTipos,
        topEstacionesLitros: rankingLitros,
      },
      sistemasDisponibles: sistemas,
      estacionesFiltradas: estFiltradas,
      tanquesCriticos: hayCriticos,
    };
  }, [rawData, filtroSistema]);

  // Utilidad para evaluar el estatus de una estación individual en la tabla
  const evaluarEstatusEstacion = (idEst) => {
    const tanquesDeEstacion = rawData.tanques.filter(
      (t) => t.est_bombeo_id_est === idEst,
    );
    const critico = tanquesDeEstacion.some(
      (t) =>
        t.cap_max_tanque &&
        Number(t.total_litros) / Number(t.cap_max_tanque) <= 0.2,
    );

    if (critico)
      return (
        <span style={{ color: "#e11d48", fontWeight: "bold" }}>
          🔴 Combustible Bajo
        </span>
      );
    return (
      <span style={{ color: "#22c55e", fontWeight: "bold" }}>🟢 En Línea</span>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 100px)",
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (!metricas) return null;

  return (
    <Box sx={{ p: 1, pb: 4 }}>
      {/* 🌟 ENCABEZADO CON FILTRO INTERACTIVO */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Vista General Operativa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Indicadores en tiempo real de la infraestructura hidráulica y
            energética.
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 250, bgcolor: "white" }} size="small">
          <InputLabel>Filtrar por Sistema</InputLabel>
          <Select
            value={filtroSistema}
            label="Filtrar por Sistema"
            onChange={(e) => setFiltroSistema(e.target.value)}
          >
            {sistemasDisponibles.map((sis) => (
              <MenuItem key={sis} value={sis}>
                {sis === "Todos" ? "🌍 Ver Todos los Sistemas" : sis}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 🥇 BLOQUE 1: INDICADORES RÁPIDOS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            titulo="Red Filtrada"
            valor={metricas.totalEstaciones}
            subtitulo="Plantas en este sistema"
            icon={<WaterDrop />}
            color="#0284c7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            titulo="Reserva Combustible"
            valor={`${metricas.litrosTotales.toLocaleString()} L`}
            subtitulo="Suma total en tanques"
            icon={<LocalGasStation />}
            color="#d97706"
            alerta={tanquesCriticos} // 🚨 Se activa si algún tanque está menor al 20%
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            titulo="Potencia Instalada"
            valor={`${metricas.potenciaTotal.toLocaleString()} KVA`}
            subtitulo="Respaldo en generadores"
            icon={<Bolt />}
            color="#059669"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            titulo="Sistemas Activos"
            valor={tanquesCriticos ? "Revisión" : "100%"}
            subtitulo="Estatus de transmisión"
            icon={tanquesCriticos ? <WarningAmber /> : <AssignmentTurnedIn />}
            color={tanquesCriticos ? "#e11d48" : "#7c3aed"}
          />
        </Grid>
      </Grid>

      {/* 🥈 BLOQUE 2: GRÁFICOS VISUALES */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5}>
          <Card sx={{ boxShadow: 2, height: 400 }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Clasificación de Estaciones
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                  <Pie
                    data={metricas.distribucionTipos}
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {metricas.distribucionTipos.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORES_PIE[index % COLORES_PIE.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ boxShadow: 2, height: 400 }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Top 5: Capacidad de Combustible por Planta
              </Typography>
              {metricas.topEstacionesLitros.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={metricas.topEstacionesLitros}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="nombre"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <RechartsTooltip cursor={{ fill: "#f1f5f9" }} />
                    <Bar
                      dataKey="litros"
                      fill="#0284c7"
                      radius={[4, 4, 0, 0]}
                      name="Litros"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 250,
                  }}
                >
                  <Typography color="text.secondary">
                    No hay datos de tanques suficientes.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🥉 BLOQUE 3: TABLA REACTIVA */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Monitoreo Detallado del Sistema
                </Typography>
                <Chip
                  label={tanquesCriticos ? "Requiere Atención" : "Estable"}
                  color={tanquesCriticos ? "error" : "success"}
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
              </Box>

              <Box sx={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    fontFamily: "sans-serif",
                    fontSize: "0.9rem",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8fafc",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#64748b",
                        }}
                      >
                        Código
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#64748b",
                        }}
                      >
                        Estación
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#64748b",
                        }}
                      >
                        Sistema
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#64748b",
                        }}
                      >
                        Tipo
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#64748b",
                        }}
                      >
                        Telemetría Operativa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {estacionesFiltradas.slice(0, 10).map((est) => (
                      <tr
                        key={est.id_est}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          height: "50px",
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 16px",
                            fontWeight: "bold",
                            color: "#0284c7",
                          }}
                        >
                          {est.codigo}
                        </td>
                        <td
                          style={{ padding: "12px 16px", fontWeight: "medium" }}
                        >
                          {est.nombre_est}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#475569" }}>
                          {est.nombre_sistema}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Chip
                            label={est.tipo_est || "N/A"}
                            size="small"
                            color={
                              est.tipo_est === "Principal"
                                ? "primary"
                                : "default"
                            }
                            sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                          />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {/* 🌟 LA MAGIA DE LA ALERTA AQUÍ */}
                          {evaluarEstatusEstacion(est.id_est)}
                        </td>
                      </tr>
                    ))}
                    {estacionesFiltradas.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "#64748b",
                          }}
                        >
                          No hay estaciones en este sistema.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
