import { debounce } from 'lodash';
import { Routes, V1Request, V1RequestIndex, V1ResponseIndex } from './types';
import { FlareSolverrClient } from './index';

type OmitSelfManagedData<T extends V1Request> = Omit<T, 'cmd' | 'session'>;

type FlareSolverrClientType = InstanceType<typeof FlareSolverrClient>;

export class SessionManager {
  private _isDestroyed = false;
  private resetDebounce: ReturnType<typeof debounce> | null = null;

  /**
   * Creates a new instance of the SessionsManager class.
   * @param sessionId Unique identifier for the session.
   * @param flareSolverr Instance of FlareSolverrClient to manage requests.
   * @param ttl Time to live for the session in seconds (debounced time). If not provided, the session will not be destroyed automatically.
   * If ttl is 0 or Infinity, the session will not be destroyed automatically.
   * @returns A new instance of SessionsManager.
   * @throws Error if ttl is a negative number.
   */
  constructor(private sessionId: string, private flareSolverr: FlareSolverrClient, ttl?: number) {
    if (ttl) {
      if (ttl < 0) throw new Error('TTL must be a positive number');
      if (ttl == 0 || ttl == Infinity) return; // No debounce
      this.resetDebounce = debounce(this.destroy.bind(this), ttl * 1000);
    }
  }

  public get isDestroyed(): boolean {
    return this._isDestroyed;
  }

  /**
   * Destroys this session.
   * Endpoint: POST /v1 (cmd: sessions.destroy)
   * @param data Request data (V1RequestIndex[Routes.DestroySession] exempt of cmd and session)
   * @returns V1ResponseIndex[Routes.DestroySession] with the confirmation message.
   * @throws Formatted error if the API returns an error.
   */
  public async destroy(
    data?: OmitSelfManagedData<V1RequestIndex[Routes.DestroySession]>
  ): ReturnType<FlareSolverrClientType['destroySession']> {
    if (this._isDestroyed) throw new Error('Session already destroyed');
    this.resetDebounce?.();
    const res = await this.flareSolverr.destroySession({ ...data, session: this.sessionId });
    this._isDestroyed = true;
    return res;
  }

  /**
   * Performs a GET request via the browser's session.
   * Endpoint: POST /v1 (cmd: request.get)
   * @param data Request data (V1RequestIndex[Routes.RequestGet] exempt of cmd and session)
   * @returns V1ResponseIndex[Routes.RequestGet] with the challenge or navigation result.
   * @throws Formatted error if the API returns an error.
   */
  public async requestGet<OnlyCookies extends boolean = false>(
    data: OmitSelfManagedData<V1RequestIndex[Routes.RequestGet]> & { returnOnlyCookies?: OnlyCookies }
  ): Promise<V1ResponseIndex<OnlyCookies>[Routes.RequestGet]> {
    if (this._isDestroyed) throw new Error('Session already destroyed');
    this.resetDebounce?.();
    return this.flareSolverr.requestGet<OnlyCookies>({ ...data, session: this.sessionId });
  }

  /**
   * Performs a POST request via the browser's session.
   * Endpoint: POST /v1 (cmd: request.post)
   * @param data Request data (V1RequestIndex[Routes.RequestPost] exempt of cmd and session)
   * @returns V1ResponseIndex[Routes.RequestPost] with the challenge or navigation result.
   * @throws Formatted error if the API returns an error.
   */
  public async requestPost<OnlyCookies extends boolean = false>(
    data: OmitSelfManagedData<V1RequestIndex[Routes.RequestPost]> & { returnOnlyCookies?: OnlyCookies }
  ): Promise<V1ResponseIndex<OnlyCookies>[Routes.RequestPost]> {
    if (this._isDestroyed) throw new Error('Session already destroyed');
    this.resetDebounce?.();
    return this.flareSolverr.requestPost<OnlyCookies>({ ...data, session: this.sessionId });
  }
}
