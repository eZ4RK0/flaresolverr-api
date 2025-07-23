/**
 * Status de succès des réponses API
 */
export enum Status {
  OK = 'ok',
  ERROR = 'error'
}

/**
 * Liste des routes/commandes supportées par l'API FlareSolverr.
 */
export enum Routes {
  /** Crée une nouvelle session navigateur persistante. */
  CreateSession = 'sessions.create',
  /** Liste toutes les sessions actives. */
  ListSessions = 'sessions.list',
  /** Détruit une session existante. */
  DestroySession = 'sessions.destroy',
  /** Effectue une requête GET via le navigateur. */
  RequestGet = 'request.get',
  /** Effectue une requête POST via le navigateur. */
  RequestPost = 'request.post'
}

/**
 * Paramètres de proxy pour les requêtes ou sessions.
 */
interface Proxy {
  /** URL complète du proxy (ex: http://127.0.0.1:8888). */
  url: string;
  /** Nom d'utilisateur pour l'authentification proxy (optionnel). */
  username?: string;
  /** Mot de passe pour l'authentification proxy (optionnel). */
  password?: string;
}

/**
 * Représente un cookie du navigateur.
 */
interface Cookie {
  /** Nom du cookie. */
  name: string;
  /** Valeur du cookie. */
  value: string;
  /** Domaine du cookie (optionnel). */
  domain?: string;
  /** Chemin du cookie (optionnel). */
  path?: string;
  /** Date d'expiration (timestamp, optionnel). */
  expiry?: number;
  /** Indique si le cookie est httpOnly (optionnel). */
  httpOnly?: boolean;
  /** Indique si le cookie est sécurisé (optionnel). */
  secure?: boolean;
  /** Politique SameSite (optionnel). */
  sameSite?: 'None' | 'Lax' | 'Strict';
}

//# Requests

/**
 * Base commune à toutes les requêtes v1 (POST /v1).
 */
interface V1RequestBase {
  /** Commande à exécuter (sessions.create, request.get, etc). */
  cmd: Routes;
  /** Timeout maximum en ms pour résoudre le challenge (optionnel, défaut 60000). */
  maxTimeout?: number;
}

/**
 * Requête pour créer une session navigateur persistante.
 */
interface V1Request_CreateSession extends V1RequestBase {
  /** Commande sessions.create. */
  cmd: Routes.CreateSession;
  /** ID de session souhaité (optionnel, généré sinon). */
  session?: string;
  /** Proxy à utiliser pour cette session (optionnel). */
  proxy?: Proxy;
}

/**
 * Requête pour lister toutes les sessions actives.
 */
interface V1Request_ListSessions extends V1RequestBase {
  /** Commande sessions.list. */
  cmd: Routes.ListSessions;
}

/**
 * Requête pour détruire une session existante.
 */
interface V1Request_DestroySession extends V1RequestBase {
  /** Commande sessions.destroy. */
  cmd: Routes.DestroySession;
  /** ID de la session à détruire. */
  session: string;
}

/**
 * Base pour les requêtes GET/POST via le navigateur.
 */
interface V1Request_RequestBase extends V1RequestBase {
  /** URL cible à charger. */
  url: string;
  /** Session à utiliser (optionnel, sinon temporaire). */
  session?: string;
  /** TTL de la session en minutes (optionnel). */
  session_ttl_minutes?: number;
  /** Cookies à injecter dans le navigateur. */
  cookies?: Cookie[];
  /** Si true, ne retourne que les cookies. */
  returnOnlyCookies?: boolean;
  /** Proxy à utiliser pour cette requête (optionnel). */
  proxy?: Proxy;
}

/**
 * Requête GET via le navigateur (POST /v1, cmd: request.get).
 */
interface V1Request_RequestGet extends V1Request_RequestBase {
  cmd: Routes.RequestGet;
}

/**
 * Requête POST via le navigateur (POST /v1, cmd: request.post).
 */
interface V1Request_RequestPost extends V1Request_RequestBase {
  /** Commande request.post. */
  cmd: Routes.RequestPost;
  /** Données */
  postData: { name: string; value: string }[]; //! Must be converted to string (name=value&name2=value2)
}

/**
 * Index des types de requêtes.
 */
