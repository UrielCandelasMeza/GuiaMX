import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Conectado a la bd");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`> An error has ocurred: ${error.message}`);
    }
    throw new Error(`> An error has ocurred: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
};

export { prisma, connectDB };
