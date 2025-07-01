import axios from 'axios';

// Se crea una instancia de Axios para centralizar la configuración de la API.
const apiClient = axios.create({
    baseURL: 'https://8000-iy1ndwd6rwjciifvad9i7-14fa1d09.manusvm.computer/api', // La URL base de tu backend de Django.
});

// Se usa un interceptor para añadir el token de autenticación a cada petición.
// Esta es la forma correcta de asegurar las llamadas a la API.
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
}, error => Promise.reject(error));

export default apiClient;