import TelegramBot from "node-telegram-bot-api";
import Buttons from "./Buttons";
import { Point, Preset, User } from "../../database/models";
import PointsController from "../../controllers/databaseControllers/PointsController";
import { Delimiter, Icons } from "../../config";
import { SelectPointsTempType } from "../../types/TempType";
import { ShiftSelectorType, ShiftType } from "../../types/ShiftType";
import { PresetActionType } from "../../types/PresetActionType";
import PresetController from "../../controllers/databaseControllers/PresetController";
import { ShiftSizeType } from "../../types/ShiftSizeType";
import { ShiftEnum } from "../../enums/ShiftEnum";



type InlineKeyboardRow = TelegramBot.InlineKeyboardButton[];
const maxRowWidth = 4


export class InlineKeyboardReplyMarkup implements TelegramBot.InlineKeyboardMarkup {
  inline_keyboard: TelegramBot.InlineKeyboardButton[][];

  constructor(columns: number, ...buttons: InlineKeyboardRow) {
    const row: InlineKeyboardRow = [];
    this.inline_keyboard = buttons.reduce((arr: InlineKeyboardRow[], button, index) => {
      row.push(button);
      if ((index + 1) % columns === 0 || index === buttons.length - 1) {
        arr.push([...row]);
        row.length = 0;
      }
      return arr;
    }, []);
    if (row.length) this.inline_keyboard.push(row);
  }

  static welcomeMessage(){
    return new InlineKeyboardReplyMarkup(1, Buttons.textToAdmin())
  }

  static errors(){
    return {
      authorizationError(){
        return new InlineKeyboardReplyMarkup(1, Buttons.textToAdmin())
      }
    }
  }

  static orders(chatId: number | string, messageId: number | string) {
    return {
      mainMessage({navLink, orderId} : {navLink?: string, orderId?: string | number} = {}) {
        const buttons: Buttons[] = [];

        if ( navLink ) buttons.push( Buttons.navButton( navLink ) )
        buttons.push( Buttons.linkToMessage( chatId, messageId ))
    
        const reply_markup = new InlineKeyboardReplyMarkup(2, ...buttons);
        if ( orderId ) reply_markup.inline_keyboard.unshift([ Buttons.acceptOrder( orderId )])
        return reply_markup
      },

      listenerMessage(){
        return new InlineKeyboardReplyMarkup(1, Buttons.linkToMessage( chatId, messageId ))
      }
    }
  }

  static menu() {
    return {
      selectPoints(){
        return new InlineKeyboardReplyMarkup(1, Buttons.fullShift(), Buttons.halfShift())
      },

      async presets(user: User) {
        if (! user.presetIsActive) return new InlineKeyboardReplyMarkup(1, Buttons.activate());
        
        const points = await PointsController.getAll()
        const icon = Icons.redPin
        const presetAction: PresetActionType = 'selectPoint'
        const buttons = (points.map(point => Buttons.selectButton(icon + ' ' + point.point, presetAction, point.id)))
        const reply_markup = new InlineKeyboardReplyMarkup(maxRowWidth, ...buttons);
        reply_markup.inline_keyboard.unshift( [ Buttons.deactivate() ] )
        
        return reply_markup
      }
    }
  }

  static points() {
    return {
      async pointList ( user: User, shiftSize: ShiftSizeType ) {
        const points = await PointsController.getAll()      
        // const replyMarkup = new InlineKeyboardReplyMarkup(maxRowWidth);
        
        // const keyboard = replyMarkup.inline_keyboard;
    
        if (shiftSize === 'full') {
          const getButton = (icon: string, point: Point) => Buttons.selectButton(icon + ' ' + point.point + '.2', [icon, point.id, ShiftEnum[ shiftSize ] ].join(Delimiter))
          const buttons = points.map(point => {
            const shiftTypes = ['morning', 'evening'] as ShiftType[];

            const icon = (() => {
              //if point is taken by user
              if (shiftTypes.every(shiftType => point.getUserId(shiftType) === user.id)) return Icons.greenDot

              const pointIsVailable = (['morning', 'evening'] as ShiftType[]).every(shiftType => {
                const userId = point.getUserId(shiftType);
                return userId === null || userId === user.id
              })
              
              if (pointIsVailable) return Icons.yellowDot;
              return  Icons.redDot;
            })();
            
            return getButton(icon, point);
          });

          const buttonsToAdd = maxRowWidth - buttons.length % maxRowWidth;
          if (buttonsToAdd !== maxRowWidth) buttons.push( ...new Array(buttonsToAdd).fill(Buttons.emptyButton()) )
    
          return new InlineKeyboardReplyMarkup(maxRowWidth, ...buttons);
        } 

        const buttons =  (['morning', 'evening'] as ShiftType[]).map((shiftType, el) => {
          const postfix = el ? '.1' : ''
          const getButton = (icon: string, point: Point) => Buttons.selectButton(icon + ' ' + point.point + postfix, [icon, point.id, ShiftEnum[ shiftType ]].join(Delimiter))
    
          const buttons = points.map(point => {
            const icon = (() => {
              const courierId = point.getUserId(shiftType)
              
              if (courierId === user.id) return Icons.greenDot
              else if (courierId) return Icons.redDot
              return Icons.yellowDot
            })();
            return getButton(icon, point)
          })
    
          const buttonsToAdd = maxRowWidth - buttons.length % maxRowWidth;
          if (buttonsToAdd !== maxRowWidth) buttons.push( ...new Array(buttonsToAdd).fill(Buttons.emptyButton()) )

          return buttons
        });

        buttons.splice(1, 0, new Array(maxRowWidth).fill(Buttons.emptyButton()));
    
        return new InlineKeyboardReplyMarkup(maxRowWidth, ...buttons.flat())
      },

      pointIsBusy( point: Point, shiftType: ShiftSelectorType ) {
        return new InlineKeyboardReplyMarkup(1, Buttons.setForce( point.id, shiftType ))
      }


    }
  }

  static async presets(user: User, selectedPointOrPreset: Point | Preset){
    
    const [points, preset, selectedPointId] = await ( async () => {
      const pointsPromise = PointsController.getAll()
      if (selectedPointOrPreset instanceof Preset) return pointsPromise.then(points => [points, selectedPointOrPreset, selectedPointOrPreset.pointId]);
      return Promise.all([pointsPromise, PresetController.getPresetForPoint(user.id, selectedPointOrPreset.id)]).then(result => [...result, selectedPointOrPreset.id])
    })() as [Point[], Preset, number];
    
    
    const pointsToListen = new Set(preset?.pointsToListen || []);
    const presetAction: PresetActionType = 'selectPreset'; 
    const buttons = points.map(point => {
      if ( point.id === selectedPointId ) return Buttons.backButton(Icons.redPin + ' ' + point.point, presetAction, point.id);
      if ( pointsToListen.has( point.id )) return Buttons.deactivate(Icons.greenDot + ' ' + point.point, presetAction, point.id)
      return Buttons.activate(Icons.yellowDot + ' ' + point.point, presetAction, point.id);
    })
    
    return new InlineKeyboardReplyMarkup(maxRowWidth, ...buttons);
  }

}

