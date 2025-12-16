const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function main() {
    console.log("Kullanıcı ekleniyor...");

    try {
        const admin = await prisma.user.upsert({
            where: { email: "oskitocan55@gmail.com" },
            update: { isActive: true },
            create: {
                email: "oskitocan55@gmail.com",
                fullName: "Osman Can Çetiner",
                role: "ADMIN",
                isActive: true,
            },
        });
        console.log("✅ Admin eklendi:", admin.email);
    } catch (e) {
        console.error("Hata:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
