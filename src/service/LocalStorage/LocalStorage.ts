import { TOKEN_KEY } from '../Consts/Consts';

export default class LocalStorage {
  public static getData(key: string = TOKEN_KEY) {
    return localStorage.getItem(key);
  }

  public static setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}
