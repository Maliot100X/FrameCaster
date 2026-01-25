import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
// @ts-ignore
import { 
  getCoinsNew, 
  getCoinsTopVolume24h, 
  getProfileBalances, 
  getProfileCoins, 
  createCoin 
} from '@zoralabs/coins-sdk';

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org'),
});

// Wrapper functions to ensure correct params as per user request
// No API calls, pure SDK usage

export const getTrendingCoins = async () => {
  // @ts-ignore
  const res = await getCoinsTopVolume24h({ count: 10 });
  return (res as any)?.coins || res || [];
};

export const getNewCoins = async () => {
  // @ts-ignore
  const res = await getCoinsNew({ count: 10 });
  return (res as any)?.coins || res || [];
};

export const getOwnedCoins = async (address: string) => {
  if (!address) return [];
  // @ts-ignore
  const res = await getProfileBalances({ chainId: 8453, address });
  return (res as any)?.coins || res || [];
};

export const getCreatedCoins = async (address: string) => {
  if (!address) return [];
  // @ts-ignore
  const res = await getProfileCoins({ chainId: 8453, address });
  return (res as any)?.coins || res || [];
};

export { createCoin };