export interface V1RequestIndex {
  [Routes.CreateSession]: V1Request_CreateSession;
  [Routes.ListSessions]: V1Request_ListSessions;
  [Routes.DestroySession]: V1Request_DestroySession;
  [Routes.RequestGet]: V1Request_RequestGet;
  [Routes.RequestPost]: V1Request_RequestPost;
}

/**
 * Requête via le navigateur (POST /v1).
 */
export type V1Request = V1RequestIndex[Routes];

//# Responses

/**
 * Réponse de l'endpoint /index (GET /).
 * Fournit un message de statut, la version et le user-agent utilisé.
 */
export interface IndexResponse {
  /** Message ou d'état. */
  msg: string;
  /** Version de FlareSolverr. */
  version: string;
  /** User-Agent utilisé par le navigateur Selenium. */
  userAgent: string;
}

/**
 * Réponse de l'endpoint /health (GET /health).
 * Indique si le service est opérationnel.
 */
export interface HealthResponse {
  /** Statut de santé, toujours 'ok'. */
  status: Status.OK;
}

/**
 * Base commune à toutes les réponses (POST /v1).
 */
interface V1ResponseBase {
  /** Message d'information ou d'erreur. */
  message: string;
  /** Timestamp de début de traitement (ms). */
  startTimestamp: number;
  /** Timestamp de fin de traitement (ms). */
  endTimestamp: number;
  /** Version de FlareSolverr. */
  version: string;
}

/**
 * Réponse avec statut OK (hérite de V1ResponseBase).
 */
interface V1ResponseOk extends V1ResponseBase {
  /** Statut de succès. */
  status: Status.OK;
}

/**
 * Réponse avec statut ERROR (hérite de V1ResponseBase).
 */
export interface V1ResponseError extends V1ResponseBase {
  /** Statut d'erreur. */
  status: Status.ERROR;
}

//TODO: Ajouter dans la class isNew pour replacer le message
/**
 * Réponse à la création de session (sessions.create).
 * Message indique si la session existait déjà ou a été créée.
 */
interface V1Response_CreateSession extends V1ResponseOk {
  /** Message de retour. */
  message: 'Session already exists.' | 'Session created successfully.';
  /** ID de la session créée ou existante. */
  session: string;
}

/**
 * Réponse à la liste des sessions (sessions.list).
 */
interface V1Response_ListSessions extends V1ResponseOk {
  /** Message vide. */
  message: '';
  /** Liste des IDs de sessions actives. */
  sessions: string[];
}

/**
 * Réponse à la destruction de session (sessions.destroy).
 */
interface V1Response_DestroySession extends V1ResponseOk {
  /** Message de confirmation. */
  message: 'The session has been removed.';
}

/**
 * Réponse à une requête GET (request.get).
 * Le champ solution contient le résultat du challenge ou de la navigation.
 */
interface V1Response_ResponseGet<CookiesOnly extends boolean = false> extends V1ResponseOk {
  /** Message selon la détection du challenge. */
  message: 'Challenge solved!' | 'Challenge not detected!';
  /** Résultat de la navigation/challenge (toujours présent si status ok). */
  solution: {
    /** URL finale après redirections éventuelles. */
    url: string;
    /** Code de statut HTTP. */
    status: number;
    /** En-têtes HTTP. */
    headers: CookiesOnly extends false ? Record<string, string | undefined> : undefined;
    /** HTML complet de la page. */
    response: CookiesOnly extends false ? string : undefined;
    /** Cookies extraits du navigateur. */
    cookies: Cookie[];
    /** User-Agent utilisé. */
    userAgent: string;
  };
}

/**
 * Réponse à une requête POST (request.post).
 */
interface V1Response_ResponsePost<CookiesOnly extends boolean = false> extends V1Response_ResponseGet<CookiesOnly> {}

/**
 * Index des types de réponses.
 */
export interface V1ResponseIndex<OnlyCookies extends boolean = false> {
  [Routes.CreateSession]: V1Response_CreateSession;
  [Routes.ListSessions]: V1Response_ListSessions;
  [Routes.DestroySession]: V1Response_DestroySession;
  [Routes.RequestGet]: V1Response_ResponseGet<OnlyCookies>;
  [Routes.RequestPost]: V1Response_ResponsePost<OnlyCookies>;
}

/**
 * Réponse d'une requête via le navigateur (POST /v1).
 */
export type V1Response = V1ResponseIndex[Routes];
