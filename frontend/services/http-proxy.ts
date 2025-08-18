// PATRÓN ESTRUCTURAL: Proxy
// Centraliza las llamadas HTTP manejando autenticación, logs y errores
export class HttpProxy {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`

    // Log de la petición
    console.log(`[HTTP Proxy] ${options.method || "GET"} ${fullUrl}`)

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`[HTTP Proxy] Response:`, data)
      return data
    } catch (error) {
      console.error(`[HTTP Proxy] Error:`, error)
      throw error
    }
  }

  async get<T>(url: string): Promise<T> {
    return this.makeRequest<T>(url, { method: "GET" })
  }

  async post<T>(url: string, data: any): Promise<T> {
    return this.makeRequest<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

// Instancia singleton del proxy
export const httpProxy = new HttpProxy()
