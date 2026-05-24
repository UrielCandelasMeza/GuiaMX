import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Conectado a la bd");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error conectando a BD: ${error.message}`);
      throw error;
    }
    console.error(`Error conectando a BD: ${error}`);
    throw error;
  }
};
