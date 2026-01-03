const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

const setToken = (token: string): void => {
  localStorage.setItem('admin_token', token);
};

const removeToken = (): void => {
  localStorage.removeItem('admin_token');
};

const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

const handleResponse = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      removeToken();
      window.location.href = '/admin/login';
    }
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response);

    if (data.success && data.data.token) {
      setToken(data.data.token);
    }

    return data;
  },

  logout: () => {
    removeToken();
  },

  isAuthenticated: (): boolean => {
    return !!getToken();
  },
};

export const propertiesAPI = {
  list: async () => {
    const response = await fetch(`${API_URL}/properties/list`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_URL}/properties/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  create: async (propertyData: any) => {
    const response = await fetch(`${API_URL}/properties/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(propertyData),
    });
    return handleResponse(response);
  },

  update: async (id: number, propertyData: any) => {
    const response = await fetch(`${API_URL}/properties/update/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(propertyData),
    });
    return handleResponse(response);
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/properties/delete/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  toggleStatus: async (id: number, field: 'is_active' | 'is_top_selling', value: boolean) => {
    const response = await fetch(`${API_URL}/properties/toggle-status/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ field, value }),
    });
    return handleResponse(response);
  },

  publicList: async () => {
    const response = await fetch(`${API_URL}/properties/public-list`, {
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },
};

export { getToken, setToken, removeToken };
