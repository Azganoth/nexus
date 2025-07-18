import { API_URL } from "$/lib/constants";
import type { ErrorResponse } from "@repo/shared/contracts";
import { NextResponse } from "next/server";

const excludedHeaders = [
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
];

async function handler(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const url = new URL(slug.join("/"), API_URL);
  request.headers.delete("accept-encoding");

  try {
    const response = await fetch(new Request(url, request));

    const status = response.status;
    const headers = new Headers();
    response.headers.forEach((value, key) => {
      if (!excludedHeaders.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    if (status === 204 || status === 304) {
      return new NextResponse(null, { status, headers });
    }

    // Read the entire body to avoid streaming lock.
    return NextResponse.json(await response.json(), { status, headers });
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json(
      {
        status: "error",
        code: "BAD_REQUEST",
        message: "Ocorreu algum problema entre a conexão do proxy com a API.",
      } satisfies ErrorResponse,
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
