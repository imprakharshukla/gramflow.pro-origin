import {NextResponse} from "next/server";
import {getUserData} from "@acme/db/dbHelper";


export async function GET(req: Request) {
    const {searchParams} = new URL(req.url)
    const email = searchParams.get('email') ?? ""
    console.log({email})
    const user = await getUserData(email)
    console.log({user})
    return NextResponse.json(user, {status: 200})
}
