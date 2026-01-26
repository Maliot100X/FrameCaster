import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();
        
        // Basic response for now if no API key
        if (!process.env.OPENAI_API_KEY) {
             // Mock response for demo purposes
             await new Promise(resolve => setTimeout(resolve, 1000));
             return NextResponse.json({ 
                 role: 'assistant', 
                 content: "I am the Forgecast AI Assistant. I can help you deploy coins on Zora, manage your portfolio, and more. (API Key not configured, using mock mode)" 
             });
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are Forgecast AI, an expert on Zora, Farcaster, and Base. Help users launch coins and manage their portfolio." },
                    ...messages
                ]
            })
        });

        const data = await res.json();
        if (data.error) {
            throw new Error(data.error.message);
        }
        return NextResponse.json(data.choices[0].message);

    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return NextResponse.json({ 
            role: 'assistant', 
            content: `Error: ${error.message || "Something went wrong"}` 
        });
    }
}