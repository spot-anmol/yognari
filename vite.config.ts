// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Static site generation: prerender every reachable route to fully-rendered HTML at build
    // time. This lets the app be hosted as pure static files (e.g. Firebase Hosting on the free
    // Spark plan) with no server, while keeping full SEO/first-paint. Output lands in dist/client.
    // (Done WITHOUT forcing the nitro deploy plugin, so Lovable's own builds are unaffected.)
    prerender: { enabled: true, crawlLinks: true },
  },
});
