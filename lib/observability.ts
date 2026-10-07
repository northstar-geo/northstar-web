export type ServerErrorContext = {
  error: unknown;
  digest?: string;
  method?: string;
  routePath?: string;
  routeType?: string;
};

type ServerErrorEvent = {
  event: "zipora.server_error";
  errorName: string;
  digest?: string;
  method?: string;
  routePath?: string;
  routeType?: string;
};

export function serverErrorEvent(context: ServerErrorContext): ServerErrorEvent {
  return {
    event: "zipora.server_error",
    errorName: context.error instanceof Error ? context.error.name : "NonError",
    ...(context.digest ? { digest: context.digest.slice(0, 128) } : {}),
    ...(context.method ? { method: context.method } : {}),
    ...(context.routePath ? { routePath: context.routePath } : {}),
    ...(context.routeType ? { routeType: context.routeType } : {}),
  };
}

export function reportServerError(context: ServerErrorContext): void {
  // Intentionally omit request paths, headers, error messages, and stacks.
  // Those fields can contain searches, credentials, or provider-sensitive data.
  console.error(JSON.stringify(serverErrorEvent(context)));
}
