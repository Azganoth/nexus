import { env } from "$/config/env"; // NOTE: keep on top to load .env first

import { createServer } from "$/server";
import { prisma } from "@repo/database";

const server = createServer();
server.listen(env.PORT, () => {
  console.log(`API is running on http://localhost:${env.PORT}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
