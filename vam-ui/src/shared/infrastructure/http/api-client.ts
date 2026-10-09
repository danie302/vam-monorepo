import { readServerSentEvents, type ServerSentEvent } from './server-sent-events.ts';

/** The API answered with an error status. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** The API could not be reached (down, offline, CORS). */
export class NetworkError extends Error {
  constructor() {
    super('Could not reach the server');
    this.name = 'NetworkError';
  }
}

/**
 * Small `fetch` wrapper for the VAM API. Sends the session cookie on every
 * request (`credentials: 'include'`): the API lives on another origin.
 */
export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  /**
   * POSTs `body` and reads the answer as Server-Sent Events. An error status
   * throws before the first event; aborting `signal` stops the stream (the
   * read throws an `AbortError`).
   */
  async *stream(
    path: string,
    body: unknown,
    signal?: AbortSignal,
  ): AsyncGenerator<ServerSentEvent> {
    const response = await this.send('POST', path, body, signal);
    if (!response.body) return;
    yield* readServerSentEvents(response.body);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const response = await this.send(method, path, body);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  /** Sends the request; throws `NetworkError` or `ApiError` unless it is a 2xx. */
  private async send(
    method: string,
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        credentials: 'include',
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new NetworkError();
    }

    if (!response.ok) {
      throw new ApiError(response.status, await errorMessage(response));
    }
    return response;
  }
}

/** Nest's error body is `{ message: string | string[] }`. */
async function errorMessage(response: Response): Promise<string> {
  try {
    const { message } = (await response.json()) as { message?: unknown };
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  } catch {
    // Not JSON: fall back to the status text.
  }
  return response.statusText;
}
