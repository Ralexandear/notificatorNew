import { Json } from "sequelize/types/utils";
import { User } from "../../database/models";
import RedisController from "../RedisController";
import { Op } from "sequelize";
import { UserStatusEnum } from "../../enums/UserStatusEnum";


class UserControllerClass {
  create( telegramId: number | string, fullName: string, username: string){
    return User.create({ telegramId: telegramId.toString(), _fullName: fullName, _username: username, status: UserStatusEnum.active})
  }

  async find( telegramId: number | string ){
    const userdata = await RedisController.get(telegramId);
    if ( userdata ) return User.build(JSON.parse( userdata ), { isNewRecord: false });
    
    const user = await User.findOne( { where: { telegramId: telegramId.toString() }} ) 
    if (user) user.saveToRedis() 
  }

  async getById( id: number ){
    const user = await User.findByPk( id )
    if (! user) throw new Error(`User with id ${id} not found!`)      
    return user.saveToRedis()
  }

  async getByIds( ...ids: number[]){
    const users = await User.findAll({
      where: {
        id: {
          [Op.in] : ids
        }
      }
    })

    if (ids.length === users.length) return users.map(e => e.saveToRedis())
    throw 'The number of users does not match the requested one'
  }

  saveChanges( user: User ) {
    return Promise.all([
      user.save(),
      RedisController.set(user.id, user.dataValues)
    ])
  }
}

export const UserController = new UserControllerClass()
export default UserController