import { prisma, VisitorCount } from "./client";

const DEFAULT_VISITOR_COUNT = {
  id: "singleton",
  count: 0,
} satisfies VisitorCount;

(async () => {
  try {
    await prisma.visitorCount.upsert({
      where: {
        id: DEFAULT_VISITOR_COUNT.id,
      },
      update: {
        ...DEFAULT_VISITOR_COUNT,
      },
      create: {
        ...DEFAULT_VISITOR_COUNT,
      },
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
