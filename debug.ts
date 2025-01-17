import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

console.log('Available Prisma models:', Object.keys(prisma)) 