"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getNewCoins, getTrendingCoins } from "@/lib/zora";
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
      const res = await getNewCoins();
      return res;
    }
  });

  const { data: trendingCoins, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['coins', 'trending'],
    queryFn: async () => {
      const res = await getTrendingCoins();
      return res;
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

  const mapToCoin = (item: any, isBoosted = false): Coin => {
    return {
      id: item.address || item.id,
      name: item.name || "Unknown",
      ticker: item.symbol || "UNK",
      image: item.imageURI || item.image || item.tokenURI || "https://framecaster-jade.vercel.app/vercel.svg", 
      marketCap: item.marketCap ? `$${Number(item.marketCap).toLocaleString()}` : 'N/A',
      holders: item.holderCount || 0,
      creator: {
        fid: item.creator?.fid || 0,
        avatar: item.creator?.pfp || "",
        username: item.creator?.username || item.creator?.address?.slice(0, 6) || "Unknown"
      },
      change24h: item.change24h || 0,
      isBoosted: isBoosted
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
        <TabsList className="grid w-full grid-cols-4 px-4 my-2">
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="trending">Hot</TabsTrigger>
          <TabsTrigger value="boosted">Boost</TabsTrigger>
          <TabsTrigger value="graduated">Grad</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 px-4">
          <TabsContent value="new" className="space-y-4 pb-4">
            {isLoadingNew ? (
              Array(3).fill(0).map((_, i) => <CoinCardSkeleton key={i} />)
            ) : newCoins && newCoins.length > 0 ? (
              newCoins.map((item: any) => <CoinCard key={item.address || item.id} coin={mapToCoin(item)} />)
            ) : (
              <div className="text-center text-muted-foreground py-10">No new coins found.</div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-4 pb-4">
            {isLoadingTrending ? (
              Array(3).fill(0).map((_, i) => <CoinCardSkeleton key={i} />)
            ) : trendingCoins && trendingCoins.length > 0 ? (
              trendingCoins.map((item: any) => <CoinCard key={item.address || item.id} coin={mapToCoin(item)} />)
            ) : (
              <div className="text-center text-muted-foreground py-10">No trending coins found.</div>
            )}
          </TabsContent>

          <TabsContent value="boosted" className="space-y-4 pb-4">
            {isLoadingBoosted ? (
              Array(3).fill(0).map((_, i) => <CoinCardSkeleton key={i} />)
            ) : boostedCoins && boostedCoins.length > 0 ? (
              boostedCoins.map((item: any) => <CoinCard key={item.address || item.id} coin={mapToCoin(item, true)} />)
            ) : (
              <div className="text-center text-muted-foreground py-10">No boosted coins active.</div>
            )}
          </TabsContent>

          <TabsContent value="graduated" className="space-y-4 pb-4">
            {isLoadingGrad ? (
              Array(3).fill(0).map((_, i) => <CoinCardSkeleton key={i} />)
            ) : graduatedCoins && graduatedCoins.length > 0 ? (
              graduatedCoins.map((item: any) => <CoinCard key={item.address || item.id} coin={mapToCoin(item)} />)
            ) : (
              <div className="text-center text-muted-foreground py-10">No graduated coins yet.</div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
