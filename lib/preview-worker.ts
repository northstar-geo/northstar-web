import {
  PreviewRuntimeFailure,
  protectedPreview,
} from "./preview-auth";

type ApplicationHandler = {
  fetch(
    request: Request,
    env: Record<string, unknown>,
    ctx: unknown,
  ): Promise<Response>;
};

export function createProtectedWorker(
  loadHandler: () => Promise<ApplicationHandler>,
) {
  return {
    async fetch(
      request: Request,
      env: Record<string, unknown>,
      ctx: unknown,
    ) {
      return protectedPreview(request, env, async (safeRequest, safeEnv) => {
        let handler: ApplicationHandler;
        try {
          handler = await loadHandler();
        } catch {
          throw new PreviewRuntimeFailure("application-import");
        }
        try {
          const response = await handler.fetch(safeRequest, safeEnv, ctx);
          if (response.status >= 500) {
            throw new PreviewRuntimeFailure("application-fetch");
          }
          return response;
        } catch {
          throw new PreviewRuntimeFailure("application-fetch");
        }
      });
    },
  };
}
