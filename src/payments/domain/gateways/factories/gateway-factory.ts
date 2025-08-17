import { Injectable } from '@nestjs/common';
import { PaymentProviderFactory } from '../provider-factory'; // crea esta interfaz si la usas (opcional)

@Injectable()
export class GatewayFactory {
  private map = new Map<string, PaymentProviderFactory>();

  register(factory: PaymentProviderFactory) {
    this.map.set(factory.providerName, factory);
  }

  getFactory(providerName: string): PaymentProviderFactory {
    const f = this.map.get(providerName);
    if (!f) throw new Error(`Proveedor no registrado: ${providerName}`);
    return f;
  }

  listProviders(): string[] {
    return Array.from(this.map.keys());
  }
}
