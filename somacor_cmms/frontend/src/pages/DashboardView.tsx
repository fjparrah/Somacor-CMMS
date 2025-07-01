import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { Truck, Wrench, AlertTriangle, CalendarCheck, BarChart2 } from 'lucide-react';

// =================================================================================
// INICIO DE DEPENDENCIAS LOCALES
// Para asegurar que el componente sea autocontenido y funcione en el entorno de
// previsualización, se definen aquí las dependencias.
// =================================================================================

// --- Dependencia: apiClient ---
const API_URL = 'https://8000-iy1ndwd6rwjciifvad9i7-14fa1d09.manusvm.computer/api';
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// En una aplicación real, se agregaría aquí el manejo de tokens de autenticación.
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

// --- Dependencia: LoadingSpinner ---
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// --- Dependencias: Componentes de UI ---
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`rounded-xl border bg-white text-gray-900 shadow-lg transition-all hover:shadow-2xl ${className}`} {...props} />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={`text-lg font-semibold leading-none tracking-tight text-gray-700 ${className}`} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';


// =================================================================================
// FIN DE DEPENDENCIAS LOCALES
// =================================================================================

// Tipos de datos para el dashboard
interface DashboardStats {
  total_equipos: number;
  equipos_operativos: number;
  ots_abiertas: number;
  ots_vencidas: number;
  mantenimientos_proximos: number;
}

interface EstadoEquipoData {
  nombreestado: string;
  cantidad: number;
}

interface TipoOtData {
    nombretipomantenimientoot: string;
    cantidad: number;
}

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [equiposPorEstado, setEquiposPorEstado] = useState<EstadoEquipoData[]>([]);
  const [otsPorTipo, setOtsPorTipo] = useState<TipoOtData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/mantenimiento-workflow/dashboard/');
        const data = response.data;
        setStats(data.estadisticas_generales);
        setEquiposPorEstado(data.equipos_por_estado);
        setOtsPorTipo(data.ots_por_tipo);
        setError(null);
      } catch (err) {
        setError("No se pudo cargar la información del dashboard. Verifique la conexión con el servidor.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Colores para el gráfico de torta
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard General</h1>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard icon={<Truck className="h-8 w-8 text-blue-500" />} title="Equipos Totales" value={stats?.total_equipos} />
        <StatCard icon={<Wrench className="h-8 w-8 text-green-500" />} title="Equipos Operativos" value={stats?.equipos_operativos} />
        <StatCard icon={<AlertTriangle className="h-8 w-8 text-yellow-500" />} title="OTs Abiertas" value={stats?.ots_abiertas} />
        <StatCard icon={<AlertTriangle className="h-8 w-8 text-red-500" />} title="OTs Vencidas" value={stats?.ots_vencidas} />
        <StatCard icon={<CalendarCheck className="h-8 w-8 text-purple-500" />} title="Mant. Próximos (7d)" value={stats?.mantenimientos_proximos} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-gray-600" />
              Órdenes de Trabajo por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={otsPorTipo} dataKey="cantidad" nameKey="nombretipomantenimientoot" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                         {otsPorTipo.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} OTs`} />
                    <Legend />
                </PieChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5 text-gray-600" />
              Equipos por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie 
                        data={equiposPorEstado} 
                        dataKey="cantidad" 
                        nameKey="nombreestado" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={70} 
                        fill="#82ca9d" 
                        labelLine={true}
                        label={({ percent, nombreestado }) => {
                            // Solo mostrar etiqueta si el porcentaje es mayor al 5%
                            if (percent > 0.05) {
                                return `${(percent * 100).toFixed(0)}%`;
                            }
                            return '';
                        }}
                    >
                        {equiposPorEstado.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} equipos`, name]} />
                    <Legend 
                        wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                    />
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Componente auxiliar para las tarjetas de estadísticas
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value?: number }> = ({ icon, title, value }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold text-gray-900">{value ?? '...'}</div>
    </CardContent>
  </Card>
);

export default DashboardView;
