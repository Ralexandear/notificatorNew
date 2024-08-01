import { sleep } from "../bot/utilities/sleep";

export type TelegramQueueOptions = {priority?: number, delay?: number}

class TelegramQueue {
  private queue: { [key: number]: Array<() => Promise<any>>}
  private queueKeys: Array<number>;
  private workCount: number;
  private workLimit: number;
  private queueLength!: number

  /**
   * 
   * @param limit 
   */
  constructor (limit: number = 20) {
    this.queue = []
    this.workCount = 0
    this.workLimit = limit
    this.queueKeys = new Array()
    this.queueLength = 0
    this.processQueue()
  }

  async add(handler: () => Promise<any | void>, options: TelegramQueueOptions = {}){
    const {priority = 5, delay = 0} = options;
    if (! this.queue[priority]){
      this.queue[priority] = new Array()

      if (! this.queueKeys.includes(priority)){
        this.queueKeys.push(priority)
        this.queueKeys.sort((a, b) => Number(a) - Number(b));
      }
    }
    
    this.queue[priority].push(handler)
    this.queueLength++
  }

  private async processQueue(): Promise<void> {
    while (true){
      while (this.queueLength){
        try {
          const job = (() => {
            for (const key of this.queueKeys){
              const job = this.queue[key].shift();
              if (job) return job
            }
            throw 'Queue error, jobs not found!'
          })();

          console.log(job)
          while(this.workCount >= this.workLimit) await sleep(1000); //pause queue
          this.workCount++

          await job().catch(console.error)
        } catch(e){
          console.error(e)
        } finally {
          this.workCount--
          this.queueLength--
        }
      }
      await sleep(10, false)
    }
    
  }

  get worksInQueue(){
    return this.queueLength
  }
}

export default new TelegramQueue()