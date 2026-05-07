import { makeWASocket, useMultiFileAuthState, DisconnectReason, proto } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import QRCode from 'qrcode';

interface SocketInstance {
  sock: ReturnType<typeof makeWASocket>;
  qrCode: string | null;
  connectionStatus: string;
  instanceName: string;
  phoneNumber: string | null;
}

class PinoLogger {
  info(message: string, ...args: any[]) {
    console.log(`[INFO] ${message}`, ...args);
  }
  error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }
  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }
  debug(message: string, ...args: any[]) {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
  trace(message: string, ...args: any[]) {
    console.trace(`[TRACE] ${message}`, ...args);
  }
  child(obj: any) {
    return this;
  }
}

export class WhatsappService {
  private logger = new PinoLogger();
  private instances: Map<string, SocketInstance> = new Map();
  private readonly authDir = './auth';
  private readonly crmUrl: string;

  constructor() {
    this.crmUrl = process.env.CRM_URL || 'http://localhost:3000';
    if (!fs.existsSync(this.authDir)) {
      fs.mkdirSync(this.authDir, { recursive: true });
    }
  }

  async onModuleDestroy() {
    for (const [name, instance] of this.instances) {
      try {
        instance.sock.end(undefined);
      } catch (error) {
        this.logger.error(`Error closing instance ${name}:`, error);
      }
    }
  }

  async createInstance(instanceName: string): Promise<{ qrCode: string; instanceId: string }> {
    if (this.instances.has(instanceName)) {
      const existing = this.instances.get(instanceName);
      if (existing?.qrCode) {
        return { qrCode: existing.qrCode, instanceId: instanceName };
      }
    }

    const authFile = path.join(this.authDir, `auth_${instanceName}`);
    if (!fs.existsSync(authFile)) {
      fs.mkdirSync(authFile, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFile);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: this.logger as any,
      browser: ['ULTRA CRM', 'Chrome', '110.0.0'],
      defaultQueryTimeoutMs: undefined,
    });

    let qrCode: string | null = null;
    let instanceId = instanceName;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCode = await QRCode.toDataURL(qr);
        const instance = this.instances.get(instanceName);
        if (instance) {
          instance.qrCode = qrCode;
        }
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        this.logger.log(`Connection closed for ${instanceName}, should reconnect: ${shouldReconnect}`);

