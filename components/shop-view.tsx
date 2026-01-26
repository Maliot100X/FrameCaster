"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Loader2, Crown, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSendTransaction, useWaitForTransactionReceipt, useAccount, useWriteContract } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { fetchUserCoins } from "@/lib/zoraIndexer";
import sdk from "@farcaster/miniapp-sdk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7c32D4f71b54bda02913";
const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
] as const;

export function ShopView() {
  const [currency, setCurrency] = useState<'ETH' | 'USDC'>('ETH');
  
  const { sendTransaction, data: ethHash, isPending: isEthPending } = useSendTransaction();
  const { writeContract, data: usdcHash, isPending: isUsdcPending } = useWriteContract();
  
  const hash = currency === 'ETH' ? ethHash : usdcHash;
  const isPending = isEthPending || isUsdcPending;

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const { address } = useAccount();

  // State to track which boost is being purchased
  const [selectedBoost, setSelectedBoost] = useState<{hours: number, price: string} | null>(null);
  const [selectedCoinAddress, setSelectedCoinAddress] = useState<string>("");
  const [selectedSubscription, setSelectedSubscription] = useState<'trial' | 'monthly' | null>(null);
  const [fid, setFid] = useState<number>(0);

  useEffect(() => {
    const loadContext = async () => {
        try {
            // @ts-ignore
            const context = await sdk.context;
            if (context?.user?.fid) {
                setFid(context.user.fid);
            }
        } catch (e) {
            console.error("Error loading context", e);
        }
    };
    loadContext();
  }, []);

  const { data: userCoins } = useQuery({
    queryKey: ['coins', 'created', address],
    enabled: !!address,
    queryFn: async () => {
        if (!address) return [];
        const res = await fetchUserCoins(address);
        return res;
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
    setSelectedSubscription(null);
    
    if (currency === 'ETH') {
        sendTransaction({
            to: platformWallet as `0x${string}`,
            value: parseEther(price),
        });
    } else {
        writeContract({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [platformWallet as `0x${string}`, parseUnits(price, 6)]
        });
    }
  };

  const handleSubscribe = (type: 'trial' | 'monthly', price: string) => {
    const platformWallet = process.env.NEXT_PUBLIC_PLATFORM_WALLET;
    if (!platformWallet) {
        alert("Platform wallet not configured");
        return;
    }
    if (!fid) {
        alert("Farcaster ID not found. Please open in Farcaster.");
        return;
    }

    setSelectedSubscription(type);
    setSelectedBoost(null);

    if (currency === 'ETH') {
        // Approximate ETH prices for $1 and $19 if user selects ETH
        // $1 ~= 0.0004 ETH, $19 ~= 0.0075 ETH (simplified for UX, ideally fetch oracle)
        // User requested $1 and $19. Assuming USDC for dollar amounts or equivalent ETH.
        // Let's use fixed ETH amounts for simplicity or prompt user.
        // For this implementation, I will use the passed string price assuming it matches currency.
        // But wait, the UI shows $1/$19. If currency is ETH, we need ETH amount.
        // Let's force USDC for subscription or convert. 
        // User instruction: "$1 trial ETH/USDC button".
        // I will use a fixed small ETH amount for $1 (0.0004) and $19 (0.0075) if ETH is selected.
        
        const ethPrice = type === 'trial' ? "0.0004" : "0.0075";

        sendTransaction({
            to: platformWallet as `0x${string}`,
            value: parseEther(ethPrice),
        });
    } else {
        writeContract({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [platformWallet as `0x${string}`, parseUnits(price, 6)]
        });
    }
  };

  const prices = currency === 'ETH' 
    ? [
        { hours: 1, price: "0.005" },
        { hours: 12, price: "0.02" },
        { hours: 24, price: "0.05" }
      ]
    : [
        { hours: 1, price: "15" },
        { hours: 12, price: "60" },
        { hours: 24, price: "150" }
      ];

  useEffect(() => {
    if (isConfirmed && hash) {
        if (selectedBoost && address && selectedCoinAddress) {
            // Transaction confirmed, save boost to Supabase
            const saveBoost = async () => {
                const { error } = await supabase.from('boosts').insert({
                    coin_address: selectedCoinAddress,
                    amount_paid: parseFloat(selectedBoost.price),
                    duration_hours: selectedBoost.hours,
                    user_fid: fid, // Optional if we have it
                    expires_at: new Date(Date.now() + selectedBoost.hours * 60 * 60 * 1000).toISOString(),
                    tx_hash: hash
                });
                
                if (!error) {
                    alert("Boost activated successfully!");
                    setSelectedBoost(null);
                } else {
                    console.error("Supabase error:", error);
                }
            };
            saveBoost();
        } else if (selectedSubscription && fid) {
            // Transaction confirmed, save subscription to Supabase
            const saveSub = async () => {
                // First check existing
                const { data: existing } = await supabase
                    .from('subscribers')
                    .select('*')
                    .eq('user_fid', fid)
                    .single();

                const isTrial = selectedSubscription === 'trial';
                
                const { error } = await supabase.from('subscribers').upsert({
                    user_fid: fid,
                    trial_paid: isTrial ? true : (existing?.trial_paid || false),
                    monthly_paid: !isTrial ? true : (existing?.monthly_paid || false),
                    badge: "Premium",
                    start_date: new Date().toISOString()
                }, { onConflict: 'user_fid' });

                if (!error) {
                    alert("Subscription activated successfully!");
                    setSelectedSubscription(null);
                } else {
                    console.error("Supabase error:", error);
                }
            };
            saveSub();
        }
    }
  }, [isConfirmed, hash, selectedBoost, address, selectedCoinAddress, selectedSubscription, fid]);

  return (
    <div className="flex flex-col h-full bg-background p-4 space-y-6 overflow-y-auto pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Shop</h2>
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <Button 
                variant={currency === 'ETH' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setCurrency('ETH')}
                className="h-7 text-xs"
            >
                ETH
            </Button>
            <Button 
                variant={currency === 'USDC' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setCurrency('USDC')}
                className="h-7 text-xs"
            >
                USDC
            </Button>
        </div>
      </div>

      <Tabs defaultValue="boosts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="boosts">Boost Coin</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>
        
        <TabsContent value="boosts" className="space-y-4 mt-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Select Coin to Boost</label>
                    <ScrollArea className="h-[120px] rounded-md border p-2">
                        {userCoins?.map((coin: any) => (
                            <div 
                                key={coin.address} 
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted/50 ${selectedCoinAddress === coin.address ? 'bg-muted border-primary/50 border' : ''}`}
                                onClick={() => setSelectedCoinAddress(coin.address)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden">
                                        <img src={coin.imageURI || "https://framecaster-jade.vercel.app/vercel.svg"} alt={coin.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">{coin.name}</span>
                                        <span className="text-xs text-muted-foreground">${coin.symbol}</span>
                                    </div>
                                </div>
                                {selectedCoinAddress === coin.address && <Zap className="w-4 h-4 text-primary" />}
                            </div>
                        ))}
                        {(!userCoins || userCoins.length === 0) && (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                No coins created yet. Launch one to boost it!
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {prices.map((plan) => (
                        <div key={plan.hours} className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative p-4 bg-card rounded-lg border border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{plan.hours} Hours</h3>
                                        <p className="text-xs text-muted-foreground">Boost visibility</p>
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => handleBuyBoost(plan.hours, plan.price)}
                                    disabled={isPending || !selectedCoinAddress}
                                >
                                    {isPending && selectedBoost?.hours === plan.hours ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                                     `${plan.price} ${currency}`}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </TabsContent>
        
        <TabsContent value="premium" className="space-y-4 mt-4">
            <div className="p-6 rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-full">
                        <Crown className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Premium Member</h3>
                        <p className="text-sm text-muted-foreground">Unlock exclusive powers</p>
                    </div>
                </div>
                
                <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Free monthly boosts (12h)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Priority listing in Boosted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Custom profile themes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Premium badge</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                     <Button 
                        variant="outline" 
                        className="w-full border-primary/50 hover:bg-primary/10"
                        onClick={() => handleSubscribe('trial', '1')}
                        disabled={isPending}
                     >
                        {isPending && selectedSubscription === 'trial' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                         `$1 Trial (${currency})`}
                     </Button>
                     <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={() => handleSubscribe('monthly', '19')}
                        disabled={isPending}
                     >
                        {isPending && selectedSubscription === 'monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                         `$19 / Month (${currency})`}
                     </Button>
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
