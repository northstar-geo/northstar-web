// The generated module is absent on a clean checkout until OpenNext builds it.
declare module "*.open-next/worker.js" {
  const handler: {
    fetch(
      request: Request,
      env: Record<string, unknown>,
      ctx: unknown,
    ): Promise<Response>;
  };
  export default handler;
}
