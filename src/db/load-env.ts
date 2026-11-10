import { loadEnvFile } from "node:process";

// CLI scripts (migrate/seed) run outside Next.js, which loads .env itself.
try {
  loadEnvFile(".env");
} catch {
  // .env is optional; deployment environments provide real variables.
}
