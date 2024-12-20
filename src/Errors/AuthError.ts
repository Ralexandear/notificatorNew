export class AuthError extends Error {
  constructor(message: string) {
    super('AUTH :' + message)
  }

  static userNotFound(telegramId: number | string, username?: string) {
    let message = `user with telegram id ${telegramId} not found`
    if (username) message += ', username' + username
    return new this(message)
  }

  static usernameIsMissing(telegramId: number | string) {
    return new this('Username is missing for telegram id: ' + telegramId)
  }
}