        if (shouldReconnect) {
          await this.reconnectInstance(instanceName);
        } else {
          const instance = this.instances.get(instanceName);
          if (instance) {
            instance.connectionStatus = 'disconnected';
            instance.qrCode = null;
          }
        }
      } else if (connection === 'open') {
        const instance = this.instances.get(instanceName);
        if (instance) {
          instance.connectionStatus = 'connected';
          instance.qrCode = null;
          instance.phoneNumber = sock.user?.id?.split('@')[0] || null;
        }
        this.logger.log(`Connected for ${instanceName}`);
        await this.notifyCrm(instanceName, 'connected');
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (!msg.key.fromMe) {
          await this.handleIncomingMessage(instanceName, msg);
        }
      }
    });

    this.instances.set(instanceName, {
      sock,
      qrCode,
      connectionStatus: 'connecting',
      instanceName,
      phoneNumber: null,
    });

    return { qrCode: qrCode || '', instanceId };
  }

  private async reconnectInstance(instanceName: string) {
    this.logger.log(`Reconnecting instance ${instanceName}`);
    await this.createInstance(instanceName);
  }

  async getInstanceStatus(instanceName: string): Promise<any> {
    const instance = this.instances.get(instanceName);
    if (!instance) {
      return { status: 'not_found' };
    }

    return {
      status: instance.connectionStatus,
      qrCode: instance.qrCode,
      phoneNumber: instance.phoneNumber,
    };
  }

  async getQrCode(instanceName: string): Promise<string | null> {
    const instance = this.instances.get(instanceName);
    return instance?.qrCode || null;
  }

  async sendMessage(instanceName: string, to: string, message: string): Promise<any> {
    const instance = this.instances.get(instanceName);
    if (!instance) {
      throw new Error(`Instance ${instanceName} not found`);
    }

    if (instance.connectionStatus !== 'connected') {
      throw new Error('Instance not connected');
    }

    const jid = this.normalizeJid(to);
    const result = await instance.sock.sendMessage(jid, { text: message });
    
    if (!result?.key) {
      throw new Error('Failed to send message: no key returned');
    }
    
    return {
      key: result.key,
      messageId: result.key.id,
    };
  }

  async sendMedia(
    instanceName: string,
    to: string,
    mediaUrl: string,
    caption?: string,
    mimetype?: string,
  ): Promise<any> {
    const instance = this.instances.get(instanceName);
    if (!instance) {
      throw new Error(`Instance ${instanceName} not found`);
    }

    if (instance.connectionStatus !== 'connected') {
      throw new Error('Instance not connected');
    }

    try {
      const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      const jid = this.normalizeJid(to);

      const messageType = mimetype?.startsWith('image') ? 'image' : 'document';
      const message: any = {
        [messageType]: { url: mediaUrl },
      };

      if (caption) {
        message[messageType].caption = caption;
      }

      const result = await instance.sock.sendMessage(jid, message);
      
      if (!result?.key) {
        throw new Error('Failed to send media: no key returned');
      }
      
      return { key: result.key, messageId: result.key.id };
    } catch (error) {
      this.logger.error(`Error sending media:`, error);
      throw error;
    }
  }

  async sendButtons(
    instanceName: string,
    to: string,
    message: string,
    buttons: Array<{ id: string; title: string }>,
  ): Promise<any> {
    const instance = this.instances.get(instanceName);
    if (!instance) {
      throw new Error(`Instance ${instanceName} not found`);
    }

    if (instance.connectionStatus !== 'connected') {
      throw new Error('Instance not connected');
    }

    const jid = this.normalizeJid(to);
    const buttonMessages = {
      text: message,
      buttons: buttons.map((btn) => ({
        buttonId: btn.id,
        buttonText: { displayText: btn.title },
        type: 1,
      })),
    };

    const result = await instance.sock.sendMessage(jid, buttonMessages);
    
    if (!result?.key) {
      throw new Error('Failed to send buttons: no key returned');
    }
    
    return { key: result.key, messageId: result.key.id };
  }

  private normalizeJid(number: string): string {
    if (number.includes('@g.us')) return number;
    const formatted = number.replace(/\D/g, '');
    return `${formatted}@s.whatsapp.net`;
  }

  private async handleIncomingMessage(instanceName: string, msg: proto.IWebMessageInfo) {
    if (!msg.key?.remoteJid || !msg.key?.id) {
      this.logger.warn('Received message without valid key');
      return;
    }
    
    const from = msg.key.remoteJid;
    const messageId = msg.key.id;
    const message = this.extractMessageContent(msg);
    const senderName = msg.pushName || from.split('@')[0];

    const payload = {
      instanceId: instanceName,
      from,
      senderName,
      messageId,
      message,
      timestamp: msg.messageTimestamp,
      type: msg.message ? Object.keys(msg.message)[0] : 'unknown',
    };

    try {
      await axios.post(`${this.crmUrl}/api/whatsapp/webhook`, payload);
      this.logger.log(`Message sent to CRM: ${messageId}`);
    } catch (error) {
      this.logger.error(`Error sending to CRM:`, error);
    }
  }

  private extractMessageContent(msg: proto.IWebMessageInfo): string {
    if (!msg.message) return '';

    const message = msg.message;
    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if (message.imageMessage?.caption) return message.imageMessage.caption;
    if (message.videoMessage?.caption) return message.videoMessage.caption;
    if (message.documentMessage?.caption) return message.documentMessage.caption;

    return JSON.stringify(message);
  }

  private async notifyCrm(instanceName: string, status: string) {
    try {
      await axios.post(`${this.crmUrl}/api/whatsapp/status`, {
        instanceId: instanceName,
        status,
      });
    } catch (error) {
      this.logger.error(`Error notifying CRM:`, error);
    }
  }

  async logout(instanceName: string): Promise<void> {
    const instance = this.instances.get(instanceName);
    if (instance) {
      instance.sock.end(undefined);
      this.instances.delete(instanceName);
      
      const authFile = path.join(this.authDir, `auth_${instanceName}`);
      if (fs.existsSync(authFile)) {
        fs.rmSync(authFile, { recursive: true, force: true });
      }
    }
  }
}
