import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import type {
  UltraGoConnectionParams,
  UltraGoAuthorizationResponse
} from '@/types/channels/inbox';

// Ultra Go API service aligned with Ultra Go integration
// Follows the same pattern as the original UltraGoClient.js
const ultraGoService = {
  /**
   * Health check simples para Ultra Go
   * Verifica se a URL da API está respondendo corretamente
   * Espera: {"status":"ok"}
   */
  async healthCheck(apiUrl: string): Promise<boolean> {
    try {
      // Remove trailing slash e adiciona /server/ok
      const baseUrl = apiUrl.replace(/\/$/, '');
      const healthUrl = `${baseUrl}/server/ok`;

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
      // Ultra Go retorna {"status":"ok"}
      return data.status === 'ok';
    } catch (error) {
      console.error('Ultra Go health check failed:', error);
      return false;
    }
  },

  async verifyConnection(
    params: UltraGoConnectionParams,
  ): Promise<UltraGoAuthorizationResponse> {
    const requestData = {
      authorization: {
        api_url: params.apiUrl,
        admin_token: params.adminToken,
        instance_name: params.instanceName,
        phone_number: params.phoneNumber,
        mode: params.mode,
        instance_settings: params.instanceSettings,
      },
    };

    const response = await api.post('/ultra_go/authorization', requestData);
    return response.data as UltraGoAuthorizationResponse;
  },

  async refreshQrCode(
    params: { apiUrl: string; apiHash: string; instanceName: string },
  ) {
    const requestData = {
      api_url: params.apiUrl,
      api_hash: params.apiHash,
      instance_name: params.instanceName,
    };

    const response = await api.post('/ultra_go/qrcode', requestData);
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

    const response = await api.post('/ultra_go/proxy', requestData);
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

    const response = await api.post('/ultra_go/settings', requestData);
    return extractData<any>(response);
  },

  // Settings management methods (via backend)
  async getSettings(instanceUuid: string) {
    const response = await api.get(`/ultra_go/settings/${instanceUuid}`);
    return extractData<any>(response);
  },

  async updateSettings(instanceUuid: string, settings: object) {
    const response = await api.put(`/ultra_go/settings/${instanceUuid}`, {
      settings,
    });
    return extractData<any>(response);
  },

  // QR Code management (via backend)
  async getQRCode(instanceUuid: string) {
    const response = await api.get(`/ultra_go/qrcodes/${instanceUuid}`);
    return extractData<any>(response);
  },

  // Instance management (via backend)
  async fetchInstance(instanceUuid: string) {
    const response = await api.get('/ultra_go/authorization/fetch', {
      params: { instanceId: instanceUuid },
    });
    return extractData<any>(response);
  },

  async logout(instanceUuid: string) {
    const response = await api.delete('/ultra_go/authorization/logout', {
      params: { instanceId: instanceUuid },
    });
    return extractData<any>(response);
  },

  async connectInstance(instanceUuid: string) {
    const response = await api.post('/ultra_go/authorization/connect', {
      instanceId: instanceUuid,
    });
    return extractData<any>(response);
  },

  async deleteInstance(params: {
    instanceUuid: string;
    apiUrl?: string;
    adminToken?: string;
  }) {
    const response = await api.delete('/ultra_go/authorization/delete_instance', {
      params: {
        instanceId: params.instanceUuid,
        api_url: params.apiUrl,
        admin_token: params.adminToken,
      },
    });
    return extractData<any>(response);
  },
};

export default ultraGoService;
