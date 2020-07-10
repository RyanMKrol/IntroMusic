export const RATE_LIMIT_TIMER_MINUTES = 5
export const OPERATIONS_PER_PERIOD = 5

let rateLimitData = {}

setInterval(function () {
  rateLimitData = {}
}, 1000 * 60 * RATE_LIMIT_TIMER_MINUTES)

export function updateRateLimitForUser(userId) {
  if (rateLimitData[userId]) {
    rateLimitData[userId] += 1
  } else {
    rateLimitData[userId] = 1
  }
}

export function hasUserExceededRateLimit(userId) {
  return rateLimitData[userId] > OPERATIONS_PER_PERIOD
}
