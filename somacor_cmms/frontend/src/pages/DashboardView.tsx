import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDashboard, useEquiposCriticos } from '../hooks';

const DashboardView: React.FC = () => {
  const { stats, loading: statsLoading, error: statsError } = useDashboard();
  const { equipos: equiposCriticos, loading: equiposLoading } = useEquiposCriticos();

  // Colores para los gráficos
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  // Datos para el gráfico de barras de OTs por tipo
  const otsPorTipoData = stats?.ots_por_tipo?.map(item => ({
    tipo: item.nombretipomantenimientoot,
    cantidad: item.cantidad
  })) || [];

  // Datos para el gráfico de pie de equipos por estado
  const equiposPorEstadoData = stats?.equipos_por_estado?.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  })) || [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando dashboard...</div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{statsError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Resumen general del estado de mantenimiento de la flota
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Equipos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.estadisticas_generales?.total_equipos || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Equipos Operativos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.estadisticas_generales?.equipos_operativos || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">OTs Abiertas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.estadisticas_generales?.ots_abiertas || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">OTs Vencidas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.estadisticas_generales?.ots_vencidas || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de OTs por tipo */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            Órdenes de Trabajo por Tipo
          </h3>
          {otsPorTipoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={otsPorTipoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="tipo" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No hay datos disponibles
            </div>
          )}
        </div>

        {/* Gráfico de equipos por estado */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Equipos por Estado
          </h3>
          {equiposPorEstadoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={equiposPorEstadoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nombreestado, cantidad }) => `${nombreestado}: ${cantidad}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {equiposPorEstadoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No hay datos disponibles
            </div>
          )}
        </div>
      </div>

      {/* Secciones adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipos críticos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Equipos que Requieren Atención
          </h3>
          {equiposLoading ? (
            <div className="text-gray-500">Cargando equipos críticos...</div>
          ) : equiposCriticos.length > 0 ? (
            <div className="space-y-3">
              {equiposCriticos.slice(0, 5).map(equipo => (
                <div key={equipo.idequipo} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{equipo.codigointerno}</div>
                    <div className="text-sm text-gray-600">{equipo.nombreequipo}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">
                      {equipo.horometroactual} hrs
                    </div>
                    <div className="text-xs text-gray-500">
                      {equipo.estado_actual?.nombreestado}
                    </div>
                  </div>
                </div>
              ))}
              {equiposCriticos.length > 5 && (
                <div className="text-center text-sm text-gray-500">
                  Y {equiposCriticos.length - 5} equipos más...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={48} className="mx-auto mb-2 text-green-400" />
              <p>Todos los equipos están en buen estado</p>
            </div>
          )}
        </div>

        {/* Próximos mantenimientos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Próximos Mantenimientos
          </h3>
          {stats?.mantenimientos_proximos && stats.mantenimientos_proximos.length > 0 ? (
            <div className="space-y-3">
              {stats.mantenimientos_proximos.slice(0, 5).map((mantenimiento, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{mantenimiento.equipo}</div>
                    <div className="text-sm text-gray-600">{mantenimiento.tipo_mantenimiento}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">
                      {new Date(mantenimiento.fecha_programada).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock size={48} className="mx-auto mb-2 text-gray-400" />
              <p>No hay mantenimientos próximos programados</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumen de actividad reciente */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Resumen de Actividad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.estadisticas_generales?.mantenimientos_proximos || 0}
            </div>
            <div className="text-sm text-gray-600">Mantenimientos Próximos</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {((stats?.estadisticas_generales?.equipos_operativos || 0) / 
                (stats?.estadisticas_generales?.total_equipos || 1) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Disponibilidad de Flota</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {stats?.estadisticas_generales?.ots_abiertas || 0}
            </div>
            <div className="text-sm text-gray-600">Trabajos Pendientes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;

