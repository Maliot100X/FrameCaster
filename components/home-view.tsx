"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoinCard, type Coin } from "@/components/coin-card";
import { ScrollArea } from "@/components/ui/scroll-area";

const MOCK_COINS: Coin[] = [
  {
    id: "1",
    name: "Based Pup",
    ticker: "PUP",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=PUP&backgroundColor=ffdfbf",
    marketCap: "$12.5k",
    holders: 142,
    creator: { fid: 123, avatar: "https://github.com/shadcn.png", username: "dwr.eth" },
    isBoosted: true,
    change24h: 24.5
  },
  {
    id: "2",
    name: "Zora Orb",
    ticker: "ORB",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=ORB&backgroundColor=c0aede",
    marketCap: "$450k",
    holders: 1205,
    creator: { fid: 456, avatar: "https://github.com/vercel.png", username: "zora" },
    change24h: -5.2
  },
  {
    id: "3",
    name: "Farcaster OG",
    ticker: "FCOG",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=FCOG&backgroundColor=b6e3f4",
    marketCap: "$2.1M",
    holders: 5430,
    creator: { fid: 789, avatar: "https://github.com/farcaster.png", username: "v" },
    change24h: 12.0
  },
  {
    id: "4",
    name: "Meme Coin",
    ticker: "MEME",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=MEME&backgroundColor=ffd5dc",
    marketCap: "$5k",
    holders: 45,
    creator: { fid: 101, avatar: "https://github.com/base.png", username: "jesse" },
    change24h: 0
  },
];

export function HomeView() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          FrameCaster
        </h1>
      </div>
      
      <Tabs defaultValue="new" className="flex-1 flex flex-col">
        <div className="px-4 py-2">
          <TabsList className="grid w-full grid-cols-4 h-9">
            <TabsTrigger value="new" className="text-xs">New</TabsTrigger>
            <TabsTrigger value="boosted" className="text-xs">Boosted</TabsTrigger>
            <TabsTrigger value="grad" className="text-xs">Grad</TabsTrigger>
            <TabsTrigger value="trend" className="text-xs">Top</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-4">
          <TabsContent value="new" className="space-y-3 pb-20 mt-0">
             <p className="text-xs text-muted-foreground py-2 font-medium">Latest coins launched on Base</p>
             {MOCK_COINS.map((coin) => (
               <CoinCard key={coin.id} coin={coin} />
             ))}
             {MOCK_COINS.map((coin) => (
               <CoinCard key={coin.id + 'dup'} coin={{...coin, id: coin.id + 'dup'}} />
             ))}
          </TabsContent>
          <TabsContent value="boosted" className="space-y-3 pb-20 mt-0">
            <p className="text-xs text-muted-foreground py-2 font-medium">Featured community coins</p>
            {MOCK_COINS.filter(c => c.isBoosted).map((coin) => (
               <CoinCard key={coin.id} coin={coin} />
             ))}
          </TabsContent>
          <TabsContent value="grad" className="space-y-3 pb-20 mt-0">
             <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <p>No graduated coins yet.</p>
             </div>
          </TabsContent>
          <TabsContent value="trend" className="space-y-3 pb-20 mt-0">
             {MOCK_COINS.sort((a,b) => (b.change24h||0) - (a.change24h||0)).map((coin) => (
               <CoinCard key={coin.id} coin={coin} />
             ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
