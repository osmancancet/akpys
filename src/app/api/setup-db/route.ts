import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Enum ve Kolon Tipi Kontrolü
        let enumDebug = [];
        let columnTypeDebug: any[] = [];

        try {
            // Kolon tipini kontrol et
            const columnType = await prisma.$queryRaw`
                SELECT column_name, data_type, udt_name 
                FROM information_schema.columns 
                WHERE table_name = 'User' AND column_name = 'role'
            `;
            columnTypeDebug = columnType as any[];
            console.log("Column Type Info:", columnType);

            // Mevcut Enum değerlerini kontrol et
            try {
                const roles = await prisma.$queryRaw`SELECT unnest(enum_range(NULL::"UserRole")) as role`;
                enumDebug = roles as any[];
            } catch (e) {
                enumDebug = ["Enum range query failed (Type might not exist)"];
            }

            // Enum eksikse eklemeyi dene
            await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'HEAD_OF_DEPARTMENT'`).catch(() => { });
            await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SECRETARY'`).catch(() => { });

        } catch (e: any) {
            console.log("Schema check error:", e);
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
            columnInfo: columnTypeDebug,
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
