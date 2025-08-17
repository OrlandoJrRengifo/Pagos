export interface WebhookHandler {
  verify(headers: Record<string,string>, body: any): Promise<{ ok: boolean; event?: string; ref?: string; raw?: any }>;
  handleEvent(event: any): Promise<void>;
}
