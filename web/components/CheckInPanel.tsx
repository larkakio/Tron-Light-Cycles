'use client';

import { useEffect } from 'react';
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { readContractQueryOptions } from 'wagmi/query';
import { useQueryClient } from '@tanstack/react-query';
import { config } from '@/lib/wagmi/config';
import { CHECK_IN_ADDRESS, checkInAbi } from '@/lib/contracts/checkIn';

const ZERO = '0x0000000000000000000000000000000000000000';

export function CheckInPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const queryClient = useQueryClient();
  const hasContract =
    CHECK_IN_ADDRESS.toLowerCase() !== ZERO.toLowerCase();

  const { data: currentDay } = useReadContract({
    address: CHECK_IN_ADDRESS,
    abi: checkInAbi,
    functionName: 'currentDay',
    chainId: base.id,
    query: { enabled: hasContract },
  });

  const { data: lastDay } = useReadContract({
    address: CHECK_IN_ADDRESS,
    abi: checkInAbi,
    functionName: 'lastCheckInDay',
    args: address ? [address] : undefined,
    chainId: base.id,
    query: { enabled: hasContract && !!address },
  });

  const { data: streak } = useReadContract({
    address: CHECK_IN_ADDRESS,
    abi: checkInAbi,
    functionName: 'streak',
    args: address ? [address] : undefined,
    chainId: base.id,
    query: { enabled: hasContract && !!address },
  });

  const {
    writeContractAsync,
    data: hash,
    isPending,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isSuccess || !address) return;
    queryClient.invalidateQueries({
      queryKey: readContractQueryOptions(config, {
        address: CHECK_IN_ADDRESS,
        abi: checkInAbi,
        functionName: 'lastCheckInDay',
        args: [address],
        chainId: base.id,
      }).queryKey,
    });
    queryClient.invalidateQueries({
      queryKey: readContractQueryOptions(config, {
        address: CHECK_IN_ADDRESS,
        abi: checkInAbi,
        functionName: 'streak',
        args: [address],
        chainId: base.id,
      }).queryKey,
    });
    reset();
  }, [isSuccess, address, queryClient, reset]);

  const alreadyChecked =
    currentDay !== undefined &&
    lastDay !== undefined &&
    lastDay >= currentDay;

  async function handleCheckIn() {
    if (!isConnected || !hasContract) return;
    const baseId = base.id;
    if (chainId !== baseId) {
      await switchChainAsync({ chainId: baseId });
    }
    await writeContractAsync({
      address: CHECK_IN_ADDRESS,
      abi: checkInAbi,
      functionName: 'checkIn',
      chainId: baseId,
    });
  }

  const disabled =
    !isConnected ||
    !hasContract ||
    alreadyChecked ||
    isPending ||
    isConfirming ||
    isSwitching;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-[10px] text-gray-400 sm:text-xs">
        {hasContract && isConnected ? (
          <>
            Streak:{' '}
            <span className="text-cyan-300">{streak?.toString() ?? '0'}</span>{' '}
            days
          </>
        ) : (
          <span>On-chain daily sync on Base</span>
        )}
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={handleCheckIn}
        className="rounded border border-[var(--magenta)]/50 bg-[var(--magenta)]/10 px-3 py-2 font-[family-name:var(--font-orbitron)] text-[10px] font-semibold uppercase tracking-widest text-[var(--magenta)] disabled:opacity-40 sm:text-xs"
      >
        {!hasContract
          ? 'Sync unavailable'
          : !isConnected
            ? 'Connect to sync'
            : alreadyChecked
              ? 'Synced today'
              : isPending || isSwitching
                ? 'Confirm in wallet…'
                : isConfirming
                  ? 'Syncing…'
                  : 'Daily grid sync'}
      </button>
    </div>
  );
}
