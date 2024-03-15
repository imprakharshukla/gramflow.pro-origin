import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import jwt from 'jsonwebtoken';
import { env } from '~/env.mjs';
export async function GET(req: NextRequest) {
    const token = await getToken({
        req,
        secret: env.NEXTAUTH_SECRET,
    })
    const jwtToken = jwt.sign({
        ...token
    }, env.NEXTAUTH_SECRET, {
        algorithm: "HS256",
    })
    return NextResponse.json({ token: jwtToken })
}