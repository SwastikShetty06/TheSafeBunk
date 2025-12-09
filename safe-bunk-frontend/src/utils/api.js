import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD
        ? 'https://the-safe-bunk-git-main-swastikshetty06s-projects.vercel.app/api'
        : 'http://localhost:5001/api',
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
