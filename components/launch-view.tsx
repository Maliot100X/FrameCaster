"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePlus, Rocket, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { uploadFileToPinata, uploadJSONToPinata } from "@/lib/pinata";
import { useWalletClient, useAccount } from "wagmi";
import { supabase } from "@/lib/supabase";
import { publicClient, createCoin } from "@/lib/zora";
import sdk from "@farcaster/miniapp-sdk";
import { type Address } from "viem";
import { CreateConstants } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

export function LaunchView() {
  const { data: walletClient } = useWalletClient();
  const { isConnected, address } = useAccount();
  
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [fid, setFid] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadContext = async () => {
      try {
        // @ts-ignore
        const context = await sdk.context;
        if (context?.user?.fid) {
          setFid(context.user.fid);
        }
      } catch (err) {
        console.error("Error loading context:", err);
      }
    };
    loadContext();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  };

  const handleDeploy = async () => {
    if (!walletClient || !file || !name || !ticker) return;
    
    setIsDeploying(true);
    try {
      // 1. Upload Image to Pinata
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await uploadFileToPinata(formData);
      
      if (!uploadRes.success || !uploadRes.ipfsHash) {
        throw new Error("Failed to upload image");
      }
      
      const imageURI = `ipfs://${uploadRes.ipfsHash}`;
      
      // 2. Prepare Metadata
      const metadata = {
        name,
        description,
        image: imageURI,
      };

      const metadataRes = await uploadJSONToPinata(metadata, `${name}-metadata`);
      if (!metadataRes.success || !metadataRes.ipfsHash) {
        throw new Error("Failed to upload metadata");
      }
      const metadataURI = `ipfs://${metadataRes.ipfsHash}`;

      // 3. Call createCoin
      // @ts-ignore
      const args = {
        creator: address as Address,
        name: name,
        symbol: ticker,
        metadata: { type: "RAW_URI" as const, uri: metadataURI },
        currency: CreateConstants.ContentCoinCurrencies.ETH,
        chainId: base.id,
        startingMarketCap: CreateConstants.StartingMarketCaps.LOW,
        platformReferrerAddress: process.env.NEXT_PUBLIC_PLATFORM_WALLET as Address,
      };

      // @ts-ignore
      const result = await createCoin({ 
        call: args, 
        walletClient: walletClient, 
        publicClient 
      });
      
      const txHash = result.hash;
      const deployedAddress = result.address || ("0x" + txHash.slice(2, 42)); // Fallback if needed
      console.log("Coin deployed, tx:", txHash);

      // Wait for receipt to ensure it's on-chain
      let receipt;
      if (typeof txHash === 'string') {
          receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
      }

      // 4. Find the new coin address
      // We'll query getCreatedCoins and look for one with matching name/symbol or just the latest
      // A short delay might be needed for indexer to pick it up, but let's try immediately or fallback to just success message
      
      let coinAddress: string = '';
      if (deployedAddress) {
          coinAddress = deployedAddress;
      }
      
      // 5. Add to Supabase
      const { error } = await supabase.from('graduated_coins').insert({
          coin_address: coinAddress || "0x0000000000000000000000000000000000000000", // Placeholder if not found yet
          name: name,
          ticker: ticker,
          image_uri: imageURI,
          creator_fid: fid || 0,
          created_at: new Date().toISOString()
      });

      if (error) {
          console.error("Supabase error:", error);
      }
      
      alert("Coin deployed successfully!");
      
      // Reset form
      setName("");
      setTicker("");
      setDescription("");
      setFile(null);
      setPreview(null);
      
    } catch (error) {
      console.error("Deploy error:", error);
      alert("Failed to deploy coin. See console for details.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto pb-24">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Launch Coin</h2>
        <p className="text-sm text-muted-foreground">
          Create a new coin on Zora. It costs ~0.001 ETH to deploy.
        </p>
      </div>

      <div className="space-y-4">
        <div 
            className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer group relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          ) : null}
          <div className="bg-background p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform z-10">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground font-medium z-10">{file ? "Change Image" : "Upload Image"}</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="e.g. Based Pup" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ticker">Ticker</Label>
          <Input id="ticker" placeholder="e.g. PUP" value={ticker} onChange={(e) => setTicker(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" placeholder="What is this coin about?" className="h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
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

        <Button 
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-900/20"
            disabled={!isConnected || isDeploying || !file || !name || !ticker}
            onClick={handleDeploy}
        >
          {isDeploying ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Rocket className="mr-2 h-5 w-5" />
          )}
          {isDeploying ? "Deploying..." : "Create Coin"}
        </Button>
      </div>
    </div>
  );
}
