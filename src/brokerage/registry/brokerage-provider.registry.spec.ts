import { BrokerageProviderRegistry } from './brokerage-provider.registry';

describe('BrokerageProviderRegistry', () => {
  it('registers and returns provider', () => {
    const registry = new BrokerageProviderRegistry();
    const provider = { getAuthType: jest.fn() } as any;
    registry.registerProvider('demo', provider);
    expect(registry.getProvider('demo')).toBe(provider);
  });

  it('throws for unknown provider', () => {
    const registry = new BrokerageProviderRegistry();
    expect(() => registry.getProvider('missing')).toThrow(/not found/i);
  });
});
