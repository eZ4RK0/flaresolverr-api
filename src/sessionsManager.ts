import { debounce } from 'lodash';
import { Routes, V1Request, V1RequestIndex } from './types';
import { FlareSolverrClient } from './index';

type OmitSelfManagedData<T extends V1Request> = Omit<T, 'cmd' | 'session'>;

type FlareSolverrClientType = InstanceType<typeof FlareSolverrClient>;

export class SessionsManager {
  private isDestroyed = false;

  /**
   * Creates a new instance of the SessionsManager class.
   * @param sessionId Unique identifier for the session.
   * @param flareSolverr Instance of FlareSolverrClient to manage requests.
   * @param tll Time to live for the session in seconds (debounced time). If not provided, the session will not be destroyed automatically.
   * If tll is 0 or Infinity, the session will not be destroyed automatically.
   * @returns A new instance of SessionsManager.
   * @throws Error if tll is a negative number.
   */
  constructor(private sessionId: string, private flareSolverr: FlareSolverrClient, tll?: number) {
    if (tll) {
      if (tll < 0) throw new Error('TTL must be a positive number');
      if (tll == 0 || tll == Infinity) return; // No debounce
      debounce(this.destroy.bind(this), tll * 1000);
    }
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
    if (this.isDestroyed) throw new Error('Session already destroyed');
    const res = await this.flareSolverr.destroySession({ ...data, session: this.sessionId });
    this.isDestroyed = true;
    return res;
  }

  /**
   * Performs a GET request via the browser's session.
   * Endpoint: POST /v1 (cmd: request.get)
   * @param data Request data (V1RequestIndex[Routes.RequestGet] exempt of cmd and session)
   * @returns V1ResponseIndex[Routes.RequestGet] with the challenge or navigation result.
   * @throws Formatted error if the API returns an error.
   */
  public async requestGet(
    data: OmitSelfManagedData<V1RequestIndex[Routes.RequestGet]>
  ): ReturnType<FlareSolverrClientType['requestGet']> {
    if (this.isDestroyed) throw new Error('Session already destroyed');
    return this.flareSolverr.requestGet({ ...data, session: this.sessionId });
  }

  /**
   * Performs a POST request via the browser's session.
   * Endpoint: POST /v1 (cmd: request.post)
   * @param data Request data (V1RequestIndex[Routes.RequestPost] exempt of cmd and session)
   * @returns V1ResponseIndex[Routes.RequestPost] with the challenge or navigation result.
   * @throws Formatted error if the API returns an error.
   */
  public async requestPost(
    data: OmitSelfManagedData<V1RequestIndex[Routes.RequestPost]>
  ): ReturnType<FlareSolverrClientType['requestPost']> {
    if (this.isDestroyed) throw new Error('Session already destroyed');
    return this.flareSolverr.requestPost({ ...data, session: this.sessionId });
  }
}
