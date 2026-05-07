import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import type {
  UltraConnectionParams,
  UltraAuthorizationResponse
} from '@/types/channels/inbox';

// Ultra API service aligned with Ultra integration
// Follows the same pattern as the original UltraClient.js
const ultraService = {
  /**
   * Health check simples para Ultra API
   * Verifica se a URL da API está respondendo corretamente
   * Espera: {"status":200,"message":"Welcome to the Ultra API, it is working!",...}
   */
  async healthCheck(apiUrl: string): Promise<boolean> {
    try {
      // Remove trailing slash e adiciona apenas se necessário
      const baseUrl = apiUrl.replace(/\/$/, '');
      const healthUrl = `${baseUrl}/`;

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      // Ultra API retorna {"status":200,...}
      return data.status === 200;
    } catch (error) {
      console.error('Ultra API health check failed:', error);
      return false;
    }
  },

  async verifyConnection(
    params: UltraConnectionParams,
  ): Promise<UltraAuthorizationResponse> {
    const requestData = {
      authorization: {
        api_url: params.apiUrl,
        admin_token: params.adminToken,
        instance_name: params.instanceName,
        phone_number: params.phoneNumber,
        proxy_settings: params.proxySettings,
        instance_settings: params.instanceSettings,
      },
    };

    const response = await api.post('/ultra/authorization', requestData);
    return extractData<UltraAuthorizationResponse>(response);
  },

  async refreshQrCode(
    params: { apiUrl: string; apiHash: string; instanceName: string },
  ) {
    const requestData = {
      api_url: params.apiUrl,
      api_hash: params.apiHash,
      instance_name: params.instanceName,
    };

    const response = await api.post('/ultra/qrcodes', requestData);
    return extractData<any>(response);
  },

  async setProxy(
    params: { apiUrl: string; apiHash: string; instanceName: string; proxySettings: object },
  ) {
    const requestData = {
      api_url: params.apiUrl,
      api_hash: params.apiHash,
      instance_name: params.instanceName,
      proxy_settings: params.proxySettings,
    };

    const response = await api.post('/ultra/proxies', requestData);
    return extractData<any>(response);
  },

  async setSettings(
    params: { apiUrl: string; apiHash: string; instanceName: string; instanceSettings: object },
  ) {
    const requestData = {
      api_url: params.apiUrl,
      api_hash: params.apiHash,
      instance_name: params.instanceName,
      instance_settings: params.instanceSettings,
    };

    const response = await api.post('/ultra/settings', requestData);
    return extractData<any>(response);
  },

  // Settings management methods (via backend)
  async getSettings(instanceName: string) {
    const response = await api.get(`/ultra/settings/${instanceName}`);
    return extractData<any>(response);
  },

  async updateSettings(instanceName: string, settings: object) {
    const response = await api.put(`/ultra/settings/${instanceName}`, {
      settings,
    });
    return extractData<any>(response);
  },

  // QR Code management (via backend)
  async getQRCode(instanceName: string) {
    const response = await api.get(`/ultra/qrcodes/${instanceName}`);
    return extractData<any>(response);
  },

  // Instance management (via backend)
  async fetchInstances(instanceName?: string) {
    const params = instanceName ? { instanceName } : {};
    const response = await api.get('/ultra/instances', { params });
    return extractData<any>(response);
  },

  async logout(instanceName: string) {
    const response = await api.delete(`/ultra/instances/${instanceName}/logout`);
    return extractData<any>(response);
  },

  // Proxy management (via backend)
  async getProxy(instanceName: string) {
    const response = await api.get(`/ultra/proxies/${instanceName}`);
    return extractData<any>(response);
  },

  async updateProxy(instanceName: string, proxySettings: object) {
    const response = await api.put(`/ultra/proxies/${instanceName}`, {
      proxy_settings: proxySettings,
    });
    return extractData<any>(response);
  },
};

export default ultraService;
