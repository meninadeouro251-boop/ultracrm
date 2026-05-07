import axios from 'axios';

const BAILEYS_API_URL = process.env.REACT_APP_BAILEYS_API_URL || 'http://localhost:3001';

const baileysApi = axios.create({
  baseURL: BAILEYS_API_URL,
  timeout: 30000,
});

export const BaileysService = {
  async createInstance(instanceName: string): Promise<{ qrCode: string; instanceId: string }> {
    const response = await baileysApi.post('/whatsapp/create', { instanceName });
    return response.data;
  },

  async getInstanceStatus(instanceName: string): Promise<{ status: string; qrCode?: string; phoneNumber?: string }> {
    const response = await baileysApi.get(`/whatsapp/status/${instanceName}`);
    return response.data;
  },

  async getQrCode(instanceName: string): Promise<{ qrCode: string }> {
    const response = await baileysApi.get(`/whatsapp/qr/${instanceName}`);
    return response.data;
  },

  async sendMessage(instanceName: string, to: string, message: string): Promise<{ key: any; messageId: string }> {
    const response = await baileysApi.post(`/whatsapp/send/${instanceName}`, { to, message });
    return response.data;
  },

  async sendMedia(
    instanceName: string,
    to: string,
    mediaUrl: string,
    caption?: string,
    mimetype?: string,
  ): Promise<{ key: any; messageId: string }> {
    const response = await baileysApi.post(`/whatsapp/media/${instanceName}`, {
      to,
      mediaUrl,
      caption,
      mimetype,
    });
    return response.data;
  },

  async sendButtons(
    instanceName: string,
    to: string,
    message: string,
    buttons: Array<{ id: string; title: string }>,
  ): Promise<{ key: any; messageId: string }> {
    const response = await baileysApi.post(`/whatsapp/buttons/${instanceName}`, {
      to,
      message,
      buttons,
    });
    return response.data;
  },

  async logout(instanceName: string): Promise<void> {
    await baileysApi.post(`/whatsapp/logout/${instanceName}`);
  },
};

export default BaileysService;