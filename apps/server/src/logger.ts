import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Define a custom format for the log output with colors and labels
const customFormat = printf(({ level, message, timestamp, ...meta }) => {
  const { playerId } = meta;
  if (playerId) {
    delete meta.playerId;
  }
  const playerIdString = playerId ? `(${playerId}) ` : '';
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} ${playerIdString}[${level}]: ${message}${metaString}`;
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

export function log(
  level: string,
  message: string,
  playerId?: string,
  meta = {},
) {
  logger.log(level, message, { playerId, ...meta });
}

log('info', `Configured with LOG_LEVEL=${LOG_LEVEL}`);
