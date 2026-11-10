import { loadEnvFile } from "node:process";

// CLI scripts (migrate/seed) run outside Next.js, which loads .env itself.
// `.env.local` wins over `.env` so local development keeps using the local
// database even when `.env` holds production placeholders.
for (const file of [".env.local", ".env"]) {
  try {
    loadEnvFile(file);
  } catch {
    // File is optional; deployment environments provide real variables.
  }
}
