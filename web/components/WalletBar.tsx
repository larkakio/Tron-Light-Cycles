'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from 'wagmi';
import { base } from 'wagmi/chains';

export function WalletBar() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const wrongNetwork = isConnected && chainId !== base.id;

  const sheet =
    mounted && sheetOpen
      ? createPortal(
          <ConnectSheet
            connectors={connectors}
            isPending={isPending || isConnecting}
            onConnect={(connector) => {
              connect({ connector, chainId: base.id });
              setSheetOpen(false);
            }}
            onClose={() => setSheetOpen(false)}
          />,
          document.body,
        )
      : null;

  return (
    <>
      {wrongNetwork && (
        <div className="mb-2 rounded-lg border border-amber-500/50 bg-amber-950/40 px-3 py-2 text-xs">
          <span className="text-amber-200">Wrong network — switch to Base</span>
          <button
            type="button"
            className="ml-2 rounded border border-amber-400 px-2 py-0.5 text-amber-100"
            onClick={() => switchChain({ chainId: base.id })}
            disabled={isSwitching}
          >
            {isSwitching ? 'Switching…' : 'Switch'}
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        {isConnected && address ? (
          <>
            <span className="font-mono text-[10px] text-cyan-300/90 sm:text-xs">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
            <button
              type="button"
              onClick={() => disconnect()}
              className="rounded border border-cyan-500/40 px-2 py-1 text-[10px] uppercase tracking-wider text-cyan-200 hover:bg-cyan-950/50"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="neon-border rounded px-3 py-1.5 font-[family-name:var(--font-orbitron)] text-[10px] font-semibold uppercase tracking-widest text-cyan-300 glow-text-cyan sm:text-xs"
          >
            Connect wallet
          </button>
        )}
      </div>
      {sheet}
    </>
  );
}

function ConnectSheet({
  connectors,
  isPending,
  onConnect,
  onClose,
}: {
  connectors: ReturnType<typeof useConnect>['connectors'];
  isPending: boolean;
  onConnect: (connector: (typeof connectors)[number]) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connect wallet"
        className="neon-border w-full max-w-md rounded-t-2xl p-4 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-bold uppercase tracking-widest text-cyan-300">
            Connect wallet
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-xl leading-none text-[var(--magenta)]"
          >
            ×
          </button>
        </div>
        {connectors.length === 0 ? (
          <p className="text-xs text-gray-400">
            No wallets detected. Open in a wallet browser or install an
            extension.
          </p>
        ) : (
          <ul className="max-h-[50vh] space-y-2 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            {connectors.map((connector) => (
              <li key={connector.uid}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => onConnect(connector)}
                  className="w-full rounded-lg border border-cyan-500/30 bg-black/40 px-4 py-3 text-left text-sm text-cyan-100 transition hover:border-cyan-400 hover:bg-cyan-950/30 disabled:opacity-50"
                >
                  {connector.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
