import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const handleLogin = async (e) => { e.preventDefault(); setError(''); try { await login(username, password); } catch (err) { setError('Usuario o contraseña incorrectos.'); } };
    return (<form className="space-y-6" onSubmit={handleLogin}><input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuario" className="w-full px-4 py-2 border rounded-md" required /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" className="w-full px-4 py-2 border rounded-md" required />{error && <p className="text-red-500 text-sm text-center">{error}</p>}<button type="submit" className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Ingresar</button></form>);
};

const RegisterForm = () => {
    const [formData, setFormData] = useState({ username: '', password: '', nombre_completo: '', email: '', rol_id: '' });
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState('');
    useEffect(() => { apiClient.get('/roles/').then(res => setRoles(res.data)).catch(err => console.error(err)); }, []);
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleRegister = async (e) => { e.preventDefault(); setError(''); try { await apiClient.post('/register/', formData); alert('¡Usuario creado con éxito! Por favor, inicia sesión.'); } catch (err) { setError('Error al crear el usuario.'); } };
    return (<form className="space-y-4" onSubmit={handleRegister}><input name="username" onChange={handleChange} placeholder="Nombre de Usuario" className="w-full px-4 py-2 border rounded-md" required /><input type="password" name="password" onChange={handleChange} placeholder="Contraseña" className="w-full px-4 py-2 border rounded-md" required /><input name="nombre_completo" onChange={handleChange} placeholder="Nombre Completo" className="w-full px-4 py-2 border rounded-md" required /><input type="email" name="email" onChange={handleChange} placeholder="Email" className="w-full px-4 py-2 border rounded-md" required/><select name="rol_id" onChange={handleChange} className="w-full px-4 py-2 border rounded-md" required><option value="">-- Seleccione un Rol --</option>{roles.map(r => <option key={r.idrol} value={r.idrol}>{r.nombrerol}</option>)}</select>{error && <p className="text-red-500 text-sm text-center">{error}</p>}<button type="submit" className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">Crear Cuenta</button></form>);
};

const AuthPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="text-center"><h2 className="text-2xl font-bold text-gray-800">{isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'} - Somacor CMMS</h2></div>
                {isLoginView ? <LoginForm /> : <RegisterForm />}
                <div className="text-center"><button onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-blue-600 hover:underline">{isLoginView ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia Sesión'}</button></div>
            </div>
        </div>
    );
};

export default AuthPage;