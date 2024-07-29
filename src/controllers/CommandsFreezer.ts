import { sleep } from "../utilities/sleep";

class CommandsFreezerClass {
  private queue: Map<string, Map<string, number>>;
  private readonly limit: number;

  /**
   * @param limit - Maximum value for the command counter before it's removed.
   */
  constructor(limit: number = 1) {
    this.queue = new Map();
    this.limit = limit;
    this.processQueue();
  }

  /**
   * Check if the command is new for the given user.
   * @param telegramId - Telegram user ID.
   * @param command - Command to check.
   * @returns boolean - True if command is new, otherwise false.
   */
  isNewCommand(telegramId: string | number, command: string | undefined): boolean {
    if (command === undefined) return true
    const id = telegramId.toString();
    
    if (!this.queue.has(id)) {
      this.queue.set(id, new Map<string, number>().set(command, 0));
      return true;
    }

    const userCommands = this.queue.get(id) as Map<string, number>;
    const isNew = !userCommands.has(command);

    if (isNew) {
      userCommands.set(command, 0);
    }

    return isNew;
  }

  /**
   * Periodically updates the command usage counter and cleans up old commands.
   */
  private async processQueue(): Promise<void> {
    while (true) {
      for (const [userId, userCommands] of this.queue) {
        for (const [command, value] of userCommands) {
          if (value < this.limit) {
            userCommands.set(command, value + 1);
          } else {
            userCommands.delete(command);
          }
        }
        if (userCommands.size === 0) {
          this.queue.delete(userId);
        }
      }
      await sleep(1000, false);
    }
  }
}

export const CommandsFreezer = new CommandsFreezerClass();
export default CommandsFreezer;