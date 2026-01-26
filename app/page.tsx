"use client";

import { useState } from "react";
import { Home, Rocket, ShoppingBag, User, MoreHorizontal, Sparkles } from "lucide-react";
import { HomeView } from "@/components/home-view";
import { LaunchView } from "@/components/launch-view";
import { ShopView } from "@/components/shop-view";
import { ProfileView } from "@/components/profile-view";
import { AIChatView } from "@/components/ai-chat";
import { cn } from "@/lib/utils";

export default function Page() {
  const [activeTab, setActiveTab] = useState<"home" | "launch" | "shop" | "profile" | "chat">("home");

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === "home" && <HomeView />}
        {activeTab === "launch" && <LaunchView />}
        {activeTab === "shop" && <ShopView />}
        {activeTab === "profile" && <ProfileView />}
        {activeTab === "chat" && <AIChatView />}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="h-16 border-t bg-background/80 backdrop-blur-md grid grid-cols-5 items-center px-2 z-50 pb-safe">
        <button
          onClick={() => setActiveTab("home")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 h-full transition-colors",
            activeTab === "home" ? "text-primary" : "text-muted-foreground hover:text-primary/70"
          )}
        >
          <Home className={cn("h-6 w-6", activeTab === "home" && "fill-current")} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("launch")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 h-full transition-colors",
            activeTab === "launch" ? "text-primary" : "text-muted-foreground hover:text-primary/70"
          )}
        >
          <Rocket className={cn("h-6 w-6", activeTab === "launch" && "fill-current")} />
          <span className="text-[10px] font-medium">Launch</span>
        </button>

        <button
          onClick={() => setActiveTab("shop")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 h-full transition-colors",
            activeTab === "shop" ? "text-primary" : "text-muted-foreground hover:text-primary/70"
          )}
        >
          <ShoppingBag className={cn("h-6 w-6", activeTab === "shop" && "fill-current")} />
          <span className="text-[10px] font-medium">Shop</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 h-full transition-colors",
            activeTab === "profile" ? "text-primary" : "text-muted-foreground hover:text-primary/70"
          )}
        >
          <User className={cn("h-6 w-6", activeTab === "profile" && "fill-current")} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 h-full transition-colors",
            activeTab === "chat" ? "text-primary" : "text-muted-foreground hover:text-primary/70"
          )}
        >
          <Sparkles className={cn("h-6 w-6", activeTab === "chat" && "fill-current")} />
          <span className="text-[10px] font-medium">AI Chat</span>
        </button>
      </nav>
    </div>
  );
}
