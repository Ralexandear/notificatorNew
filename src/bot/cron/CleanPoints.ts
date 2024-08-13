import cron from 'node-cron'
import Config from '../../utils/Config'
import PointsController from '../../controllers/databaseControllers/PointsController';

const timeOfSync = Config.updatingTime;


class CleanPointsClass {
  // private _timer: cron.ScheduledTask;
  // private _lastShiftClearing: Date;
  
  constructor() {
    const [hh, mm] = Config.updatingTime.split(':');
    const lastUpdateDate = Config.lastShiftClearing;
    const now = this.now;

    if (now)



  }

  private get now() {
    return new Date()
  }
}





async function cleanPoints() {
  await PointsController.removeAllUsers();
}