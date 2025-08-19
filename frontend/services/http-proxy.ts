// PATRÓN ESTRUCTURAL: Proxy
// Centraliza las llamadas HTTP manejando autenticación, logs y errores

export class HttpProxy {
  private base: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl?: string) {
    const env = process.env.NEXT_PUBLIC_API_URL;
    // Normaliza (sin barra final)
    this.base = (env || baseUrl || 'http://localhost:3001').replace(/\/+$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private buildUrl(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${this.base}${p}`;
  }

  private async makeRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = this.buildUrl(path);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[HTTP Proxy] ${options.method ?? 'GET'} ${url}`);
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(options.headers ?? {}),
      },
      // Evita cache de Next durante desarrollo
      cache: 'no-store',
    });

    if (!res.ok) {
      let body = '';
      try {
        body = await res.text();
      } catch {}
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${body}`);
    }

    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) {
      return (await res.text()) as unknown as T;
    }
    return (await res.json()) as T;
  }

  get<T>(path: string) {
    return this.makeRequest<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: unknown) {
    return this.makeRequest<T>(path, {
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown) {
    return this.makeRequest<T>(path, {
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string) {
    return this.makeRequest<T>(path, { method: 'DELETE' });
  }
}

// Instancia singleton del proxy
export const httpProxy = new HttpProxy();
