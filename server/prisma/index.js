// const { PrismaClient } = require('@prisma/client');
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default prisma;