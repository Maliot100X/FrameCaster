"use client";

import { useState } from "react";
import { Home, Rocket, ShoppingBag, User, MoreHorizontal } from "lucide-react";
import { HomeView } from "@/components/home-view";
import { LaunchView } from "@/components/launch-view";
import { ShopView } from "@/components/shop-view";
import { ProfileView } from "@/components/profile-view";
import { MoreView } from "@/components/more-view";
import { cn } from "@/lib/utils";

export default function Page() {
  const [activeTab, setActiveTab] = useState<"home" | "launch" | "shop" | "profile" | "more">("home");

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === "home" && <HomeView />}
        {activeTab === "launch" && <LaunchView />}
        {activeTab === "shop" && <ShopView />}
        {activeTab === "profile" && <ProfileView />}
        {activeTab === "more" && <MoreView />}
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
          onClick={() => setActiveTab("more")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 h-full transition-colors",
            activeTab === "more" ? "text-primary" : "text-muted-foreground hover:text-primary/70"
          )}
        >
          <MoreHorizontal className={cn("h-6 w-6", activeTab === "more" && "fill-current")} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </div>
  );
}
