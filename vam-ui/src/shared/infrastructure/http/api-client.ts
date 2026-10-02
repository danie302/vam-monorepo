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

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        credentials: 'include',
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new NetworkError();
    }

    if (!response.ok) {
      throw new ApiError(response.status, await errorMessage(response));
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
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
