"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet, LogOut, User, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ProfileView() {
  return (
    <div className="flex flex-col h-full p-4 space-y-6 pb-24">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your connected accounts and wallets.
        </p>
      </div>

      <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-400">Farcaster Connected</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                      <p className="font-bold">shadcn.eth</p>
                      <p className="text-xs text-muted-foreground">FID: 1234</p>
                  </div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                  <LogOut className="h-4 w-4" />
              </Button>
          </CardContent>
      </Card>

      <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Connect Wallet</h3>
          
          <Dialog>
              <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start h-14 text-left font-normal relative overflow-hidden group">
                      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 text-blue-500">
                          <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                          <p className="font-medium">Base Mini-App Wallet</p>
                          <p className="text-xs text-muted-foreground">Recommended for Frames</p>
                      </div>
                  </Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Connect Base Wallet</DialogTitle>
                      <DialogDescription>
                          This would trigger the @farcaster/miniapp-wagmi-connector flow.
                      </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      <Button>Connect with Coinbase Smart Wallet</Button>
                  </div>
              </DialogContent>
          </Dialog>

          <Button variant="outline" className="w-full justify-start h-14 text-left font-normal">
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3 text-orange-500">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MM" className="h-6 w-6" />
              </div>
              <div>
                  <p className="font-medium">MetaMask / Injected</p>
                  <p className="text-xs text-muted-foreground">Browser wallet</p>
              </div>
          </Button>

           <Button variant="outline" className="w-full justify-start h-14 text-left font-normal">
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 text-purple-500">
                  <User className="h-5 w-5" />
              </div>
              <div>
                  <p className="font-medium">Neynar Managed</p>
                  <p className="text-xs text-muted-foreground">Custodial wallet</p>
              </div>
          </Button>
      </div>

      <div className="mt-auto pt-8 flex justify-center">
          <a href="#" className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              View on GitHub <ExternalLink className="h-3 w-3" />
          </a>
      </div>
    </div>
  );
}
