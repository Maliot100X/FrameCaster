"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getCoinsNew, getCoinsTrending } from "@/lib/zora";
import { CoinCard, Coin } from "./coin-card";
import { supabase } from "@/lib/supabase";

function CoinCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4 flex gap-4">
      <Skeleton className="h-16 w-16 rounded-lg" />
      <div className="flex flex-col justify-between flex-1 space-y-2">
        <div className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-32" />
        <div className="flex justify-between pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function HomeView() {
  const { data: newCoins, isLoading: isLoadingNew } = useQuery({
    queryKey: ['coins', 'new'],
    queryFn: async () => {
      // @ts-ignore
      const res = await getCoinsNew({ chainId: 8453, limit: 10 }) as any;
      return res?.coins || res || [];
    }
  });

  const { data: trendingCoins, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['coins', 'trending'],
    queryFn: async () => {
       // @ts-ignore
      const res = await getCoinsTrending({ chainId: 8453, limit: 10 }) as any;
      return res?.coins || res || [];
    }
  });

  const { data: boostedCoins, isLoading: isLoadingBoosted } = useQuery({
    queryKey: ['coins', 'boosted'],
    queryFn: async () => {
        const { data } = await supabase
            .from('boosts')
            .select('*')
            .gt('expires_at', new Date().toISOString())
            .order('amount_paid', { ascending: false }); // Sort by payment amount (king of hill)
        
        // In a real app, we would fetch the coin metadata for each boosted coin
        // For now, we'll map what we have or return placeholders if metadata missing
        // This is a simplified implementation
        return data || [];
    }
  });

  const { data: graduatedCoins, isLoading: isLoadingGrad } = useQuery({
    queryKey: ['coins', 'graduated'],
    queryFn: async () => {
        const { data } = await supabase
            .from('graduated_coins')
            .select('*')
            .order('created_at', { ascending: false });
        return data || [];
    }
  });

  const mapToCoin = (item: any): Coin => {
    return {
      id: item.address || item.id,
      name: item.name || "Unknown",
      ticker: item.symbol || "UNK",
      image: item.imageURI || item.image || item.tokenURI || "", 
      marketCap: item.marketCap ? `$${Number(item.marketCap).toLocaleString()}` : 'N/A',
      holders: item.holderCount || 0,
      creator: {
        fid: item.creator?.fid || 0,
        avatar: item.creator?.pfp || "",
        username: item.creator?.username || item.creator?.address?.slice(0, 6) || "Unknown"
      },
      change24h: item.change24h || 0,
      isBoosted: false // Todo: implement boosted logic
    };
  };

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
             {isLoadingNew ? (
                <>
                    <CoinCardSkeleton />
                    <CoinCardSkeleton />
                    <CoinCardSkeleton />
                </>
             ) : newCoins && newCoins.length > 0 ? (
                newCoins.map((coin: any) => (
                    <CoinCard key={coin.address || coin.id} coin={mapToCoin(coin)} />
                ))
             ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    No new coins found.
                </div>
             )}
          </TabsContent>

          <TabsContent value="boosted" className="space-y-3 pb-20 mt-0">
            <p className="text-xs text-muted-foreground py-2 font-medium">Featured community coins</p>
             {isLoadingBoosted ? (
                <>
                    <CoinCardSkeleton />
                    <CoinCardSkeleton />
                </>
             ) : boostedCoins && boostedCoins.length > 0 ? (
                boostedCoins.map((boost: any) => (
                    // We need to fetch coin details for the boost. 
                    // This is a placeholder since we don't have the full coin object stored in boosts table usually
                    // Ideally we join tables. For now assuming we have some metadata or fetching it.
                    <div key={boost.id} className="p-4 border rounded-xl text-center text-sm">
                        Coin: {boost.coin_address} (Boosted)
                    </div>
                ))
             ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                   <p>No boosted coins yet.</p>
                </div>
             )}
          </TabsContent>

          <TabsContent value="grad" className="space-y-3 pb-20 mt-0">
             {isLoadingGrad ? (
                <>
                    <CoinCardSkeleton />
                    <CoinCardSkeleton />
                </>
             ) : graduatedCoins && graduatedCoins.length > 0 ? (
                graduatedCoins.map((coin: any) => (
                    <CoinCard key={coin.id} coin={{
                        id: coin.coin_address,
                        name: coin.name,
                        ticker: coin.ticker,
                        image: coin.image_uri,
                        marketCap: "Graduated",
                        holders: 0,
                        creator: {
                            fid: coin.creator_fid,
                            avatar: "",
                            username: "Creator"
                        },
                        isBoosted: true
                    }} />
                ))
             ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <p>No graduated coins yet.</p>
                </div>
             )}
          </TabsContent>

          <TabsContent value="trend" className="space-y-3 pb-20 mt-0">
             {isLoadingTrending ? (
                <>
                    <CoinCardSkeleton />
                    <CoinCardSkeleton />
                </>
             ) : trendingCoins && trendingCoins.length > 0 ? (
                trendingCoins.map((coin: any) => (
                    <CoinCard key={coin.address || coin.id} coin={mapToCoin(coin)} />
                ))
             ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    Not enough data for trending.
                </div>
             )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
