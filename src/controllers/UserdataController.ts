import { Userdata } from "../database/models";

class UserdataControllerClass {
  async getById (userId: number) {
    const userdata = await Userdata.findOne({ where: { userId }})
    if (userdata) return userdata
    throw new Error('Userdata not found for userId ' + userId )
  }
}

export const UserdataController = new UserdataControllerClass()
export default UserdataController