import { FatalError } from "../../../Errors/FatalError";
import { MessageConstructor } from "../../../bot/messageConstructor/MessageConstructor";
import { ShiftSelectorType, ShiftType } from "../../../bot/types/ShiftType";
import UserController from "../../../controllers/databaseControllers/UserController";
import { PostfixEnum } from "../../../enums/PostfixEnum";
import { PointAttributes } from "../../../interfaces/Point.attributes";
import { PointModel } from "../sequelize/Point.model";
import { IncapsulationModel } from "./IncapsulationModel";
import { User } from "./User";

export class Point extends IncapsulationModel<PointModel> implements PointAttributes {
  static init(model: PointModel) {
    return new this(model)
  }
  
  private constructor(protected model: PointModel) {
    super(model)
  }

  get id() {
    return this.model.id
  }

  get point () {
    return 'К' + this.id
  }

  get morning() {
    return this.model.morning
  }

  set morning(userId: number | null) {
    this.model.morning = userId
  }

  get evening() {
    return this.model.evening
  }

  set evening(userId: number | null) {
    this.model.evening = userId
  }

  async getUser (shiftType: ShiftType) {
    const userId = this.getUserId( shiftType )
    return userId ? await UserController.getById(userId) : null;
  }

  getUserId( shiftType: ShiftType ): number | null {
    return this[shiftType as keyof this] as number | null
  }

  private setUser( shiftType: ShiftType, user: User ) {
    if (shiftType === 'morning') this.morning = user.id
    else if (shiftType === 'evening') this.evening = user.id
    else throw new FatalError('Unexpected shift type while adding user to a point')

    console.log(user.fullName, 'записался на точку', this.id, shiftType)

    return this
  }

  private removeUser( shiftType: ShiftType, user: User ) {
    if (shiftType === 'morning') {
      if (this.morning === user.id) {
        this.morning = null;
      }
    } else if (shiftType === 'evening') {
      if (this.evening === user.id) {
        this.evening = null
      }
    }
    else throw new FatalError('Unexpected shift type while removing user from point')

    console.log(user.fullName, 'освободил точку', this.id, shiftType)

    return this
  }

  
  // /**
  //  * Set's user to a shift, return true if user setted successfully, otherwise false
  //  * @param user 
  //  * @param shiftType 
  //  * @param setForce {boolean}
  //  * @returns {boolean} 
  //  */
  // async setUserToShift(user: User, shiftType: ShiftSelectorType, setForce = false) {
  //   const notifyUser = (userId: number, postfix: string ) => UserController.getById( userId )
  //     .then(user => {
  //       const {text, reply_markup} = MessageConstructor.notifications().pointLost(user, this.point + postfix)
  //       user.sendMessage(text, {reply_markup})
  //     });
    
  //   const shiftsArr = ['morning', 'evening'] as ShiftType[];

  //   if (shiftType === 'full') {
  //     const shifts = [this.morning, this.evening]

  //     if (setForce){
  //       check:  {
  //         //Check and notify users
  //         if (this.morning) it:{ //for morning
  //           if (this.morning === user.id) break it;
  //           const onlyOneCourier = this.morning === this.evening
  //           const postfix = onlyOneCourier ? PostfixEnum.full : PostfixEnum.morning

  //           notifyUser(this.morning, postfix);
  //           if (onlyOneCourier) break check; //if one user work both on morning and evening shifts
  //         }

  //         if (this.evening) it:{
  //           if (this.evening === user.id) break it;
  //           const postfix = PostfixEnum.evening
  //           notifyUser(this.evening, postfix)
  //         }
  //       }
  //     }
  //     else if (shifts.some(courierId => courierId && courierId !== user.id)) return false

  //     shiftsArr.forEach(e => this.setUser(e, user))
  //     const presetArray = await user.preset().getPointPreset(this.id);
  //     preset.enable(shiftType);

  //     await this.save();
  //     return true;
  //   }

  //   const courierId = this.getUserId( shiftType );
    
  //   if (courierId) {
  //     if (courierId === user.id) return true
  //     if (! setForce) return false;
      
  //     const postfix = PostfixEnum[ shiftType ];
  //     notifyUser(courierId, postfix);
  //   }
    
  //   await this.setUser(shiftType, user);
  //   return true
  // }

  // listeners (shiftType: ShiftSelectorType) {
  //   const shifts: ShiftType[] = shiftType === 'full' ? ['morning', 'evening'] : [ shiftType ];
  //   const point = this;
  //   let isChanged = false;
    
  //   const save = async () => {
  //     if (! isChanged) return this
  //     point._changed.add('listeners');
  //     return point.save();
  //   }

  //   return {
  //     async enable (userId: number) {
  //       shifts.forEach(e => {
  //         const listeners = point._listeners[e];
  //         if (listeners.includes(userId)) return;
  //         isChanged = true;
  //         listeners.push(userId);
  //       })
  //       return save();
  //     }, 

  //     async disable (userId: number) {
  //       shifts.forEach( e => point._listeners[e] = point._listeners[e].filter(e => e === userId && (isChanged = true)) );
  //       return save();
  //     },

  //     async get () {
  //       if (shiftType === 'full') {
  //         log('unexpected shiftType')
  //         return
  //       }

  //       const userIds = point._listeners[ shiftType ]
  //       if (userIds.length) return await UserController.getByIds( ...userIds )
  //     }
  //   }
  // }
}