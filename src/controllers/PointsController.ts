import { Points } from "../database/models";
import { parseCheckInteger } from "../parseCheckInteger";

type PointNumberType = number | string



class PointsControllerClass {
  async create( pointNumber: PointNumberType ){
    return Points.create({id: parseCheckInteger(pointNumber)})
  }

  async getAll(){
    return Points.findAll({order: [['id', 'ASC']]})
  }

  async find( pointNumber: PointNumberType ) {
    const point = await Points.findOne({ where: { id: parseCheckInteger(pointNumber )}} )
    if (point) return point
    throw new ReferenceError(`Point #${pointNumber} was not found in database`)
  }

}

export const PointsController = new PointsControllerClass()
export default PointsController