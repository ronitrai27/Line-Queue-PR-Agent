// Set up Prisma Client
// Now that you have a database with some initial data, you can set up Prisma Client and connect it to your database.
// This is given in Docs....

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
// console.log(prisma)
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// new console 
// openai key=SK_67er3uyrfurduc8

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export default prisma;
