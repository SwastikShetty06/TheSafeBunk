import axios from 'axios';

const api = axios.create({
    baseURL: 'https://the-safe-bunk.vercel.app/api',
});

// Add a request interceptor to add the token
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
