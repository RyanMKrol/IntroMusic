import { storeIntroMusic } from './../Storage/Storage.js'
import {
  updateRateLimitForUser,
  hasUserExceededRateLimit,
  RATE_LIMIT_TIMER_MINUTES,
  OPERATIONS_PER_PERIOD,
} from './../Storage/RateLimiter.js'

export async function doCommandWithRateLimit(messageHook, desiredFunction) {
  const userId = messageHook.author.id

  updateRateLimitForUser(userId)

  if (hasUserExceededRateLimit(userId)) {
    await messageHook.reply(
      `You've exceeded the number of times (${OPERATIONS_PER_PERIOD}) you can do this over a ${RATE_LIMIT_TIMER_MINUTES} minute period, please try again in ${RATE_LIMIT_TIMER_MINUTES} minutes!`
    )
    return
  }

  return desiredFunction()
}
