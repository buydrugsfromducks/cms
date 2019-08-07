import * as fetch from 'isomorphic-fetch';
import { promiseTimesout } from '../Utils/Utils';

export default class Transport {
  private static timeout: number = 10000;

  public static response(url: string, method: string, headers?: Headers, body?: object | FormData): Promise<any> {
    return promiseTimesout(
      Transport.timeout,
      fetch(url, {method, headers, body: body instanceof FormData ? body : JSON.stringify(body), credentials: 'same-origin'}),
    );
  }
  
  public static get(url: string, headers?: Headers, body?: object): Promise<any> {
    return Transport.response(url, 'GET', headers, body );
  }
  
  public static post(url: string, headers?: Headers, body?: object): Promise<any> {
    return Transport.sendWithData('POST', url, headers, body);
  }
  
  public static put(url: string, headers?: Headers, body?: object): Promise<any> {
    return Transport.sendWithData('PUT', url, headers, body);
  }
  
  public static delete(url: string, headers?: Headers, body?: object): Promise<any> {
    return Transport.sendWithData('DELETE', url, headers, body);
  }
  
  protected static sendWithData(method: string, url: string, headers?: Headers, body?: object): Promise<any> {
    return Transport.response(url, method, headers, body);
  }
}
