import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
// @ts-ignore
import { createCoin, CreateConstants } from '@zoralabs/coins-sdk';

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY!,
});

const neynarClient = new NeynarAPIClient(config);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verify event type
    if (!body || body.type !== 'cast.created') {
      return NextResponse.json({ message: 'Ignored event type' });
    }

    const cast = body.data;
    const castText = cast.text;
    const author = cast.author;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://framecaster-jade.vercel.app';

    // Helper to reply
    const reply = async (message: string) => {
        try {
            await neynarClient.publishCast({
                signerUuid: 'fc1eb588-56af-472b-a6d2-78acb1f682d4',
                text: message,
                parent: cast.hash
            });
        } catch (e) {
            console.error("Reply error:", e);
        }
    };

    // Helper to deploy
    const deployCoin = async (name: string, ticker: string, imageUri: string, creatorAddress: string) => {
        // If we are deploying on behalf of the user via bot wallet (e.g. from /launch command where user doesn't sign)
        // Note: Ideally, for /launch, we might want the user to sign, but via webhook the bot signs.
        // The user prompt implies the bot does it: "Deploy coin using Zora code above (use bot wallet if needed)"
        
        if (!process.env.DEPLOYER_PRIVATE_KEY) {
            await reply("Error: Bot wallet not configured.");
            return null;
        }

        try {
            const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`);
            const walletClient = createWalletClient({
                account,
                chain: base,
                transport: http(process.env.BASE_RPC_URL)
            });
            const publicClient = createPublicClient({ 
                chain: base, 
                transport: http(process.env.BASE_RPC_URL) 
            });

            const args = {
                creator: account.address, // Bot is creator on chain, but we attribute to user in DB
                name: name,
                symbol: ticker,
                metadata: { type: "RAW_URI" as const, uri: imageUri },
                currency: CreateConstants.ContentCoinCurrencies.ETH,
                chainId: base.id,
                startingMarketCap: CreateConstants.StartingMarketCaps.LOW,
                platformReferrerAddress: process.env.NEXT_PUBLIC_PLATFORM_WALLET as `0x${string}`,
            };

            // @ts-ignore
            const result = await createCoin({ call: args, walletClient, publicClient });
            
            const txHash = result.hash;
            const coinAddress = result.address; // SDK might return address or we calculate/wait
            
            console.log(`Deployed coin: ${txHash}`);
            return { txHash, coinAddress };
        } catch (e: any) {
            console.error("Deploy error:", e);
            await reply(`Deploy failed: ${e.message}`);
            return null;
        }
    };

    if (castText.startsWith('/launch')) {
        // Parse name, ticker from text. Expected: /launch <name> <ticker>
        const parts = castText.split(' ');
        if (parts.length >= 3) {
            const name = parts[1];
            const ticker = parts[2].toUpperCase();
            const image = cast.embeds?.[0]?.url || author.pfp_url || "https://placehold.co/400";
            
            // Construct Frame URL
            const frameUrl = `${appUrl}/api/frame/launch?name=${encodeURIComponent(name)}&ticker=${encodeURIComponent(ticker)}&image=${encodeURIComponent(image)}&creator=${author.custody_address}`;
            
            await reply(`🚀 Ready to launch ${name} ($${ticker})! Pay 0.0004 ETH (~$1) to deploy.\n\n${frameUrl}`);
        }
    } else if (castText.includes('/coin profile') || castText.includes('/profile coin')) {
        // Fetch user profile coin
        const targetFid = cast.parent_author?.fid || author.fid; // Use parent author if reply, else self
        const { users } = await neynarClient.fetchBulkUsers({ fids: [targetFid] });
        const user = users[0];
        
        if (user) {
            const name = `${user.display_name} Coin`;
            const ticker = `$${user.username.toUpperCase()}`;
            const image = user.pfp_url || "https://placehold.co/400";
            
            const frameUrl = `${appUrl}/api/frame/launch?name=${encodeURIComponent(name)}&ticker=${encodeURIComponent(ticker)}&image=${encodeURIComponent(image)}&creator=${user.custody_address}`;
            
            await reply(`👤 Launching profile coin for @${user.username}!\n\n${frameUrl}`);
        }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Internal error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
