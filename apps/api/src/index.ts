import "dotenv/config";

import { createServer } from "@src/server";

const port = process.env.PORT || 5001;
const server = createServer();

server.listen(port, () => {
  console.log(`api running on ${port}`);
});
