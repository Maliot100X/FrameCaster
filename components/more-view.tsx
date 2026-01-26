import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen, Bot, Zap, Crown, Check, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import sdk from "@farcaster/miniapp-sdk";

export function MoreView() {
  const [fid, setFid] = useState<number>(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{trial: boolean, monthly: boolean, badge: string} | null>(null);

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

  const openBotChat = () => {
      // Open Warpcast compose with pre-filled text
      sdk.actions.openUrl("https://warpcast.com/~/compose?text=@maliotsol%20/start");
  };

  const openBotProfile = () => {
      // Open Bot Profile (assuming we know the handle or just search)
      sdk.actions.openUrl("https://warpcast.com/maliotsol");
  };

  return (
    <div className="flex flex-col h-full bg-background p-4 space-y-6 overflow-y-auto pb-24">
      <div className="px-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">More</h2>
      </div>

      <div className="space-y-4">
        {/* Bot Assistant Section */}
        <Card className="bg-card border-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Bot Assistant
                </CardTitle>
                <CardDescription>
                    Chat with Forgecast Bot to deploy coins, manage portfolio, and more.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button className="w-full gap-2" onClick={openBotChat}>
                    <MessageSquare className="w-4 h-4" />
                    Start Chat
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={openBotProfile}>
                    <ExternalLink className="w-4 h-4" />
                    Open Bot Profile
                </Button>
            </CardContent>
        </Card>

        {/* Resources Section */}
        <Card className="bg-card border-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Resources
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => sdk.actions.openUrl("https://docs.zora.co")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Zora Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => sdk.actions.openUrl("https://warpcast.com/~/channel/framecaster")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    FrameCaster Channel
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => sdk.actions.openUrl("https://github.com/Maliot100X/FrameCaster")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    GitHub Repo
                </Button>
            </CardContent>
        </Card>

        {/* Subscription Status (Display Only) */}
        {subscriptionStatus && (
            <Card className="bg-gradient-to-br from-primary/10 to-purple-900/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        Your Subscription
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                            {subscriptionStatus.badge}
                        </Badge>
                        {subscriptionStatus.monthly ? (
                            <span className="text-xs text-green-400">Monthly Active</span>
                        ) : (
                            <span className="text-xs text-yellow-400">Trial Active</span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Manage your subscription in the Shop tab.
                    </p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
