"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useState } from "react";

export function ShopView() {
  const { sendTransaction, data: hash, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleBuyBoost = (hours: number, price: string) => {
    const platformWallet = process.env.NEXT_PUBLIC_PLATFORM_WALLET;
    if (!platformWallet) {
        alert("Platform wallet not configured");
        return;
    }

    sendTransaction({
        to: platformWallet as `0x${string}`,
        value: parseEther(price),
    });
  };

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
            {[
                { hours: 1, price: "0.005" },
                { hours: 12, price: "0.02" },
                { hours: 24, price: "0.05" }
            ].map((item) => (
                <div key={item.hours} className="flex items-center justify-between p-4 border rounded-xl bg-card hover:bg-accent/50 transition-colors">
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
                        disabled={isPending || isConfirming}
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
