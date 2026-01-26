import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://framecaster-jade.vercel.app";

  // Return a frame response
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${appUrl}/vercel.svg" />
        <meta property="fc:frame:button:1" content="Launch App" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="${appUrl}" />
        <title>Launch Coin</title>
      </head>
      <body>
        <h1>Launch Coin</h1>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}

export async function GET(req: NextRequest) {
  // Handle GET request if needed (e.g., if someone visits the URL directly)
  return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || "/");
}
