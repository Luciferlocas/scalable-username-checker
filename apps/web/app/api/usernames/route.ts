"use server";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const usernames = await fetch(process.env.NEXT_API_URL + "/api/usernames");
    const data = await usernames.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
