import { Preset } from "../../database/models";

class PresetControllerClass {
  async getPresetForPoint(userId: number, pointId : number){
    return Preset.findOrCreate({where: {userId, pointId}, defaults: {pointId, userId, pointsToListen: []}}).then(([preset, isNew]) => preset);
  }

  async getUserPresets(userId: number){
    return Preset.findAll({where: {userId}})
  }


}

export const PresetController = new PresetControllerClass();
export default PresetController;