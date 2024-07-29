import TelegramBot from "node-telegram-bot-api"
import { Point, User } from "../../../database/models"
import { Log } from "../../../utilities/Log"
import splitCommand from "../../../utilities/splitCommand"
import Buttons from "../../../messageConstructor/replyMarkup/Buttons"
import { SelectPointsTempType } from "../../../types/TempType"
import { MessageConstructor } from "../../../messageConstructor/MessageConstructor"
import { Icons } from "../../../config"
import { ShiftSelectorType } from "../../../types/ShiftType"
import PointsController from "../../../controllers/databaseControllers/PointsController"
import { ShiftSizeType } from "../../../types/ShiftSizeType"




export async function SelectPointsHandler (user: User, callback: TelegramBot.CallbackQuery){
  if (! callback.data) return

  const sendBusyAlert = async(point: Point, shiftType: ShiftSelectorType) => {
    const {text, reply_markup} = await MessageConstructor.points().pointIsBusy(point, shiftType);
    user.editMessageText(text, {reply_markup})
  }

  Log('callbackId', callback.id)
  const {action, params} = splitCommand(callback.data)

  if (Buttons.halfShift().callback_data === action) {
    var shiftSize: ShiftSizeType = 'half' 
  } else if (Buttons.fullShift().callback_data === action) {
    var shiftSize: ShiftSizeType = 'full'
  } else {
    if (action !== Buttons.selectButton().callback_data) return
    const [icon, poinId, shiftType] = params as [Icons, string, ShiftSelectorType];
    var shiftSize: ShiftSizeType = shiftType === 'full' ? 'full' : 'half';
    const point = await (async () => {
      const id = +poinId;
      if (isNaN(id)) return
      return PointsController.find( id );
    })();

    if (! point) {
      Log('Point with id', poinId, 'notFound')
      return
    };
    console.log(icon)
    if (icon === Icons.greenDot){
      await point.removeUser(user, shiftType);
    } else if ([Icons.yellowDot, Icons.redDot].includes(icon as Icons)) {
      const pointIsSet = await point.setUserToShift(user, shiftType);
      if (! pointIsSet) return sendBusyAlert(point, shiftType);
    } else return
  }

  Log('ShiftSize is', shiftSize)
  const {text, reply_markup} = await MessageConstructor.points().pointList(user, shiftSize)
  user.editMessageText(text, {reply_markup});
}