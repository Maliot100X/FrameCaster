"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";

export type Coin = {
  id: string;
  name: string;
  ticker: string;
  image: string;
  marketCap: string;
  holders: number;
  creator: {
    fid: number;
    avatar: string;
    username: string;
  };
  isBoosted?: boolean;
  change24h?: number;
};

export function CoinCard({ coin }: { coin: Coin }) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer group">
      <div className="flex p-4 gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          <img
            src={coin.image}
            alt={coin.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-lg leading-tight truncate">
                {coin.name}
              </h3>
              <p className="text-muted-foreground text-sm font-medium">
                ${coin.ticker}
              </p>
            </div>
            {coin.isBoosted && (
              <Badge variant="default" className="bg-purple-600 hover:bg-purple-700 text-[10px] px-1.5 py-0 h-5">
                BOOSTED
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Avatar className="h-4 w-4">
              <AvatarImage src={coin.creator.avatar} />
              <AvatarFallback>{coin.creator.username[0]}</AvatarFallback>
            </Avatar>
            <span className="truncate">@{coin.creator.username}</span>
          </div>
        </div>
      </div>
      <CardFooter className="bg-muted/30 p-3 px-4 flex justify-between items-center text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Market Cap</span>
          <span className="font-semibold">{coin.marketCap}</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
               <Users className="h-3 w-3" /> Holders
            </span>
            <span className="font-semibold">{coin.holders}</span>
          </div>
          {coin.change24h !== undefined && (
             <div className={`flex flex-col items-end ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <span className="text-xs text-muted-foreground">24h</span>
                <span className="font-semibold flex items-center">
                  {coin.change24h > 0 ? '+' : ''}{coin.change24h}%
                </span>
             </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
