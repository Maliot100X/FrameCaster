import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
// @ts-ignore
import { 
  getCoinsNew, 
  getCoinsTopVolume24h, 
  getProfileBalances, 
  getCreatorCoins, 
  createCoin 
} from '@zoralabs/coins-sdk';

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org'),
});

export { 
  getCoinsNew, 
  getCoinsTopVolume24h as getCoinsTrending, // Alias for trending
  getProfileBalances as getCoinsOwned,      // Alias for owned
  getCreatorCoins as getCoinsCreated,       // Alias for created
  createCoin 
};
