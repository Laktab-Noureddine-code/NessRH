import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8000",
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        "Accept": "application/json",
    },
});

export const getCsrfCookie = () => api.get("/sanctum/csrf-cookie");

export default api;