import Redis from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL, {
  connectTimeout: 2000,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy(times) {
    return Math.min(times * 200, 2000)
  },
})

redis.on('error', () => {})

export async function connectRedis() {
  const reply = await redis.ping()
  if (reply !== 'PONG') throw new Error('Redis no respondió')
}
