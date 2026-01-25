"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ShopView() {
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
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-xl bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-black">
                            {i}h
                         </div>
                         <div>
                             <h3 className="font-bold">{i} Hour Boost</h3>
                             <p className="text-xs text-muted-foreground">~0.005 ETH</p>
                         </div>
                    </div>
                    <Button size="sm" variant="outline">Buy</Button>
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
