import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { baseAccount, injected } from 'wagmi/connectors';
import { Attribution } from 'ox/erc8021';

const builderCode =
  process.env.NEXT_PUBLIC_BUILDER_CODE ?? 'bc_placeholder';

const dataSuffix = (process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX ??
  Attribution.toDataSuffix({ codes: [builderCode] })) as `0x${string}`;

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
  dataSuffix,
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
