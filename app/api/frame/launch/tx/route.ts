import { NextRequest, NextResponse } from 'next/server';
import { parseEther } from 'viem';

export async function POST(req: NextRequest) {
    const wallet = process.env.NEXT_PUBLIC_PLATFORM_WALLET;
    if (!wallet) {
        return NextResponse.json({ message: "Configuration error" }, { status: 500 });
    }

    return NextResponse.json({
        chainId: "eip155:8453", // Base
        method: "eth_sendTransaction",
        params: {
            abi: [],
            to: wallet,
            value: parseEther("0.0004").toString(),
            data: "0x",
        },
    });
}
