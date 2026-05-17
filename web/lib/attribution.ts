import { Attribution } from 'ox/erc8021';

/** Builder Code from base.dev → Settings → Builder Code */
export const BUILDER_CODE =
  process.env.NEXT_PUBLIC_BUILDER_CODE ?? 'bc_4wwccvuz';

/**
 * ERC-8021 data suffix appended to transactions (wagmi `dataSuffix` on config).
 * Use NEXT_PUBLIC_BUILDER_CODE_SUFFIX only if you need a pre-encoded override.
 * @see https://docs.base.org/apps/builder-codes/app-developers
 */
export const DATA_SUFFIX = (process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX ??
  Attribution.toDataSuffix({ codes: [BUILDER_CODE] })) as `0x${string}`;
