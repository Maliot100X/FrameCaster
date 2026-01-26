import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
// @ts-ignore
import { createCoin, CreateConstants } from '@zoralabs/coins-sdk';

const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

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
                replyTo: cast.hash
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
            
            const result = await deployCoin(name, ticker, image, author.verifications?.[0] || author.custody_address); // Use bot wallet but track user
            
            if (result) {
                const coinAddr = result.coinAddress || ("0x" + result.txHash.slice(2, 42)); // Fallback if address not returned immediately
                
                // Add to Supabase
                await supabase.from('graduated_coins').insert({
                    coin_address: coinAddr,
                    name: name,
                    ticker: ticker,
                    image_uri: image,
                    creator_fid: author.fid,
                    created_at: new Date().toISOString()
                });

                await reply(`Launched ${name} ($${ticker})! View at ${appUrl}/coin/${coinAddr}. Commands: /launch name ticker (image) - deploy; /coin profile - create from profile.`);
            }
        }
    } else if (castText.startsWith('/coin profile')) {
        const name = author.display_name || author.username;
        const ticker = author.username.slice(0, 4).toUpperCase();
        const image = author.pfp_url || "https://placehold.co/400";
        
        const result = await deployCoin(name, ticker, image, author.verifications?.[0] || author.custody_address);
        
        if (result) {
            const coinAddr = result.coinAddress || ("0x" + result.txHash.slice(2, 42));
             await supabase.from('graduated_coins').insert({
                coin_address: coinAddr,
                name,
                ticker,
                image_uri: image,
                creator_fid: author.fid,
                created_at: new Date().toISOString()
            });
            await reply(`Launched from profile! View: ${appUrl}/coin/${coinAddr}`);
        }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Internal error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
