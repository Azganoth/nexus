import "dotenv/config";

import { prisma } from "@repo/database";
import { PORT } from "@src/constants";
import { createServer } from "@src/server";

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
