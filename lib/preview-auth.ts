type PreviewEnv = Record<string, unknown> & {
  PREVIEW_AUTH_PASSWORD?: string;
  PREVIEW_BUILD_ID?: string;
};

export type PreviewRuntimePhase =
  | "auth-runtime"
  | "application-import"
  | "application-fetch";

type PreviewAuthRuntime = {
  digest(input: Uint8Array<ArrayBuffer>): Promise<ArrayBuffer>;
  timingSafeEqual(
    actual: Uint8Array<ArrayBuffer>,
    expected: Uint8Array<ArrayBuffer>,
  ): Promise<boolean>;
};

type ProtectedPreviewOptions = { authRuntime?: PreviewAuthRuntime };

export class PreviewRuntimeFailure extends Error {
  constructor(readonly phase: PreviewRuntimePhase) {
    super("Preview runtime failure");
    this.name = "PreviewRuntimeFailure";
  }
}

function validBuildId(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function validPhase(value: unknown): value is PreviewRuntimePhase {
  return (
    value === "auth-runtime" ||
    value === "application-import" ||
    value === "application-fetch"
  );
}

function protect(
  response: Response,
  buildId?: unknown,
  phase?: PreviewRuntimePhase,
): Response {
  const headers = new Headers(response.headers);
  headers.delete("X-Okelom-Build-Id");
  headers.delete("X-Okelom-Diagnostic-Phase");
  headers.set("Cache-Control", "no-store");
  headers.set("CDN-Cache-Control", "no-store");
  headers.set("Cloudflare-CDN-Cache-Control", "no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("X-Content-Type-Options", "nosniff");
  if (validBuildId(buildId)) headers.set("X-Okelom-Build-Id", buildId);
  if (validPhase(phase)) headers.set("X-Okelom-Diagnostic-Phase", phase);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function authenticated(
  header: string | null,
  password: string,
  runtime: PreviewAuthRuntime,
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
  try {
    // Compare fixed-size digests with a platform timing-safe primitive. No
    // password length-dependent early return, secret cache, dependency or log.
    const [actual, expected] = await Promise.all([
      runtime.digest(supplied),
      runtime.digest(new TextEncoder().encode(`founder:${password}`)),
    ]);
    return await runtime.timingSafeEqual(
      new Uint8Array(actual),
      new Uint8Array(expected),
    );
  } catch {
    throw new PreviewRuntimeFailure("auth-runtime");
  }
}

const defaultAuthRuntime: PreviewAuthRuntime = {
  digest(input) {
    return crypto.subtle.digest("SHA-256", input);
  },
  async timingSafeEqual(actual, expected) {
    const nodeCrypto = await import("node:crypto");
    return nodeCrypto.timingSafeEqual(actual, expected);
  },
};

// Diagnostic-only entry: no stage, flag, route or method enables public access.
export async function protectedPreview(
  request: Request,
  env: PreviewEnv,
  forward: (request: Request, env: PreviewEnv) => Promise<Response>,
  options: ProtectedPreviewOptions = {},
): Promise<Response> {
  const password = env.PREVIEW_AUTH_PASSWORD;
  const buildId = env.PREVIEW_BUILD_ID;
  if (typeof password !== "string" || !password.trim()) {
    return protect(
      new Response("Service Unavailable", { status: 503 }),
      buildId,
    );
  }
  try {
    if (
      !(await authenticated(
        request.headers.get("authorization"),
        password,
        options.authRuntime ?? defaultAuthRuntime,
      ))
    ) {
      return protect(
        new Response("Unauthorized", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="OKELOM Preview"' },
        }),
        buildId,
      );
    }
    const headers = new Headers(request.headers);
    headers.delete("authorization");
    headers.delete("proxy-authorization");
    const applicationEnv = { ...env };
    delete applicationEnv.PREVIEW_AUTH_PASSWORD;
    delete applicationEnv.PREVIEW_BUILD_ID;
    return protect(
      await forward(new Request(request, { headers }), applicationEnv),
      buildId,
    );
  } catch (error) {
    // Never emit credentials, URL values or downstream error text.
    return protect(
      new Response("Internal Server Error", { status: 500 }),
      buildId,
      error instanceof PreviewRuntimeFailure ? error.phase : undefined,
    );
  }
}
