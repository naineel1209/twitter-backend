import path from "path";
import winston from "winston";

const filePath = path.join(__dirname, "../../logs")

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
    winston.format.colorize({ all: true })
)

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
    winston.format.uncolorize()
)

const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    transports: [
        new winston.transports.Console({ format: consoleFormat }),
        new winston.transports.File({ filename: `${filePath}/errors.log`, level: 'error', format: fileFormat }),
        new winston.transports.File({ filename: `${filePath}/combined.log`, format: fileFormat })
    ]
})

export default logger;