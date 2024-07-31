import { Op } from "sequelize";
import { Point } from "../../database/models";
import { parseCheckInteger } from "../../parseCheckInteger";
import { PointAttributes } from "../../interfaces/databaseInterfaces";


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

  async getPoints( ...pointNumbers: (string | number)[] ) {
    const points = await Point.findAll(
      {
        where: {
          id: {
            [Op.in]: pointNumbers
          }
        }
      }
    )

    if (pointNumbers.length === points.length) return points;
    throw new Error('Unexpected error, expected point numbers not equal to quantity of points requested');
  }

  async getPointIds(){
    return Point.findAll({attributes: ['id'] as (keyof PointAttributes)[]}).then(result => result.map(e => e.id))
  }

}

export const PointsController = new PointsControllerClass()
export default PointsController