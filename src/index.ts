import 'dotenv/config';
import './../src/bot/cron/cron'
import TelegramBot from 'node-telegram-bot-api';

let Bot: TelegramBot;

const initializationPromise = (async () => {
  console.log('Initializing bot...');
  ([Bot, Browser] = await Promise.all([botInit(), BrowserController.initialize(5)]));

  if (Bot === undefined) throw 'Unexpected error'
  console.log('Bot initialized successfully.');
  // const parseRequest = await ParseRequestController.getById(10);
  // monsterParser(parseRequest.dataValues)

})();

export { initializationPromise, Bot, Browser};
