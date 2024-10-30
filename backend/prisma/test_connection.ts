import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test_connection() {
    try {
        await prisma.$connect();
        console.log("Connected to database successfully!");
    } catch (error) {
        console.error("Error connecting to database:" , error);
    } finally {
        await prisma.$disconnect();
    }
}

test_connection();
