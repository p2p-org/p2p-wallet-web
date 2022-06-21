/* eslint-disable no-console */
import PATH from 'path';

export enum LogEvent {
  error = '[‼️]',
  info = '[ℹ️]', // for guard & alert & route
  debug = '[💬]', // tested values & local notifications
  verbose = '[🔬]', // current values
  warning = '[⚠️]',
  severe = '[🔥]', // tokens & keys & init & deinit
  request = '[⬆️]',
  response = '[⬇️]',
  event = '[🎇]',
}

function getStackTrace() {
  const obj = { stack: '' };
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
}

export class Logger {
  /**
   * @param message This will be the debug message to appear on the debug console.
   * @param event Type of event as s of LogEvent enum.
   */
  static log(message: string, event: LogEvent, _apiMethod?: string) {
    const stack = getStackTrace();
    const matchstack = stack.match(/\(.*?\)/g) || []; // Get the contents of all parentheses in the call stack
    const line = matchstack[2] || ''; // The 0th call is let stack = getStackTrace() The 1st call stack is where log is called

    // TODO: find better ways to investigate file and line with source maps
    const fileAndLine = line.substring(line.lastIndexOf(PATH.sep) + 1, line.length - 1);

    console.log(`${new Date().toLocaleString()} ${event}[${fileAndLine}] -> ${message}`);
  }
}
