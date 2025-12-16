import { prisma } from "../src/lib/prisma";

async function main() {
    console.log("🌱 Seed işlemi başlıyor...");

    // Admin kullanıcısı oluştur
    const admin = await prisma.user.upsert({
        where: { email: "admin@okul.edu.tr" },
        update: {},
        create: {
            email: "admin@okul.edu.tr",
            fullName: "Sistem Yöneticisi",
            role: "ADMIN",
            isActive: true,
        },
    });
    console.log("✅ Admin oluşturuldu:", admin.email);

    // Manager oluştur
    const manager = await prisma.user.upsert({
        where: { email: "mudur.yrd@okul.edu.tr" },
        update: {},
        create: {
            email: "mudur.yrd@okul.edu.tr",
            fullName: "Ahmet Demir",
            role: "MANAGER",
            isActive: true,
        },
    });
    console.log("✅ Müdür Yardımcısı oluşturuldu:", manager.email);

    // Lecturer oluştur
    const lecturer = await prisma.user.upsert({
        where: { email: "ogretim.gor@okul.edu.tr" },
        update: {},
        create: {
            email: "ogretim.gor@okul.edu.tr",
            fullName: "Dr. Ayşe Yılmaz",
            role: "LECTURER",
            isActive: true,
        },
    });
    console.log("✅ Öğretim Görevlisi oluşturuldu:", lecturer.email);

    // Ders oluştur
    const course1 = await prisma.course.upsert({
        where: { code: "MAT101" },
        update: {},
        create: {
            code: "MAT101",
            name: "Matematik I",
            lecturerId: lecturer.id,
        },
    });
    console.log("✅ Ders oluşturuldu:", course1.code);

    const course2 = await prisma.course.upsert({
        where: { code: "BIL102" },
        update: {},
        create: {
            code: "BIL102",
            name: "Programlamaya Giriş",
            lecturerId: lecturer.id,
        },
    });
    console.log("✅ Ders oluşturuldu:", course2.code);

    // Örnek rapor oluştur
    const report = await prisma.report.create({
        data: {
            courseId: course1.id,
            term: "Vize",
            minScore: 25,
            maxScore: 95,
            avgScore: 62.5,
            studentCnt: 45,
            status: "PENDING",
        },
    });
    console.log("✅ Örnek rapor oluşturuldu:", report.id);

    console.log("\n🎉 Seed işlemi tamamlandı!");
    console.log("\nTest kullanıcıları:");
    console.log("  Admin:    admin@okul.edu.tr");
    console.log("  Manager:  mudur.yrd@okul.edu.tr");
    console.log("  Lecturer: ogretim.gor@okul.edu.tr");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
