import "dotenv/config";

import { PORT } from "$/constants";
import { createServer } from "$/server";
import { prisma } from "@repo/database";

const server = createServer();
server.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
