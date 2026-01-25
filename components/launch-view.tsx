"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePlus, Rocket } from "lucide-react";

export function LaunchView() {
  return (
    <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto pb-24">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Launch Coin</h2>
        <p className="text-sm text-muted-foreground">
          Create a new coin on Zora. It costs ~0.001 ETH to deploy.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer group">
          <div className="bg-background p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground font-medium">Upload Image</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="e.g. Based Pup" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ticker">Ticker</Label>
          <Input id="ticker" placeholder="e.g. PUP" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" placeholder="What is this coin about?" className="h-20" />
        </div>

        <Card className="bg-muted/30 border-none">
            <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                    <span>Deploy Cost</span>
                    <span>~0.001 ETH</span>
                </div>
                <div className="flex justify-between">
                    <span>Initial Supply</span>
                    <span>1,000,000,000</span>
                </div>
            </CardContent>
        </Card>

        <Button className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-900/20" disabled>
          <Rocket className="mr-2 h-5 w-5" />
          Create Coin
        </Button>
      </div>
    </div>
  );
}
