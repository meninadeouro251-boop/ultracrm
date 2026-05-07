import express, { Request, Response } from 'express';
import { WhatsappService } from './whatsapp/whatsapp.service';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const whatsappService = new WhatsappService();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.post('/whatsapp/create', async (req: Request, res: Response) => {
  try {
    const { instanceName } = req.body;
    const result = await whatsappService.createInstance(instanceName);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/whatsapp/status/:instanceName', async (req: Request, res: Response) => {
  try {
    const { instanceName } = req.params;
    const result = await whatsappService.getInstanceStatus(instanceName);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/whatsapp/qr/:instanceName', async (req: Request, res: Response) => {
  try {
    const { instanceName } = req.params;
    const qrCode = await whatsappService.getQrCode(instanceName);
    res.json({ qrCode });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/whatsapp/send/:instanceName', async (req: Request, res: Response) => {
  try {
    const { instanceName } = req.params;
    const { to, message } = req.body;
    const result = await whatsappService.sendMessage(instanceName, to, message);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/whatsapp/media/:instanceName', async (req: Request, res: Response) => {
  try {
    const { instanceName } = req.params;
    const { to, mediaUrl, caption, mimetype } = req.body;
    const result = await whatsappService.sendMedia(instanceName, to, mediaUrl, caption, mimetype);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/whatsapp/buttons/:instanceName', async (req: Request, res: Response) => {
  try {
    const { instanceName } = req.params;
    const { to, message, buttons } = req.body;
    const result = await whatsappService.sendButtons(instanceName, to, message, buttons);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/whatsapp/logout/:instanceName', async (req: Request, res: Response) => {
  try {
    const { instanceName } = req.params;
    await whatsappService.logout(instanceName);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`Whatsapp Baileys Service running on port ${port}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await whatsappService.onModuleDestroy();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await whatsappService.onModuleDestroy();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
