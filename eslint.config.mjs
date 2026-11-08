import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".opencode/**",
      "lint-report.txt",
      "replica/**",
      "docs/**",
      "public/**",
      "drizzle/**",
      "data/**",
    ],
  },
  {
    // React 19's compiler lint rules are stricter than this app's runtime needs.
    // These patterns (reading localStorage/matchMedia in an effect, closing menus
    // on route change, server-render dates) are deliberate and safe here.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
    },
  },
];

export default eslintConfig;
