import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const api = env.VITE_API_BASE_URL ? new URL(env.VITE_API_BASE_URL) : null;
  if (command === "build" && api && api.protocol !== "https:") throw new Error("Production API requires HTTPS");
  return {
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react(), {
    name: "security-meta",
    transformIndexHtml() {
      if (command !== "build") return [];
      const policy = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' ${api?.origin || ""}; object-src 'none'; base-uri 'self'; form-action 'self'`;
      return [
        { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: policy }, injectTo: "head-prepend" },
        { tag: "meta", attrs: { name: "referrer", content: "strict-origin-when-cross-origin" }, injectTo: "head-prepend" },
      ];
    },
  }],
  server: {
    port: 5173,
  },
};
});
