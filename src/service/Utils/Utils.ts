// tslint:disable:no-any
import * as moment from 'moment';
import { DATE_FORMAT } from '../Consts/Consts';

export function promiseTimesout(ms: number, promise: Promise<any>) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
    promise.then(resolve, reject);
  });
}

export function timeFromUnixToFormat(date: number, format: string = DATE_FORMAT): string {
  return date !== 0 ? moment.unix(date).utc().format(format) : date.toString();
}
