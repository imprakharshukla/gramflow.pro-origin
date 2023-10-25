import {NextResponse} from "next/server";
import {getUserData} from "@gramflow/db/dbHelper";
import {z} from "zod";
import * as process from "process";
import {trackingMainResponseSchema, trackingRequestSchema} from "~/lib/trackingHelper";


export async function GET(req: Request) {
  const {searchParams} = new URL(req.url)
  const awb = searchParams.get('awb') ?? ""
  console.log({awb})


  try {

    const requestSchema = z.string().min(1).parse(awb)


    const requestData = {
      data: {
        awb_number_list: requestSchema,
        access_token: process.env.ITL_ACCESS_KEY,
        secret_key: process.env.ITL_SECRET_KEY,
      },
    };

    const validatedRequest = trackingRequestSchema.parse(requestData);

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedRequest),
    };

    const req = await fetch('https://api.ithinklogistics.com/api_v3/order/track.json', requestOptions)
    if (!req.ok) {
      return NextResponse.json({"error": "Something went wrong", status: 500})
    }
    // Parse and validate the response data
    const responseData = await req.json();
    console.log({responseData: JSON.stringify(responseData)})
    const validatedResponse = trackingMainResponseSchema.parse(responseData);
    console.log(validatedResponse);
    return NextResponse.json(validatedResponse, {status: 200})
  } catch
    (e) {
    console.log({e})
    return NextResponse.json({"error": "Something went wrong", status: 500})
  }
}
