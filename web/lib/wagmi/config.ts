import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { baseAccount, injected } from 'wagmi/connectors';
import { DATA_SUFFIX } from '@/lib/attribution';

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected(),
    baseAccount({
      appName: 'Tron Light Cycles',
    }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  dataSuffix: DATA_SUFFIX,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
