import { Injectable } from '@angular/core';
import { Logger } from './logger';

@Injectable({
  providedIn: 'root',
})
export class LogFactory extends Logger {
  private _loggers = new Map<string, Logger>();

  public getLogger(name: string) {
    if (this._loggers.get(name)) {
      return this._loggers.get(name);
    } else {
      const namedLogger = new Logger(name);
      this._loggers.set(name, namedLogger);
      return namedLogger;
    }
  }
}
