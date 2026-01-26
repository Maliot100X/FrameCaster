"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet, LogOut, User, RefreshCw, Loader2, Crown } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { getUserInfo } from "@/lib/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
// @ts-ignore
import sdk from "@farcaster/miniapp-sdk";
import { useQuery } from "@tanstack/react-query";
import { getCoinsOwned, getCoinsCreated } from "@/lib/zora";
import { CoinCard, Coin } from "./coin-card";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

type FarcasterUser = {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  verifications?: string[];
};

export function ProfileView() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [contextFid, setContextFid] = useState<number | null>(null);
  const [subscription, setSubscription] = useState<{badge: string, monthly: boolean} | null>(null);

  useEffect(() => {
    const loadContext = async () => {
      try {
         // @ts-ignore
         const context = await sdk.context;
         if (context?.user?.fid) {
           setContextFid(context.user.fid);
           handleSync(context.user.fid);
           
           // Check subscription
           const { data } = await supabase
               .from('subscribers')
               .select('*')
               .eq('user_fid', context.user.fid)
               .single();
           
           if (data) {
               setSubscription({
                   badge: data.badge,
                   monthly: data.monthly_paid
               });
           }
         }
      } catch (err) {
        console.error("Error loading frame context:", err);
      }
    };
    loadContext();
  }, []);

  const handleSync = useCallback(async (fidToSync?: number) => {
    setIsSyncing(true);
    try {
      const targetFid = fidToSync || contextFid || 1; 
      
      const user = await getUserInfo(targetFid);
      if (user) {
        setFarcasterUser({
            fid: user.fid,
            username: user.username,
            display_name: user.display_name || user.username,
            pfp_url: user.pfp_url || "",
            verifications: user.verifications,
        });
      }
    } catch (error) {
      console.error("Failed to sync Farcaster user", error);
    } finally {
      setIsSyncing(false);
    }
  }, [contextFid]);

  const handleConnect = (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId);
    if (connector) {
      connect({ connector });
    }
  };

  const { data: holdings, isLoading: isLoadingHoldings } = useQuery({
    queryKey: ['coins', 'holdings', address],
    enabled: !!address,
    queryFn: async () => {
        const res = await getCoinsOwned(address!);
        return res;
    }
  });

  const { data: created, isLoading: isLoadingCreated } = useQuery({
    queryKey: ['coins', 'created', address],
    enabled: !!address,
    queryFn: async () => {
        const res = await getCoinsCreated(address!);
        return res;
    }
  });

  const mapToCoin = (item: any): Coin => {
    // Handle various Zora SDK response formats
    const metadata = item.metadata || {};
    const image = item.imageURI || item.image || item.tokenURI || metadata.image || metadata.imageURI || "";

    return {
      id: item.address || item.id,
      name: item.name || "Unknown",
      ticker: item.symbol || "UNK",
      image: image,
      marketCap: item.marketCap ? `$${Number(item.marketCap).toLocaleString()}` : 'N/A',
      holders: item.holderCount || 0,
      creator: {
        fid: item.creator?.fid || 0,
        avatar: item.creator?.pfp || "",
        username: item.creator?.username || item.creator?.address?.slice(0, 6) || "Unknown"
      },
      change24h: item.change24h || 0,
      isBoosted: false
    };
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-6 pb-24">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your connected accounts and wallets.
        </p>
      </div>

      {/* Farcaster Profile Card */}
      <div className="flex flex-col items-center space-y-4 p-6 bg-card rounded-xl border border-border">
        <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={farcasterUser?.pfp_url} />
              <AvatarFallback>{farcasterUser?.username?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
            </Avatar>
            {subscription && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5 border-2 border-background" title="Premium Member">
                    <Crown className="w-4 h-4 text-white fill-white" />
                </div>
            )}
        </div>
        
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold flex items-center justify-center gap-2">
            {farcasterUser?.display_name || "Guest"}
            {subscription && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500 border-yellow-500/30">PRO</Badge>}
          </h2>
          <p className="text-sm text-muted-foreground">@{farcasterUser?.username || "guest"}</p>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Wallet</h3>
          
          {isConnected ? (
              <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                              <Wallet className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                              <p className="font-medium text-green-500">Connected</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">{address}</p>
                          </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => disconnect()} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <LogOut className="h-4 w-4" />
                      </Button>
                  </CardContent>
              </Card>
          ) : (
            <div className="space-y-3">
                 <Button 
                    variant="outline" 
                    className="w-full justify-start h-14 text-left font-normal relative overflow-hidden group border-blue-500/30"
                    onClick={() => handleConnect('farcaster-frame')} 
                 >
                      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 text-blue-500">
                          <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                          <p className="font-medium">Base Mini-App Wallet</p>
                          <p className="text-xs text-muted-foreground">Recommended</p>
                      </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-14 text-left font-normal"
                    onClick={() => handleConnect('io.metamask')} 
                  >
                      <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3 text-orange-500">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MM" className="h-6 w-6" />
                      </div>
                      <div>
                          <p className="font-medium">MetaMask / Browser</p>
                          <p className="text-xs text-muted-foreground">External Wallet</p>
                      </div>
                  </Button>
            </div>
          )}
      </div>

      {/* Holdings / Created Tabs */}
      <Tabs defaultValue="holdings" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="created">Created</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[200px] mt-2 rounded-md border p-4">
              <TabsContent value="holdings" className="mt-0 space-y-2">
                  {isConnected ? (
                       isLoadingHoldings ? (
                           <div className="text-center py-8 text-muted-foreground text-sm">Loading holdings...</div>
                       ) : holdings && holdings.length > 0 ? (
                           holdings.map((coin: any) => (
                               <CoinCard key={coin.address || coin.id} coin={mapToCoin(coin)} />
                           ))
                       ) : (
                           <div className="text-center py-8 text-muted-foreground text-sm">
                              No coins held yet.
                           </div>
                       )
                  ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                          Connect wallet to see holdings.
                      </div>
                  )}
              </TabsContent>
               <TabsContent value="created" className="mt-0 space-y-2">
                  {isConnected ? (
                       isLoadingCreated ? (
                           <div className="text-center py-8 text-muted-foreground text-sm">Loading created coins...</div>
                       ) : created && created.length > 0 ? (
                           created.map((coin: any) => (
                               <CoinCard key={coin.address || coin.id} coin={mapToCoin(coin)} />
                           ))
                       ) : (
                           <div className="text-center py-8 text-muted-foreground text-sm">
                              No coins created yet.
                           </div>
                       )
                  ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                          Connect wallet to see created coins.
                      </div>
                  )}
              </TabsContent>
          </ScrollArea>
      </Tabs>
    </div>
  );
}
