export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Helper Functions ---
async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }
  return data;
}

// --- Books API ---
export const booksApi = {
  getAll: async () => handleResponse(await fetch(`${API_URL}/books`)),
  create: async (data) => handleResponse(await fetch(`${API_URL}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })),
  update: async (id, data) => handleResponse(await fetch(`${API_URL}/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })),
  delete: async (id) => handleResponse(await fetch(`${API_URL}/books/${id}`, { method: 'DELETE' }))
};

// --- Clients API ---
export const clientsApi = {
  getAll: async () => handleResponse(await fetch(`${API_URL}/clients`)),
  create: async (data) => handleResponse(await fetch(`${API_URL}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })),
  update: async (id, data) => handleResponse(await fetch(`${API_URL}/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })),
  delete: async (id) => handleResponse(await fetch(`${API_URL}/clients/${id}`, { method: 'DELETE' }))
};

// --- Bills API ---
export const billsApi = {
  getAll: async () => handleResponse(await fetch(`${API_URL}/bills`)),
  getById: async (id) => handleResponse(await fetch(`${API_URL}/bills/${id}`)),
  create: async (data) => handleResponse(await fetch(`${API_URL}/bills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })),
  update: async (id, data) => handleResponse(await fetch(`${API_URL}/bills/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })),
  delete: async (id) => handleResponse(await fetch(`${API_URL}/bills/${id}`, { method: 'DELETE' }))
};

// --- Returns API ---
export const returnsApi = {
  getAll: async () => handleResponse(await fetch(`${API_URL}/returns`)),
  create: async (data) => handleResponse(await fetch(`${API_URL}/returns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }))
};

// --- Receipts API ---
export const receiptsApi = {
  getAll: async () => handleResponse(await fetch(`${API_URL}/receipts`)),
  create: async (data) => handleResponse(await fetch(`${API_URL}/receipts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }))
};

// --- Stocks API ---
export const stocksApi = {
  getAll: async () => handleResponse(await fetch(`${API_URL}/stock_entries`)),
  create: async (data) => handleResponse(await fetch(`${API_URL}/stock_entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }))
};

// --- Transports API ---
export const transportsApi = {
  getAll: async () => handleResponse(await fetch(`${API_URL}/transports`)),
  create: async (data) => handleResponse(await fetch(`${API_URL}/transports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })),
  delete: async (name) => handleResponse(await fetch(`${API_URL}/transports/${name}`, { method: 'DELETE' }))
};

// --- Banks API ---
export const banksApi = {
  getAll: async () => handleResponse(await fetch(`${API_URL}/banks`)),
  create: async (data) => handleResponse(await fetch(`${API_URL}/banks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })),
  delete: async (name) => handleResponse(await fetch(`${API_URL}/banks/${name}`, { method: 'DELETE' }))
};

// --- Settings API ---
export const settingsApi = {
  getAll: async () => handleResponse(await fetch(`${API_URL}/settings`)),
  save: async (key, value) => handleResponse(await fetch(`${API_URL}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value })
  })),
  delete: async (key) => handleResponse(await fetch(`${API_URL}/settings/${key}`, { method: 'DELETE' }))
};

// --- Recycle Bin API ---
export const recycleBinApi = {
  getAll: async () => handleResponse(await fetch(`${API_URL}/recycle_bin`)),
  create: async (type, item_data) => handleResponse(await fetch(`${API_URL}/recycle_bin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, item_data })
  })),
  delete: async (id) => handleResponse(await fetch(`${API_URL}/recycle_bin/${id}`, { method: 'DELETE' })),
  clearAll: async () => handleResponse(await fetch(`${API_URL}/recycle_bin`, { method: 'DELETE' }))
};
