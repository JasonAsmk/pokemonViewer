import { Injectable } from '@angular/core';
import { Logger } from './logger';

@Injectable({
  providedIn: 'root',
})
export class LogFactory {
  private _loggers = new Map<string, Logger>();

  public getLogger(name: string) {
    const logger = this._loggers.get(name);
    if (logger) {
      return logger;
    } else {
      const namedLogger = new Logger(name);
      this._loggers.set(name, namedLogger);
      return namedLogger;
    }
  }
}
