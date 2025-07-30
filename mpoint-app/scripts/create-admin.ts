const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@ctnm.de';
  const password = 'test1234';
  const firstName = 'Admin';
  const lastName = 'User';

  // Passwort hashen
  const hashed = await bcrypt.hash(password, 10);

  // Prüfen, ob Admin schon existiert
  const exists = await prisma.admin.findUnique({ where: { email } });
  if (exists) {
    console.log('Admin-User existiert bereits.');
    return;
  }

  // Admin anlegen
  await prisma.admin.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
    },
  });

  console.log('Admin-User erfolgreich angelegt!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());