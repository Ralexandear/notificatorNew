import { Point } from "../../database/models";
import { parseCheckInteger } from "../../parseCheckInteger";


class PointsControllerClass {
  async create( pointNumber: string | number ){
    return Point.create({id: parseCheckInteger(pointNumber)})
  }

  async getAll(){
    return Point.findAll({order: [['id', 'ASC']]})
  }

  async find( pointNumber: string | number ) {
    const point = await Point.findOne({ where: { id: parseCheckInteger(pointNumber )}} )
    if (point) return point
    throw new ReferenceError(`Point #${pointNumber} was not found in database`)
  }

}

export const PointsController = new PointsControllerClass()
export default PointsController