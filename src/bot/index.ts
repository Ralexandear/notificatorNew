import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { TextMessageHandler } from './handlers/textMessageHandlers/TextMessageHandler';
import { initDatabasePromise } from '../database';
import UserController from '../controllers/databaseControllers/UserController';
import { CallbackQueryHandler } from './handlers/callbackQueryHandlers/CallbackQueryHandler';
import PointsController from '../controllers/databaseControllers/PointsController';
import Config from '../utils/Config';
import { User } from '../database/models/public/User';
// import '../cron/CronCleanPoints'

const botToken = process.env.BOT_TOKEN;
export const log = console.log
if (! botToken) throw new ReferenceError('Bot token is missing in env')

const Bot = new TelegramBot( botToken, { polling: true});
Bot.on("message", TextMessageHandler)
Bot.on("callback_query", CallbackQueryHandler)

let Admin: User

const botInitializationPromise = (async () => {
  await initDatabasePromise;
  await syncPoints()

  const adminTelegramId = process.env.ADMIN;
  
  if (! adminTelegramId) throw new Error('Required parameter ADMIN is missing in env')
  Admin = await UserController.findOrCreate( adminTelegramId, 'admin', 'ralexandear' )
  
  console.log(await Bot.getMe());
  console.log('Bot is ready')
})();


async function syncPoints() {
  const pointsIds = new Set(await PointsController.getPointIds());

  for (const pointId of Config.enabledPoints) {
    if (pointsIds.has(pointId)) continue;
    await PointsController.create(pointId);
  }
}

export { botInitializationPromise, Bot};
export default Bot;
