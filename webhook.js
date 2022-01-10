//aggiunto per eliminare "node-telegram-bot-api deprecated Automatic enabling of cancellation of promises is deprecated"
process.env.NTBA_FIX_319 = 1;
/**
 * This example demonstrates setting up a webook, and receiving
 * updates in your express app
 */
/* eslint-disable no-console */

const TOKEN = process.env.TELEGRAM_TOKEN || '5047978121:AAFXPC7tvG7C82bmuakoaxo6z9HRsGYDtME';
const url = 'https://950f-80-104-141-187.ngrok.io';
const PORT = 3000;
const port = process.env.PORT;

const TelegramBot = require('node-telegram-bot-api');

const express = require('express');

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`);

const app = express();

// parse the updates to JSON
app.use(express.json());

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});


// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${PORT}`);
});

// Just to ping!
bot.on('message', msg => {
  bot.sendMessage(msg.chat.id, 'I am alive!');
});

