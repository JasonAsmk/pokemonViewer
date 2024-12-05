enum LogLevel {
  LOG,
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

export class Logger {
  constructor(private _name: string) {}

  public log(message?: any) {
    this.sendLog(LogLevel.LOG, message);
  }

  public debug(message?: any) {
    this.sendLog(LogLevel.DEBUG, message);
  }

  public info(message?: any) {
    this.sendLog(LogLevel.INFO, message);
  }

  public warn(message?: any) {
    this.sendLog(LogLevel.WARN, message);
  }

  public error(message?: any) {
    this.sendLog(LogLevel.ERROR, message);
  }

  private sendLog(level: LogLevel, message: string) {
    // this could be replace here with a possibly an api call to a backend
    // for now we just console
    const formatted = this.formatMessage(message);
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.LOG:
      default:
        console.log(formatted);
    }
  }

  private formatMessage(message: string) {
    return `${new Date().toISOString()}` + `|${this._name}: ` + message;
  }
}
