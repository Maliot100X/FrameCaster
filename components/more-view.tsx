import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen, Bot, Zap, Crown, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount, useSendTransaction, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { supabase } from "@/lib/supabase";
import sdk from "@farcaster/miniapp-sdk";

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

export function MoreView() {
  const { address } = useAccount();
  const [currency, setCurrency] = useState<'ETH' | 'USDC'>('ETH');
  const [fid, setFid] = useState<number>(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{trial: boolean, monthly: boolean, badge: string} | null>(null);

  const { sendTransaction, data: ethHash, isPending: isEthPending } = useSendTransaction();
  const { writeContract, data: usdcHash, isPending: isUsdcPending } = useWriteContract();
  
  const hash = currency === 'ETH' ? ethHash : usdcHash;
  const isPending = isEthPending || isUsdcPending;

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Load Context & Subscription
  useEffect(() => {
    const loadData = async () => {
      try {
        // @ts-ignore
        const context = await sdk.context;
        if (context?.user?.fid) {
            setFid(context.user.fid);
            
            // Check subscription
            const { data } = await supabase
                .from('subscribers')
                .select('*')
                .eq('user_fid', context.user.fid)
                .single();
            
            if (data) {
                setSubscriptionStatus({
                    trial: data.trial_paid,
                    monthly: data.monthly_paid,
                    badge: data.badge
                });
            }
        }
      } catch (e) {
        console.error("Error loading context", e);
      }
    };
    loadData();
  }, []);

  // Handle Payment Success
  useEffect(() => {
    if (isConfirmed && hash && fid) {
        const updateSub = async () => {
            const isTrial = selectedPlan === 'trial';
            
            // Upsert subscription
            const { error } = await supabase.from('subscribers').upsert({
                user_fid: fid,
                trial_paid: isTrial ? true : (subscriptionStatus?.trial || false),
                monthly_paid: !isTrial ? true : (subscriptionStatus?.monthly || false),
                badge: "Premium",
                start_date: new Date().toISOString()
            }, { onConflict: 'user_fid' });

            if (!error) {
                alert("Subscription successful! Welcome to Premium.");
                setSubscriptionStatus(prev => ({
                    trial: isTrial ? true : (prev?.trial || false),
                    monthly: !isTrial ? true : (prev?.monthly || false),
                    badge: "Premium"
                }));
            } else {
                console.error("Supabase error:", error);
            }
        };
        updateSub();
    }
  }, [isConfirmed, hash, fid]);

  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'monthly'>('monthly');

  const handleSubscribe = () => {
     if (!address) return;
     const amount = selectedPlan === 'trial' ? "0.0003" : "0.005"; // Approx $1 and $19
     
     if (currency === 'ETH') {
         sendTransaction({
             to: process.env.NEXT_PUBLIC_PLATFORM_WALLET as `0x${string}`,
             value: parseEther(amount)
         });
     } else {
         writeContract({
             address: USDC_ADDRESS,
             abi: ERC20_ABI,
             functionName: 'transfer',
             args: [process.env.NEXT_PUBLIC_PLATFORM_WALLET as `0x${string}`, parseUnits(selectedPlan === 'trial' ? "1" : "19", 6)]
         });
     }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                Bot Assistant
            </CardTitle>
            <CardDescription>Chat with FrameCaster Bot to launch coins and more.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => sdk.actions.openUrl(`https://warpcast.com/~/compose?text=@framecaster%20/start&embeds[]=${process.env.NEXT_PUBLIC_APP_URL}`)}>
                <Bot className="mr-2 h-4 w-4" /> Start Chat
            </Button>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-blue-900/10 overflow-hidden relative">
          {subscriptionStatus?.badge === "Premium" && (
              <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Crown className="h-3 w-3" /> PREMIUM
              </div>
          )}
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  Premium Member
              </CardTitle>
              <CardDescription>
                  Unlock exclusive features and powers.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> Free Monthly Boosts
                  </li>
                  <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> Priority Listing
                  </li>
                  <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" /> Custom Themes
                  </li>
              </ul>

              {!subscriptionStatus?.monthly && (
                  <div className="bg-card/50 p-3 rounded-lg border space-y-3">
                      <div className="flex gap-2">
                          <Button 
                              variant={selectedPlan === 'trial' ? 'default' : 'outline'} 
                              size="sm" 
                              className="flex-1"
                              onClick={() => setSelectedPlan('trial')}
                              disabled={subscriptionStatus?.trial}
                          >
                              Trial ($1)
                          </Button>
                          <Button 
                              variant={selectedPlan === 'monthly' ? 'default' : 'outline'} 
                              size="sm" 
                              className="flex-1"
                              onClick={() => setSelectedPlan('monthly')}
                          >
                              Monthly ($19)
                          </Button>
                      </div>
                      
                      <div className="flex gap-2">
                          <Button 
                              variant={currency === 'ETH' ? 'secondary' : 'ghost'} 
                              size="sm" 
                              className="h-6 text-xs flex-1"
                              onClick={() => setCurrency('ETH')}
                          >
                              ETH
                          </Button>
                          <Button 
                              variant={currency === 'USDC' ? 'secondary' : 'ghost'} 
                              size="sm" 
                              className="h-6 text-xs flex-1"
                              onClick={() => setCurrency('USDC')}
                          >
                              USDC
                          </Button>
                      </div>

                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                        onClick={handleSubscribe}
                        disabled={isPending || isConfirming}
                      >
                          {isPending || isConfirming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                          Subscribe with {currency}
                      </Button>
                  </div>
              )}
          </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-500">
              <Bot className="h-5 w-5" />
              Forgecast Bot
            </CardTitle>
            <CardDescription>
              Interact with our bot on Farcaster.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" asChild>
              <a href="https://warpcast.com/~/compose?text=%2Flaunch%20Name%20Ticker&embeds[]=" target="_blank" rel="noopener noreferrer">
                Open Bot <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="https://docs.zora.co" target="_blank" rel="noopener noreferrer">
                <BookOpen className="mr-2 h-4 w-4" />
                Documentation
              </a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="https://warpcast.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Warpcast
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
