
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

const PRODUCTION = import.meta.env.PROD
const MIN_LOG_LEVEL = PRODUCTION ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG

function shouldLog(level) {
  return level >= MIN_LOG_LEVEL
}

function formatLog(level, message, context = {}) {
  const timestamp = new Date().toISOString()
  const levelName = Object.keys(LOG_LEVELS).find((key) => LOG_LEVELS[key] === level)
  return {
    timestamp,
    level: levelName,
    message,
    context,
    env: PRODUCTION ? 'production' : 'development',
  }
}

function reportToMonitoring(level, message, context) {
  if (PRODUCTION && level >= LOG_LEVELS.ERROR) {
    // TODO: Integrate with Sentry or your error tracking service
    // Example: window.__SENTRY_INTEGRATION__?.captureException(new Error(message), { extra: context })
    console.error('[PRODUCTION ERROR]', message, context)
  }
}

export const logger = {
  debug(message, context = {}) {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      formatLog(LOG_LEVELS.DEBUG, message, context)
      console.debug('[DEBUG]', message, context)
    }
  },

  info(message, context = {}) {
    if (shouldLog(LOG_LEVELS.INFO)) {
      formatLog(LOG_LEVELS.INFO, message, context)
      console.info('[INFO]', message, context)
    }
  },

  warn(message, context = {}) {
    if (shouldLog(LOG_LEVELS.WARN)) {
      formatLog(LOG_LEVELS.WARN, message, context)
      console.warn('[WARN]', message, context)
      reportToMonitoring(LOG_LEVELS.WARN, message, context)
    }
  },

  error(message, error = null, context = {}) {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      const errorContext = {
        ...context,
        errorMessage: error?.message,
        errorStack: error?.stack,
      }
      formatLog(LOG_LEVELS.ERROR, message, errorContext)
      console.error('[ERROR]', message, errorContext)
      reportToMonitoring(LOG_LEVELS.ERROR, message, errorContext)
    }
  },

  cacheError(operation, subjectId, error) {
    this.warn(`Cache ${operation} failed for subject ${subjectId}`, {
      operation,
      subjectId,
      errorMessage: error?.message,
      errorType: error?.name,
    })
  },
}
