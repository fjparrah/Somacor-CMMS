import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Server, Zap, ZapOff, Search, ChevronDown, ChevronUp } from 'lucide-react';

// =================================================================================
// INICIO DE DEPENDENCIAS LOCALES
// Para asegurar que el componente sea autocontenido y funcione en el entorno de
// previsualización, se definen aquí las dependencias.
// =================================================================================

// --- Dependencia: apiClient ---
const API_URL = 'http://localhost:8000/api'; // URL del backend de Django
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
  <div ref={ref} className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`} {...props} />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={`text-xl font-semibold leading-none tracking-tight ${className}`} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';

const Switch = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { checked: boolean }>(({ className, checked, ...props }, ref) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200'} ${className}`}
        {...props}
    >
        <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
    </button>
));
Switch.displayName = 'Switch';

// =================================================================================
// FIN DE DEPENDENCIAS LOCALES
// =================================================================================

// Tipos de datos
interface Equipo {
  idequipo: number;
  nombreequipo: string;
  codigointerno: string;
  marca: string;
  modelo: string;
  activo: boolean;
  tipo_equipo_nombre: string;
  faena_nombre: string;
  estado_nombre: string;
}

type SortKey = keyof Equipo;

const EstadoMaquinaView: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        setLoading(true);
        // La API en /api/equipos/ ya devuelve todos los equipos, activos e inactivos.
        const response = await apiClient.get('/equipos/');
        setEquipos(response.data.results || response.data);
        setError(null);
      } catch (err) {
        setError("No se pudo cargar la información de los equipos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipos();
  }, []);

  const sortedAndFilteredEquipos = useMemo(() => {
    let filteredEquipos = equipos;

    // Filtrar por estado activo/inactivo
    if (showOnlyActive) {
      filteredEquipos = filteredEquipos.filter(equipo => equipo.activo);
    }
    // Si showOnlyActive es false, mostramos todos los equipos (activos e inactivos)

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filteredEquipos = filteredEquipos.filter(equipo =>
        Object.values(equipo).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Ordenar tabla
    if (sortConfig !== null) {
      filteredEquipos.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredEquipos;
  }, [equipos, searchTerm, showOnlyActive, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronDown className="h-4 w-4 inline-block text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 inline-block" /> : <ChevronDown className="h-4 w-4 inline-block" />;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Estado de la Maquinaria</h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar equipo..."
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={showOnlyActive}
                onChange={() => setShowOnlyActive(!showOnlyActive)}
                id="active-toggle"
              />
              <label htmlFor="active-toggle" className="text-sm font-medium text-gray-700">
                Solo equipos activos
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('codigointerno')}>Código {getSortIcon('codigointerno')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('nombreequipo')}>Nombre {getSortIcon('nombreequipo')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('tipo_equipo_nombre')}>Tipo {getSortIcon('tipo_equipo_nombre')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('estado_nombre')}>Condición {getSortIcon('estado_nombre')}</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('activo')}>Estado {getSortIcon('activo')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredEquipos.map((equipo) => (
                  <tr key={equipo.idequipo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{equipo.codigointerno}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{equipo.nombreequipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{equipo.tipo_equipo_nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{equipo.estado_nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {equipo.activo ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Zap className="h-4 w-4 mr-1"/> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                          <ZapOff className="h-4 w-4 mr-1"/> Inactivo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             {sortedAndFilteredEquipos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <Server className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium">No se encontraron equipos</h3>
                    <p className="mt-1 text-sm">Pruebe a cambiar los filtros o el término de búsqueda.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstadoMaquinaView;
