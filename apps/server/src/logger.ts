import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Define a custom format for the log output with colors and labels
const customFormat = printf(({ level, message, timestamp, id, ...meta }) => {
  const idString = id ? ` (${id})` : '';
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}]${idString}: ${message}${metaString}`;
});

const logger = createLogger({
  level: LOG_LEVEL,
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    customFormat,
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

export function log(level: string, message: string, id?: string, meta = {}) {
  logger.log(level, message, { id, ...meta });
}

log('info', `Configured with LOG_LEVEL=${LOG_LEVEL}`);
