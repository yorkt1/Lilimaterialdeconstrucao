const BASE_URL = import.meta.env.VITE_EVOLUTION_API_URL;
const API_KEY  = import.meta.env.VITE_EVOLUTION_API_KEY;

const headers = {
  'apikey': API_KEY,
  'Content-Type': 'application/json',
};

const request = async (method, path, body) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Erro ${res.status}`);
  }
  return res.json();
};

export const evolutionApi = {
  createInstance: (instanceName) =>
    request('POST', '/instance/create', {
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    }),

  getQRCode: (instanceName) =>
    request('GET', `/instance/connect/${instanceName}`),

  getStatus: (instanceName) =>
    request('GET', `/instance/connectionState/${instanceName}`),

  logoutInstance: (instanceName) =>
    request('DELETE', `/instance/logout/${instanceName}`),

  deleteInstance: (instanceName) =>
    request('DELETE', `/instance/delete/${instanceName}`),

  fetchInstances: () =>
    request('GET', '/instance/fetchInstances'),
};
