// Local-test entry only. Exercises the real wrapper and OpenNext handler, then
// reports presence booleans, never a credential or environment dump.
import process from "node:process";
import worker from "../../custom-worker";

const probe = {
  async fetch(request: Request, env: Record<string, unknown>, ctx: unknown) {
    const response = await worker.fetch(request, env, ctx);
    await response.arrayBuffer();
    return Response.json({
      applicationStatus: response.status,
      runtimeSecretVisible: Object.hasOwn(process.env, "PREVIEW_AUTH_PASSWORD"),
      runtimeBuildIdVisible: Object.hasOwn(process.env, "PREVIEW_BUILD_ID"),
      previewStage: process.env.RELEASE_STAGE,
    });
  },
};
export default probe;
