"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function AIChatView() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm your Zora & Base assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg] })
            });
            
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background pb-20">
            <div className="p-4 border-b flex items-center gap-2 bg-muted/20">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="font-bold text-lg bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">AI Assistant</h2>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4 pb-4">
                    {messages.map((m, i) => (
                        <div key={i} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                m.role === 'user' ? "bg-blue-500 text-white border-blue-600" : "bg-purple-100 text-purple-600 border-purple-200"
                            )}>
                                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>
                            <div className={cn(
                                "rounded-2xl p-3 max-w-[85%] text-sm shadow-sm",
                                m.role === 'user' ? "bg-blue-500 text-white rounded-tr-none" : "bg-muted rounded-tl-none"
                            )}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 border border-purple-200">
                                <Bot className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="bg-muted rounded-2xl rounded-tl-none p-3 flex items-center">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
                <div className="flex gap-2 relative">
                    <Input 
                        placeholder="Ask about deploying, coins, or Base..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="pr-10"
                    />
                    <Button 
                        onClick={handleSend} 
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="absolute right-0 top-0 h-full rounded-l-none"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}