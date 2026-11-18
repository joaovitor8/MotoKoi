import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "referencias/**", // material de referência, não é código do site
    ".playwright-mcp/**", // capturas e scripts de comparação visual (temporários)
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Pastas de referência, fora do site:
    "motokoi-site/**",
    "outros/**",
  ]),
]);

export default eslintConfig;
