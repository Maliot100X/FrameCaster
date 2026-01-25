import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// This webhook handles Neynar "cast.created" events.
// If a cast contains "/launch Name Ticker", it triggers coin creation logic.
// For Phase 4, we primarily ensure it inserts into the Supabase 'graduated_coins' table
// so it appears in the app's "ForgeZone" (Graduated) tab.
// Actual on-chain deployment would require a server-side wallet with ETH.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Verify it's a cast.created event
    if (!body || body.type !== 'cast.created') {
      return NextResponse.json({ message: 'Ignored event type' });
    }

    const cast = body.data;
    const text = cast.text;
    const author = cast.author;

    // 2. Parse command: /launch <Name> <Ticker>
    // Regex: Start with /launch, space, Name (word), space, Ticker (word)
    const match = text.match(/^\/launch\s+(\w+)\s+(\w+)/i);

    if (match) {
        const name = match[1];
        const ticker = match[2].toUpperCase();

        console.log(`[Webhook] Launch request: ${name} ($${ticker}) by ${author.username} (${author.fid})`);

        // 3. Create Coin Record in Supabase
        // In a real production env, we would:
        // a) Check if user has enough balance/credits
        // b) Sign a transaction with a deployer wallet to create the coin on Zora/Base
        // c) Wait for receipt to get address
        
        // For this Phase 4 deliverable, we simulate the "success" by generating a deterministic-looking address
        // and saving it to Supabase so the UI updates immediately.
        
        // Mock Address generation (would be real contract address)
        const mockAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        const { error } = await supabase.from('graduated_coins').insert({
            coin_address: mockAddress,
            name: name,
            ticker: ticker,
            image_uri: author.pfp_url || "https://placehold.co/400",
            creator_fid: author.fid,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error("[Webhook] Supabase insert error:", error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        console.log(`[Webhook] Successfully launched ${name} ($${ticker})`);
        return NextResponse.json({ success: true, message: `Launched ${name} ($${ticker})` });
    }

    return NextResponse.json({ message: 'No command found' });
  } catch (error) {
    console.error("[Webhook] Internal error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
