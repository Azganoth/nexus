import "dotenv/config";

import { prisma } from "@repo/database";
import { createServer } from "@src/server";

const port = process.env.PORT || 3001;
const server = createServer();

server.listen(port, () => {
  console.log(`api running on ${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
