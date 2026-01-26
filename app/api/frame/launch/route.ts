import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { supabase } from '@/lib/supabase';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://framecaster-jade.vercel.app';

const ZORA_FACTORY_ADDRESS = "0x777777751622c0d3258f214F9DF38E35BF45baF3";
const ZORA_FACTORY_ABI = [
  {
    "inputs": [
      { "name": "payoutRecipient", "type": "address" },
      { "name": "owners", "type": "address[]" },
      { "name": "uri", "type": "string" },
      { "name": "name", "type": "string" },
      { "name": "symbol", "type": "string" },
      { "name": "platformReferrer", "type": "address" },
      { "name": "currency", "type": "address" },
      { "name": "tickLower", "type": "int24" },
      { "name": "orderSize", "type": "uint256" }
    ],
    "name": "deploy",
    "outputs": [
      { "name": "", "type": "address" },
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

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

            const payoutRecipient = creator as `0x${string}` || account.address;
            
            // Simulate first to get the address
            const { request, result } = await publicClient.simulateContract({
                address: ZORA_FACTORY_ADDRESS,
                abi: ZORA_FACTORY_ABI,
                functionName: 'deploy',
                account,
                args: [
                    payoutRecipient, // payoutRecipient
                    [payoutRecipient], // owners
                    image || "", // uri - using image URL as metadata URI for quick launch
                    name,
                    ticker,
                    process.env.NEXT_PUBLIC_PLATFORM_WALLET as `0x${string}` || account.address, // platformReferrer
                    "0x0000000000000000000000000000000000000000", // currency (ETH)
                    -199200, // tickLower
                    0n // orderSize
                ],
                value: 0n
            });

            const coinAddress = result[0];
            
            // Deploy directly via contract using the simulated request
            const hash = await walletClient.writeContract(request);

            // Wait for receipt to confirm
            // For frames, we want to return quickly, but we also want to verify.
            // Since we need to return the next frame, we can just return success and let the indexer pick it up.
            // But we should store the hash.

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
