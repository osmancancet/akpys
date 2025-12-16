import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Enum Değerlerini Ekle ve Kontrol Et
        let enumDebug = [];
        try {
            await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'HEAD_OF_DEPARTMENT'`).catch(e => console.log('Enum add error (expected if exists):', e.message));
            await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SECRETARY'`).catch(e => console.log('Enum add error (expected if exists):', e.message));

            // Mevcut Enum değerlerini kontrol et
            const roles = await prisma.$queryRaw`SELECT unnest(enum_range(NULL::"UserRole")) as role`;
            console.log("Database Enums:", roles);
            enumDebug = roles as any[];
        } catch (e: any) {
            console.log("Enum check error:", e);
            // Fallback for older Postgres without IF NOT EXISTS
            try {
                await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE 'HEAD_OF_DEPARTMENT'`);
            } catch { }
            try {
                await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE 'SECRETARY'`);
            } catch { }
        }

        // 2. Admin Kullanıcısını Ekle/Güncelle
        const adminEmail = "oskitocan55@gmail.com";
        console.log("Admin kullanıcısı aranıyor:", adminEmail);

        // Önce var olanı bulmaya çalışalım debug için
        const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
        console.log("Mevcut kullanıcı durumu:", existing);

        // Doğrudan SQL ile ekleme (En güvenli yöntem)
        await prisma.$executeRawUnsafe(`
      INSERT INTO "User" (id, email, "fullName", role, "isActive", "createdAt", "updatedAt")
      VALUES (
        'cm4r1admin001',
        '${adminEmail}',
        'Osman Can Çetiner',
        'ADMIN',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET 
          role = 'ADMIN', 
          "isActive" = true, 
          "fullName" = 'Osman Can Çetiner',
          "updatedAt" = NOW();
    `);

        // 3. Test Kullanıcısı Oluşturma Denemesi (Hata ayıklama için)
        let testUserResult = "Test yapılmadı";
        try {
            const testEmail = "test_diag_" + Date.now() + "@test.com";
            console.log("Test kullanıcısı oluşturuluyor:", testEmail);

            const testUser = await prisma.user.create({
                data: {
                    email: testEmail,
                    fullName: "Test Diagnostic User",
                    role: "LECTURER" as any, // "any" cast to bypass local TS check if needed
                    isActive: false
                }
            });
            testUserResult = "Başarılı: " + testUser.id;
            // Temizlik
            await prisma.user.delete({ where: { id: testUser.id } });
            testUserResult += " (Silindi)";
        } catch (e: any) {
            console.error("Test user creation failed:", e);
            testUserResult = "HATA: " + e.message;
        }

        const finalUser = await prisma.user.findUnique({ where: { email: adminEmail } });

        return NextResponse.json({
            success: true,
            message: "Veritabanı güncellendi.",
            enums: enumDebug,
            adminUser: finalUser,
            diagnosticTest: testUserResult
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
