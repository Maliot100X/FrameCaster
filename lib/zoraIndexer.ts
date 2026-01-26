
const ZORA_INDEXER_URL = "https://api.zora.co/graphql";

export type ZoraCoin = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  blockNumber: number;
  timestamp: number;
  creatorAddress: string;
  contractAddress: string;
  uri: string;
  imageUrl?: string;
  marketCap?: string;
  holderCount?: number;
};

export async function fetchLatestCoins(count: number = 20): Promise<ZoraCoin[]> {
  const query = `
    query {
      coins(first: ${count}, orderBy: CREATED_AT_DESC) {
        nodes {
          address
          name
          symbol
          decimals
          blockNumber
          timestamp
          creatorAddress
          contractAddress
          uri
        }
      }
    }
  `;

  try {
    const res = await fetch(ZORA_INDEXER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const json = await res.json();
    const nodes = json.data?.coins?.nodes || [];
    
    // Map to friendly format
    return nodes.map((node: any) => ({
      ...node,
      imageUrl: node.imageUrl || node.uri?.replace('ipfs://', 'https://ipfs.io/ipfs/') || "", // Simple resolve
      marketCap: "0", // Indexer might not return this directly yet without extra queries
      holderCount: 0
    }));
  } catch (error) {
    console.error("Zora Indexer Error:", error);
    return [];
  }
}

export async function fetchUserCoins(address: string): Promise<ZoraCoin[]> {
    const query = `
      query {
        coins(where: { creatorAddress: "${address}" }, first: 50, orderBy: CREATED_AT_DESC) {
          nodes {
            address
            name
            symbol
            decimals
            blockNumber
            timestamp
            creatorAddress
            contractAddress
            uri
          }
        }
      }
    `;
  
    try {
      const res = await fetch(ZORA_INDEXER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
  
      const json = await res.json();
      const nodes = json.data?.coins?.nodes || [];
      return nodes.map((node: any) => ({
        ...node,
        imageUrl: node.uri?.replace('ipfs://', 'https://ipfs.io/ipfs/') || "",
      }));
    } catch (error) {
      console.error("Zora Indexer Error:", error);
      return [];
    }
  }

export async function fetchUserHoldings(address: string): Promise<ZoraCoin[]> {
    // Currently Zora Indexer for Coins doesn't easily expose "holdings" of ERC20s via simple graph query 
    // without iterating all tokens. 
    // We will return empty for now and let the UI show "Syncing" or empty state.
    // In production, we'd use Alchemy/GoldRush or a dedicated indexer for balances.
    return [];
}
