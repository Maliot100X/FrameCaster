import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
// @ts-ignore
import { createCoin } from '@zoralabs/coins-sdk';

// Initialize Neynar
const neynarClient = new NeynarAPIClient(new Configuration({ apiKey: process.env.NEYNAR_API_KEY! }));
const SIGNER_UUID = 'fc1eb588-56af-472b-a6d2-78acb1f682d4';

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org'),
});

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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://framecaster-jade.vercel.app';

    // Helper to reply
    const reply = async (message: string) => {
        try {
            await neynarClient.publishCast({
                signerUuid: SIGNER_UUID,
                text: message,
                parent: cast.hash
            });
        } catch (e) {
            console.error("Reply error:", e);
        }
    };

    // Helper to deploy
    const deployCoin = async (name: string, ticker: string, imageUri: string) => {
        if (!process.env.DEPLOYER_PRIVATE_KEY) {
            await reply("Error: Bot wallet not configured (DEPLOYER_PRIVATE_KEY missing).");
            return null;
        }

        try {
            const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`);
            const walletClient = createWalletClient({
                account,
                chain: base,
                transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org')
            });

            // @ts-ignore
            const result = await createCoin({
                call: {
                    creator: account.address,
                    name,
                    symbol: ticker,
                    metadata: { type: "RAW_URI", uri: imageUri },
                    chainId: 8453,
                    payoutRecipientOverride: process.env.NEXT_PUBLIC_PLATFORM_WALLET as `0x${string}`,
                    currency: 'ZORA'
                },
                walletClient,
                publicClient
            });

            // The result contains the transaction hash
            const txHash = result.hash;
            const coinAddress = result.address;

            console.log(`Deployed coin: ${txHash} at ${coinAddress}`);
            return { txHash, coinAddress };
        } catch (e: any) {
            console.error("Deploy error:", e);
            await reply(`Deploy failed: ${e.message}`);
            return null;
        }
    };

    // 2. Parse command: /launch <Name> <Ticker>
    const launchMatch = text.match(/^\/launch\s+(\w+)\s+(\w+)/i);
    if (launchMatch) {
        const name = launchMatch[1];
        const ticker = launchMatch[2].toUpperCase();
        // Get image from embeds or author pfp
        const image = cast.embeds?.[0]?.url || author.pfp_url || "https://placehold.co/400";
        
        console.log(`[Webhook] Launch request: ${name} ($${ticker}) by ${author.username}`);

        const result = await deployCoin(name, ticker, image);
        if (result) {
            // Use real address if available, else fallback (though fallback is inaccurate)
            const coinAddr = result.coinAddress || ("0x" + result.txHash.slice(2, 42)); 

            await supabase.from('graduated_coins').insert({
                coin_address: coinAddr,
                name: name,
                ticker: ticker,
                image_uri: image,
                creator_fid: author.fid,
                created_at: new Date().toISOString()
            });

            await reply(`Launched ${name} ($${ticker})! View: ${appUrl}/coin/${coinAddr}\n\nCommands:\n/launch <name> <ticker>\n/coin profile\n\nAlso launch in app!`);
        }
        return NextResponse.json({ success: true, message: `Processed /launch` });
    }

    // 3. Parse command: /coin profile
    if (text.match(/^\/coin\s+profile/i)) {
        console.log(`[Webhook] Profile launch request by ${author.username}`);
        
        const name = author.display_name || author.username;
        const ticker = author.username.slice(0, 4).toUpperCase();
        const image = author.pfp_url || "https://placehold.co/400";

        const result = await deployCoin(name, ticker, image);
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
        return NextResponse.json({ success: true, message: `Processed /coin profile` });
    }

    return NextResponse.json({ message: 'No command found' });
  } catch (error) {
    console.error("[Webhook] Internal error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
