import 'dotenv/config';
import './../src/bot/cron/cron'
import TelegramBot from 'node-telegram-bot-api';
import { TextMessageHandler } from './handlers/textMessageHandlers/TextMessageHandler';
import { initDatabasePromise } from './database/initDatabase';
import { User } from './database/models';
import UserController from './controllers/UserController';


const Bot = new TelegramBot( process.env.BOT_TOKEN as string, { polling: true});
let Admin: User



const botInitializationPromise = (async () => {
  await initDatabasePromise;
  console.log(await Bot.getMe());
  const adminTelegramId = process.env.ADMIN;
  
  if (! adminTelegramId) throw new Error('Required parameter ADMIN is missing in env')
  Admin = await UserController.find( adminTelegramId )

  Bot.on("message", TextMessageHandler)
  
  console.log('Bot is ready')
})();

export { botInitializationPromise, Bot};
export default Bot;
