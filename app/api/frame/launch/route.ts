import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
// @ts-ignore
import { createCoin, CreateConstants } from '@zoralabs/coins-sdk';
import { supabase } from '@/lib/supabase';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://framecaster-jade.vercel.app';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get('name') || 'Coin';
    const ticker = searchParams.get('ticker') || 'COIN';
    const image = searchParams.get('image') || `${appUrl}/og.png`;
    const creator = searchParams.get('creator') || '';

    // Pass params to next step
    const txUrl = `${appUrl}/api/frame/launch/tx`;
    const postUrl = `${appUrl}/api/frame/launch?name=${encodeURIComponent(name)}&ticker=${encodeURIComponent(ticker)}&image=${encodeURIComponent(image)}&creator=${encodeURIComponent(creator)}`;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${image}" />
        <meta property="fc:frame:button:1" content="Deploy ($1)" />
        <meta property="fc:frame:button:1:action" content="tx" />
        <meta property="fc:frame:button:1:target" content="${txUrl}" />
        <meta property="fc:frame:post_url" content="${postUrl}" />
        <meta property="og:image" content="${image}" />
        <title>Launch ${ticker}</title>
      </head>
      <body>
        <h1>Launch ${name} ($${ticker})</h1>
      </body>
    </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}

export async function POST(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get('name');
    const ticker = searchParams.get('ticker');
    const image = searchParams.get('image');
    const creator = searchParams.get('creator');
    
    const body = await req.json();
    const transactionId = body.untrustedData?.transactionId;

    if (transactionId && name && ticker) {
        // Payment confirmed (client side at least), now deploy
        try {
            if (!process.env.DEPLOYER_PRIVATE_KEY) throw new Error("Bot wallet missing");

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
                creator: creator || account.address, 
                name,
                symbol: ticker,
                metadata: { type: "RAW_URI" as const, uri: image || "" },
                currency: CreateConstants.ContentCoinCurrencies.ETH,
                chainId: base.id,
                startingMarketCap: CreateConstants.StartingMarketCaps.LOW,
                platformReferrerAddress: process.env.NEXT_PUBLIC_PLATFORM_WALLET as `0x${string}`,
            };

            // @ts-ignore
            const result = await createCoin({ call: args, walletClient, publicClient });
            const coinAddress = result.address || ("0x" + result.hash.slice(2, 42)); // Approximate if needed

             // Add to Supabase
             await supabase.from('graduated_coins').insert({
                 coin_address: coinAddress,
                 name: name,
                 ticker: ticker,
                 image_uri: image,
                 creator_fid: body.untrustedData.fid, // User FID from frame
                 created_at: new Date().toISOString()
             });

            const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:image" content="${image}" />
                <meta property="fc:frame:button:1" content="View Coin" />
                <meta property="fc:frame:button:1:action" content="link" />
                <meta property="fc:frame:button:1:target" content="${appUrl}/coin/${coinAddress}" />
                <title>Launched!</title>
              </head>
              <body><h1>Launched!</h1></body>
            </html>
            `;
            return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });

        } catch (e: any) {
            console.error("Deploy error:", e);
             const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:image" content="${image}" />
                <meta property="fc:frame:button:1" content="Retry" />
                <title>Error: ${e.message}</title>
              </head>
              <body><h1>Error</h1></body>
            </html>
            `;
            return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
        }
    }

    // Default if no txId
    return new NextResponse("Invalid request", { status: 400 });
}
