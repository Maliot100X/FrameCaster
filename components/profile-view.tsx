"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet, LogOut, User, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { getUserInfo } from "@/lib/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import sdk from "@farcaster/frame-sdk";

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

  useEffect(() => {
    const loadContext = async () => {
      try {
         const context = await sdk.context;
         if (context?.user?.fid) {
           setContextFid(context.user.fid);
           handleSync(context.user.fid);
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
      // If we have a FID from context (or argument), use it. 
      // Otherwise we might default to a hardcoded one for dev or prompt user.
      // For this phase, we'll try to use the one passed or state.
      const targetFid = fidToSync || contextFid || 1; // Default to 1 (warpcast) if no context for dev
      
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

  return (
    <div className="flex flex-col h-full p-4 space-y-6 pb-24">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your connected accounts and wallets.
        </p>
      </div>

      {/* Farcaster Profile Card */}
      <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-400 flex justify-between items-center">
                <span>Farcaster Connected</span>
                <Button variant="ghost" size="sm" onClick={() => handleSync(contextFid || undefined)} disabled={isSyncing} className="h-6 w-6 p-0">
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
              {farcasterUser ? (
                  <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-background">
                          <AvatarImage src={farcasterUser.pfp_url} />
                          <AvatarFallback>{farcasterUser.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                          <p className="font-bold">{farcasterUser.display_name}</p>
                          <p className="text-xs text-muted-foreground">@{farcasterUser.username} (FID: {farcasterUser.fid})</p>
                      </div>
                  </div>
              ) : (
                  <div className="flex flex-col gap-2 w-full">
                      <p className="text-sm text-muted-foreground">Not synced with Farcaster</p>
                      <Button size="sm" variant="outline" onClick={() => handleSync()} disabled={isSyncing}>
                          {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4" />}
                          Sync Farcaster
                      </Button>
                  </div>
              )}
          </CardContent>
      </Card>

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
                    onClick={() => handleConnect('farcaster-frame')} // Assuming ID from @farcaster/miniapp-wagmi-connector
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
                    onClick={() => handleConnect('io.metamask')} // Or 'injected'
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
              <TabsContent value="holdings" className="mt-0">
                  {isConnected ? (
                       <div className="text-center py-8 text-muted-foreground text-sm">
                          No coins held yet.
                       </div>
                  ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                          Connect wallet to see holdings.
                      </div>
                  )}
              </TabsContent>
               <TabsContent value="created" className="mt-0">
                  {isConnected ? (
                       <div className="text-center py-8 text-muted-foreground text-sm">
                          No coins created yet.
                       </div>
                  ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                          Connect wallet to see created coins.
                      </div>
                  )}
              </TabsContent>
          </ScrollArea>
      </Tabs>

      <div className="mt-auto pt-4 flex justify-center">
          <a href="https://github.com/Maliot100X/FrameCaster" target="_blank" className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              View on GitHub <ExternalLink className="h-3 w-3" />
          </a>
      </div>
    </div>
  );
}
