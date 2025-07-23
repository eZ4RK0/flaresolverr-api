import axios, { AxiosError, type AxiosInstance } from 'axios';
import {
  HealthResponse,
  IndexResponse,
  Routes,
  V1Request,
  V1RequestIndex,
  V1ResponseError,
  V1ResponseIndex
} from './types';
import { SessionsManager } from './sessionsManager';

type OmitSelfManagedData<T extends V1Request> = Omit<T, 'cmd'>;

export class FlareSolverrClient {
  private client: AxiosInstance;

  /**
   * Creates a new instance of the FlareSolverrClient class.
   * @param baseURL Base URL of the FlareSolverr API.
   * @param maxTimeout Maximum timeout for requests in milliseconds (default: 60000).
   * @throws Error if the baseURL is invalid.
   */
  constructor(baseURL: string, private maxTimeout: number = 60000) {
    this.client = axios.create({ baseURL });
  }

  /**
   * Centralized handler for FlareSolverr API errors.
   */
  private handleApiError(error: unknown): never {
    if (error instanceof AxiosError && error.response) {
      const apiError = error.response.data as V1ResponseError;
      throw new Error(
        `[FlareSolverr Error] ${apiError.status}: ${apiError.message || 'Unknown error'}\n-> Start at: ${new Date(
          apiError.startTimestamp
        ).toString()}\n-> End at: ${new Date(apiError.endTimestamp).toString()}\n-> Version: ${apiError.version}`
      );
    } else if (error instanceof Error) {
      throw new Error(`[FlareSolverr Error] ${error.message || 'Unknown error'}`);
    } else {
      throw error;
    }
  }

  /**
   * Sends a POST request to the /v1 endpoint with the specified command and associated data.
   * Centralizes the management of FlareSolverr v1 commands.
   */
  private async handleV1Request<Route extends Routes>(
    cmd: Route,
    data: OmitSelfManagedData<V1RequestIndex[Route]>
  ): Promise<V1ResponseIndex[Route] | never> {
    try {
      const res = await this.client.post<V1ResponseIndex[Route]>('/v1', {
        cmd,
        maxTimeout: data.maxTimeout ?? this.maxTimeout,
        ...data
      });
      return res.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Retrieves FlareSolverr version information and user-agent.
   * Endpoint: GET /
   * @returns IndexResponse containing the message, version, and user-agent.
   * @throws Formatted error if the API returns an error.
   */
  public async index(): Promise<IndexResponse> {
    try {
      return (await this.client.get<IndexResponse>('/')).data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Checks the health of the FlareSolverr service.
   * Endpoint: GET /health
   * @returns HealthResponse with the status.
   * @throws Formatted error if the API returns an error.
   */
  public async health(): Promise<HealthResponse> {
    try {
      return (await this.client.get<HealthResponse>('/health')).data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Creates a persistent browser session.
   * Endpoint: POST /v1 (cmd: sessions.create)
   * @param data Session creation data (V1RequestIndex[Routes.CreateSession] exempt of cmd).
   * @returns V1ResponseIndex[Routes.CreateSession] with the session ID and message
   * @throws Formatted error if the API returns an error.
   */
  public async createSession(
    data?: OmitSelfManagedData<V1RequestIndex[Routes.CreateSession]>
  ): Promise<V1ResponseIndex[Routes.CreateSession]>;

  /**
   * Creates a persistent browser session.
   * Endpoint: POST /v1 (cmd: sessions.create)
   * @param data Session creation data (V1RequestIndex[Routes.CreateSession] exempt of cmd) and session TTL
   * @param wrapManager If true, returns a SessionsManager instance. If false, returns the response.
   * @returns A SessionsManager instance.
   * @throws Formatted error if the API returns an error.
   */
  public async createSession(
    data?: OmitSelfManagedData<V1RequestIndex[Routes.CreateSession]> & { ttl?: number },
    wrapManager?: true
  ): Promise<SessionsManager>;

  public async createSession(
    data: OmitSelfManagedData<V1RequestIndex[Routes.CreateSession]> & { ttl?: number } = {},
    wrapManager?: boolean
  ): Promise<V1ResponseIndex[Routes.CreateSession] | SessionsManager> {
    const { ttl, ...restData } = data;
    const res = await this.handleV1Request(Routes.CreateSession, restData);
    return wrapManager || ttl ? new SessionsManager(res.session, this, ttl) : res;
  }

  /**
   * Lists all active sessions.
   * Endpoint: POST /v1 (cmd: sessions.list)
   * @param data Request data (V1RequestIndex[Routes.ListSessions] exempt of cmd)
   * @returns V1ResponseIndex[Routes.ListSessions] with the list of active sessions.
   * @throws Formatted error if the API returns an error.
   */
  public async listSessions(
    data: OmitSelfManagedData<V1RequestIndex[Routes.ListSessions]> = {}
  ): Promise<V1ResponseIndex[Routes.ListSessions]> {
    return this.handleV1Request(Routes.ListSessions, data);
  }

  /**
   * Destroys an existing session.
   * Endpoint: POST /v1 (cmd: sessions.destroy)
   * @param data Request data (V1RequestIndex[Routes.DestroySession] exempt of cmd)
   * @returns V1ResponseIndex[Routes.DestroySession] with the confirmation message.
   * @throws Formatted error if the API returns an error.
   */
  public async destroySession(
    data: OmitSelfManagedData<V1RequestIndex[Routes.DestroySession]>
  ): Promise<V1ResponseIndex[Routes.DestroySession]> {
    return this.handleV1Request(Routes.DestroySession, data);
  }

  /**
   * Performs a GET request via the browser.
   * Endpoint: POST /v1 (cmd: request.get)
   * @param data Request data (V1RequestIndex[Routes.RequestGet] exempt of cmd)
   * @returns V1ResponseIndex[Routes.RequestGet] with the challenge or navigation result.
   * @throws Formatted error if the API returns an error.
   */
  public async requestGet(
    data: OmitSelfManagedData<V1RequestIndex[Routes.RequestGet]>
  ): Promise<V1ResponseIndex[Routes.RequestGet]> {
    return this.handleV1Request(Routes.RequestGet, data);
  }

  /**
   * Performs a POST request via the browser.
   * Endpoint: POST /v1 (cmd: request.post)
   * @param data Request data (V1RequestIndex[Routes.RequestPost] exempt of cmd)
   * @returns V1ResponseIndex[Routes.RequestPost] with the challenge or navigation result.
   * @throws Formatted error if the API returns an error.
   */
  public async requestPost(
    data: OmitSelfManagedData<V1RequestIndex[Routes.RequestPost]>
  ): Promise<V1ResponseIndex[Routes.RequestPost]> {
    return this.handleV1Request(Routes.RequestPost, data);
  }
}

export * from './types';
export { SessionsManager } from './sessionsManager';
