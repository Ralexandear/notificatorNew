import { Listener } from "../../database/models/public/Listener"
import { ListenerModel } from "../../database/models/sequelize/Listener.model"

class ListenerControllerClass {
  async createListener(userId: number, pointId: number, date = new Date()) {
    return ListenerModel.create({date, pointId, listenerUserId: userId}).then(Listener.init)
  }

  async getListeners(pointId: number, date = new Date()) {
    return ListenerModel.findAll({where: {date, pointId}}).then(listenerModelArr => listenerModelArr.map(Listener.init))
  }
}

export const ListenerController = new ListenerControllerClass()
export default ListenerController