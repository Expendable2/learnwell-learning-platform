import { closeStore, initializeStore } from "./store.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run production database migrations.");
}

try {
  await initializeStore();
} finally {
  await closeStore();
}
