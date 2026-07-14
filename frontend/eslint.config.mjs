// @ts-check
import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next@14 only ships a legacy (.eslintrc-style) config, not a
// native flat config — FlatCompat bridges it into the flat format this file
// uses. Importing eslint-config-next's export directly (as a plain array)
// crashes @rushstack/eslint-patch's module-resolution check outside of
// next lint's own invocation path, which is what broke `eslint`/`next lint`
// in any non-interactive shell (e.g. CI) while still looking fine in editor
// integrations that resolve config differently.
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**"] },
  ...compat.extends("next"),
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/context/AuthContext",
              message:
                "Use the single public auth/wallet surface from '@/contexts' instead.",
            },
            {
              name: "@/contexts/AuthContext",
              message:
                "Import useAuth/AuthProvider from '@/contexts' to keep one public surface.",
            },
            {
              name: "@/contexts/WalletProvider",
              message:
                "Import useWallet/useWalletConfig/WalletProvider from '@/contexts' to keep one public surface.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
