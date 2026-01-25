"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSendTransaction, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
// @ts-ignore
import { getCoinsCreated } from "@/lib/zora";

export function ShopView() {
  const { sendTransaction, data: hash, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const { address } = useAccount();

  // State to track which boost is being purchased
  const [selectedBoost, setSelectedBoost] = useState<{hours: number, price: string} | null>(null);
  const [selectedCoinAddress, setSelectedCoinAddress] = useState<string>("");

  const { data: userCoins } = useQuery({
    queryKey: ['coins', 'created', address],
    enabled: !!address,
    queryFn: async () => {
        // @ts-ignore
        const res = await getCoinsCreated({ chainId: 8453, address }) as any;
        return res?.coins || res || [];
    }
  });

  const handleBuyBoost = (hours: number, price: string) => {
    const platformWallet = process.env.NEXT_PUBLIC_PLATFORM_WALLET;
    if (!platformWallet) {
        alert("Platform wallet not configured");
        return;
    }
    if (!selectedCoinAddress) {
        alert("Please select a coin to boost first");
        return;
    }

    setSelectedBoost({ hours, price });
    sendTransaction({
        to: platformWallet as `0x${string}`,
        value: parseEther(price),
    });
  };

  useEffect(() => {
    if (isConfirmed && hash && selectedBoost && address && selectedCoinAddress) {
        // Transaction confirmed, save to Supabase
        const saveBoost = async () => {
            try {
                const { error } = await supabase.from('boosts').insert({
                    coin_address: selectedCoinAddress,
                    amount_paid: selectedBoost.price,
                    duration_hours: selectedBoost.hours,
                    created_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + selectedBoost.hours * 60 * 60 * 1000).toISOString(),
                    tx_hash: hash
                });
                
                if (error) throw error;
                alert("Boost activated!");
                setSelectedBoost(null);
            } catch (err) {
                console.error("Failed to save boost:", err);
                alert("Transaction successful but failed to save boost. Contact support.");
            }
        };
        saveBoost();
    }
  }, [isConfirmed, hash, selectedBoost, address, selectedCoinAddress]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 py-4 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          Boost Shop
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Feature your coin on the Home Boosted tab.
        </p>
      </div>

      <ScrollArea className="flex-1 p-4 pb-24">
        <div className="grid gap-4">
            
            {/* Coin Selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Select Coin to Boost</label>
                <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCoinAddress}
                    onChange={(e) => setSelectedCoinAddress(e.target.value)}
                >
                    <option value="" disabled>Select a coin...</option>
                    {userCoins && userCoins.length > 0 ? (
                        userCoins.map((coin: any) => (
                            <option key={coin.address || coin.id} value={coin.address || coin.id}>
                                {coin.name || "Unknown"} ({coin.symbol || "UNK"})
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>No created coins found</option>
                    )}
                </select>
                {!userCoins || userCoins.length === 0 && (
                    <p className="text-xs text-muted-foreground">You need to create a coin first to boost it.</p>
                )}
            </div>

            {[
                { hours: 1, price: "0.005" },
                { hours: 12, price: "0.02" },
                { hours: 24, price: "0.05" }
            ].map((item) => (
                <div key={item.hours} className={`flex items-center justify-between p-4 border rounded-xl bg-card transition-colors ${!selectedCoinAddress ? 'opacity-50' : 'hover:bg-accent/50'}`}>
                    <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-black">
                            {item.hours}h
                         </div>
                         <div>
                             <h3 className="font-bold">{item.hours} Hour Boost</h3>
                             <p className="text-xs text-muted-foreground">~{item.price} ETH</p>
                         </div>
                    </div>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleBuyBoost(item.hours, item.price)}
                        disabled={isPending || isConfirming || !selectedCoinAddress}
                    >
                        {isPending || isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy"}
                    </Button>
                </div>
            ))}
             <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/20 mt-4">
                 <h3 className="font-bold text-purple-100 mb-2">Why Boost?</h3>
                 <ul className="text-xs text-purple-200 space-y-2">
                     <li className="flex items-center gap-2">
                         <Zap className="h-3 w-3" /> Get featured on the home page
                     </li>
                     <li className="flex items-center gap-2">
                         <Zap className="h-3 w-3" /> Increase visibility by 10x
                     </li>
                     <li className="flex items-center gap-2">
                         <Zap className="h-3 w-3" /> Attract more holders
                     </li>
                 </ul>
             </div>
        </div>
      </ScrollArea>
    </div>
  );
}
