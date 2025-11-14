// https://www.better-auth.com/docs/integrations/next#for-nextjs-release-1520-and-above
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "#lib/auth.ts";

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session && !request.url.includes("/sign-in")) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

	if (session && request.url.includes("/sign-in")) {
		return NextResponse.redirect(new URL("/", request.url));
	}

    return NextResponse.next();
}

export const config = {
	// all routes have to be protected, adjust the matcher as needed
	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
