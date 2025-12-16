const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'oskitocan55@gmail.com' },
        update: {},
        create: {
            email: 'oskitocan55@gmail.com',
            fullName: 'Osman Can',
            role: 'ADMIN',
            isActive: true,
        },
    });
    console.log('✅ Kullanıcı eklendi:', user);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
