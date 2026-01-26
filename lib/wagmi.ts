import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterFrame } from '@farcaster/miniapp-wagmi-connector';

export const config = createConfig({
  chains: [base],
  transports: { [base.id]: http(process.env.BASE_RPC_URL) },
  connectors: [farcasterFrame()],
});
