import { Op } from "sequelize"
import { parseCheckInteger } from "../../bot/utilities/parseCheckInteger"
import { Point } from "../../database/models/public/Point"
import { PointModel } from "../../database/models/sequelize/Point.model"
import { FatalError } from "../../Errors/FatalError"
import { PointAttributes } from "../../interfaces/Point.attributes"



class PointsControllerClass {
  async create( pointNumber: string | number ){
    return PointModel.create({id: parseCheckInteger(pointNumber)}).then(Point.init)
  }

  async getAll(){
    return PointModel.findAll({order: [['id', 'ASC']]}).then(array => array.map(Point.init))
  }

  async find( pointId: number ) {
    const point = await PointModel.findOne({ where: { id: pointId}} )
    if (point) return Point.init(point)
    
      throw new FatalError(`Point #${pointId} was not found in database`)
  }

  async getPoints( ...pointIds: (string | number)[] ) {
    const points = await PointModel.findAll(
      {
        where: {
          id: {
            [Op.in]: pointIds
          }
        }
      }
    )

    if (pointIds.length === points.length) return points.map(Point.init);
    throw new Error('Unexpected error, expected point numbers not equal to quantity of points requested');
  }

  async getPointIds(){
    return PointModel.findAll({attributes: ['id'] as (keyof PointAttributes)[]}).then(result => result.map(e => e.id))
  }



}

export const PointsController = new PointsControllerClass()
export default PointsController