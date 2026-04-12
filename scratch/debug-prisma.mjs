import pkg from '@prisma/client';
const { PrismaClient } = pkg;
console.log('PrismaClient Type:', typeof PrismaClient);
try {
  const p = new PrismaClient();
  console.log('Instance created successfully');
} catch (e) {
  console.log('Constructor error:', e.message);
  console.log('Full error name:', e.name);
}
