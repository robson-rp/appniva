const API_BASE_URL = 'http://localhost:8000/api/v1';

async function request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');

    const headers = new Headers(options.headers);

    if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
    }

    // Only set Content-Type to JSON if it's not already set and body is not FormData
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        // We could trigger a redirect here, but better handled by AuthContext
    }

    if (response.status === 204) {
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'Erro na requisição');
        (error as any).status = response.status;
        (error as any).errors = data.errors;
        throw error;
    }

    return data;
}

export const api = {
    get: (endpoint: string, options: RequestInit = {}) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint: string, data: any, options: RequestInit = {}) => {
        const isFormData = data instanceof FormData;
        return request(endpoint, {
            ...options,
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data)
        });
    },
    put: (endpoint: string, data: any, options: RequestInit = {}) => {
        const isFormData = data instanceof FormData;
        return request(endpoint, {
            ...options,
            method: 'PUT',
            body: isFormData ? data : JSON.stringify(data)
        });
    },
    delete: (endpoint: string, options: RequestInit = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};
