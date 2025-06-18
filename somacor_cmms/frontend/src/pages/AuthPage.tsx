import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
// Se importa el hook para la navegación
import { useNavigate } from 'react-router-dom';

interface Rol {
    idrol: number;
    nombrerol: string;
}

const AuthPage: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [selectedRol, setSelectedRol] = useState<string>('');
    const [roles, setRoles] = useState<Rol[]>([]);
    const [error, setError] = useState('');

    const auth = useContext(AuthContext);
    // Se inicializa el hook de navegación
    const navigate = useNavigate();

    // Redirige si el usuario ya está logueado
    useEffect(() => {
        if (auth?.token) {
            navigate('/dashboard');
        }
    }, [auth, navigate]);


    useEffect(() => {
        if (!isLoginView) {
            const fetchRoles = async () => {
                try {
                    const response = await apiClient.get<Rol[]>('/roles/');
                    setRoles(response.data);
                    if (response.data.length > 0) {
                        setSelectedRol(String(response.data[0].idrol));
                    }
                } catch (err) {
                    setError('No se pudieron cargar los roles. Verifique la conexión.');
                    console.error("Error fetching roles:", err);
                }
            };
            fetchRoles();
        }
    }, [isLoginView]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await auth!.login(username, password);
            // Se reactiva la redirección al dashboard después del login
            navigate('/dashboard'); 
        } catch (err: any) {
            setError('Error al iniciar sesión. Verifique sus credenciales.');
            console.error("Login error:", err);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (password !== confirmPassword) {
                setError('Las contraseñas no coinciden');
                return;
            }
            if (!selectedRol) {
                setError('Debe seleccionar un rol');
                return;
            }

            const payload = {
                username,
                password,
                email,
                nombreCompleto,
                idrol: parseInt(selectedRol, 10),
            };

            await apiClient.post('/register/', payload);
            alert('¡Usuario registrado con éxito! Ahora puede iniciar sesión.');
            setIsLoginView(true);
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            setEmail('');
            setNombreCompleto('');
        } catch (err: any) {
            console.error("Registration error object:", err.response);
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                const errorMessages = Object.entries(errorData).map(([field, messages]) => {
                    const messageText = Array.isArray(messages) ? messages.join(', ') : String(messages);
                    return `${field}: ${messageText}`;
                }).join('; ');
                setError(`Error: ${errorMessages}`);
            } else {
                setError('Error al crear el usuario. Verifique su conexión y los datos ingresados.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                    {isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta - Somacor CMMS'}
                </h2>
                <form onSubmit={isLoginView ? handleLogin : handleRegister}>
                    {error && <p className="text-sm text-center text-red-500 bg-red-100 p-2 rounded">{error}</p>}
                    
                    <div className="space-y-4">
                        <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        
                        {!isLoginView && (
                            <>
                                <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Confirmar Contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" placeholder="Nombre Completo" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
                                <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                <select className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedRol} onChange={(e) => setSelectedRol(e.target.value)} required>
                                    <option value="" disabled>-- Seleccione un Rol --</option>
                                    {roles.map(rol => (
                                        <option key={rol.idrol} value={rol.idrol}>{rol.nombrerol}</option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>
                    
                    <button type="submit" className="w-full px-4 py-2 mt-6 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300">
                        {isLoginView ? 'Entrar' : 'Crear Cuenta'}
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    {isLoginView ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="ml-1 font-semibold text-blue-600 hover:underline">
                        {isLoginView ? 'Regístrate' : 'Inicia Sesión'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
