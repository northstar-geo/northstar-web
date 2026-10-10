import { timingSafeEqual } from "node:crypto";

type PreviewEnv = Record<string, unknown> & { PREVIEW_AUTH_PASSWORD?: string };

function protect(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("CDN-Cache-Control", "no-store");
  headers.set("Cloudflare-CDN-Cache-Control", "no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function authenticated(
  header: string | null,
  password: string,
): Promise<boolean> {
  if (!header || header.length > 8192) return false;
  const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(header);
  if (!match) return false;
  let supplied: Uint8Array<ArrayBuffer>;
  try {
    supplied = Uint8Array.from(atob(match[1]), (c) => c.charCodeAt(0));
  } catch {
    return false;
  }
  // Compare fixed-size digests with a platform timing-safe primitive. No password
  // length-dependent early return, secret cache, authentication dependency or log.
  const [actual, expected] = await Promise.all([
    crypto.subtle.digest("SHA-256", supplied),
    crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`founder:${password}`),
    ),
  ]);
  return timingSafeEqual(new Uint8Array(actual), new Uint8Array(expected));
}

// Diagnostic-only entry: no stage, flag, route or method enables public access.
export async function protectedPreview(
  request: Request,
  env: PreviewEnv,
  forward: (request: Request, env: PreviewEnv) => Promise<Response>,
): Promise<Response> {
  const password = env.PREVIEW_AUTH_PASSWORD;
  if (typeof password !== "string" || !password.trim()) {
    return protect(new Response("Service Unavailable", { status: 503 }));
  }
  try {
    if (
      !(await authenticated(request.headers.get("authorization"), password))
    ) {
      return protect(
        new Response("Unauthorized", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="OKELOM Preview"' },
        }),
      );
    }
    const headers = new Headers(request.headers);
    headers.delete("authorization");
    headers.delete("proxy-authorization");
    const applicationEnv = { ...env };
    delete applicationEnv.PREVIEW_AUTH_PASSWORD;
    return protect(
      await forward(new Request(request, { headers }), applicationEnv),
    );
  } catch {
    // Never emit credentials, URL values or downstream error text.
    return protect(new Response("Internal Server Error", { status: 500 }));
  }
}
