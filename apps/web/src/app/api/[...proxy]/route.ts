import { API_URL } from "$/lib/constants";
import { type NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const url = `${API_URL}${pathname.replace("/api", "")}${search}`;

  const backendRequest = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.body,
    duplex: "half",
  });

  try {
    const backendResponse = await fetch(backendRequest);

    const response = new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: backendResponse.headers,
    });

    const setCookie = backendResponse.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json(
      { error: "Proxy failed to connect to the backend service." },
      { status: 502 },
    );
  }
}

export {
  handler as DELETE,
  handler as GET,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
