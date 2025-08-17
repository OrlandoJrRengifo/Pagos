export abstract class Handler {
  private next?: Handler;
  setNext<T extends Handler>(h: T): T { this.next = h; return h; }
  async handle(ctx: any): Promise<void> {
    await this.doHandle(ctx);
    if (this.next) await this.next.handle(ctx);
  }
  protected abstract doHandle(ctx: any): Promise<void>;
}
