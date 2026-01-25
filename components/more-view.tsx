import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Bot, Zap } from "lucide-react";

export function MoreView() {
  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">More</h2>
        <p className="text-sm text-muted-foreground">
          Additional tools and resources.
        </p>
      </div>

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
