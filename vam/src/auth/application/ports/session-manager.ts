/**
 * Port: the signed-in state of the client making the current request
 * (a cookie session today; tokens would be another adapter).
 */
export abstract class SessionManager {
  /** Signs the user in on the current client. */
  abstract start(userId: string): Promise<void>;

  /** Signs the current client out. */
  abstract end(): Promise<void>;
}
