// Generated only by the approved OpenNext build; never patched in place.
import { createProtectedWorker } from "./lib/preview-worker";

// Keep the authentication layer executable even when the generated application
// module cannot initialize in a target runtime. The loader is cached by the
// module system after the first successful import.
const worker = createProtectedWorker(async () => {
  const applicationModule = await import("./.open-next/worker.js");
  return applicationModule.default;
});
export default worker;
