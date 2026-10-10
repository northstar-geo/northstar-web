// Generated only by the approved OpenNext build; never patched in place.
import handler from "./.open-next/worker.js";
import { protectedPreview } from "./lib/preview-auth";

const worker = {
  fetch(request: Request, env: Record<string, unknown>, ctx: unknown) {
    return protectedPreview(request, env, (safeRequest, safeEnv) =>
      handler.fetch(safeRequest, safeEnv, ctx),
    );
  },
};
export default worker;
