import cron from 'node-cron'
import Config from '../utils/Config'
import PointsController from '../controllers/databaseControllers/PointsController';
import Validator from '../utils/Validator';
import ValidationError from '../errors/ValidationError';
import { initDatabasePromise } from '../database/initDatabase';

const getCronTimer = (hours: number, minutes: number ) => {
  if (Validator.number(hours).isHours() && Validator.number(+minutes).isMinutes()) return `${minutes} ${hours} * * *`
  throw new ValidationError('Hours or minutes validation failed!')
}

class CronCleanPointsClass {
  private _timer: cron.ScheduledTask;
  private _updateTime: {
    hours: number;
    minutes: number;
  }
  private _lastShiftClearingDate: Date | null;
  
  constructor() {
    const [hours, minutes] = Config.updatingTime.split(':').map(Number);
    this._updateTime = {hours, minutes};
    this._lastShiftClearingDate = Config.lastShiftClearing;
    this.checkManually();
    this._timer = cron.schedule(getCronTimer(hours, minutes), async () => await this.cleanPoints())
  }

  private get now() {
    return new Date()
  }

  private syncLastUpdateDate () {
    const lastUpdateDate = this.now;
    Config.setLastShiftClearing( lastUpdateDate )
    console.log('last shift clearing date updated successfully!')
  }

  private async cleanPoints(){
    await initDatabasePromise;
    
    await PointsController.removeAllUsers()
    console.log('All users removed from points!')
    
    this.syncLastUpdateDate()
  }

  private async checkManually () {
    await initDatabasePromise;

    const lastUpdateDate = this._lastShiftClearingDate
    console.log(lastUpdateDate)
    
    if (! lastUpdateDate) return this.cleanPoints();

    const now = this.now
    const {hours, minutes} = this._updateTime
    const daysAfterLastUpdate = Validator.date(lastUpdateDate).comparison(now).getDaysBetween();
    console.log(hours, minutes)

    
    if (daysAfterLastUpdate > 1 || (now.getHours() >= hours && now.getMinutes() >= minutes)) {
      this.cleanPoints()
    }
  }


  updateTimer(hours: number, minutes: number) {
    const cronTimer = getCronTimer(hours, minutes);
   
    this._updateTime = {hours, minutes}
    this.checkManually();
    this._timer.stop()
    this._timer = cron.schedule(cronTimer, this.cleanPoints)
  }
}


export const CronCleanPoints = new CronCleanPointsClass();
export default CronCleanPoints;

console.log('Clean points timer enabled!')