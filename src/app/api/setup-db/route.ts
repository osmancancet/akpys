import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    let logs: string[] = [];
    const log = (msg: string) => { console.log(msg); logs.push(msg); };

    try {
        log("1. Veritabanı Şema Onarımı Başlıyor...");

        // 1. Enum Tipi Yoksa Oluştur (Postgres Native)
        try {
            // Check if type exists
            const typeExists: any[] = await prisma.$queryRaw`SELECT 1 FROM pg_type WHERE typname = 'UserRole'`;

            if (typeExists.length === 0) {
                log("UserRole tipi eksik, oluşturuluyor...");
                await prisma.$executeRawUnsafe(`CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'HEAD_OF_DEPARTMENT', 'SECRETARY', 'LECTURER')`);
                log("UserRole tipi oluşturuldu.");
            } else {
                log("UserRole tipi zaten var.");
                // Add new values if missing (idempotent)
                await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'HEAD_OF_DEPARTMENT'`).catch(() => { });
                await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SECRETARY'`).catch(() => { });
            }
        } catch (e: any) {
            log("Enum creation error: " + e.message);
        }

        // 2. Tablo Kolonunu Dönüştür (Text -> Enum)
        try {
            // Önce geçersiz değerleri temizle
            await prisma.$executeRawUnsafe(`
                UPDATE "User" 
                SET "role" = 'LECTURER' 
                WHERE "role" NOT IN ('ADMIN', 'MANAGER', 'HEAD_OF_DEPARTMENT', 'SECRETARY', 'LECTURER')
            `);
            log("Geçersiz rol değerleri temizlendi.");

            // Kolon tipini değiştir
            await prisma.$executeRawUnsafe(`
                ALTER TABLE "User" 
                ALTER COLUMN "role" TYPE "UserRole" 
                USING "role"::"text"::"UserRole"
            `);
            log("Kolon tipi UserRole olarak ayarlandı.");
        } catch (e: any) {
            log("Alter table error (Maybe already correct): " + e.message);
        }

        // 3. Admin Kullanıcısını Garanti Ekle
        const adminEmail = "oskitocan55@gmail.com";
        await prisma.$executeRawUnsafe(`
          INSERT INTO "User" (id, email, "fullName", role, "isActive", "createdAt", "updatedAt")
          VALUES (
            'cm4r1admin001',
            '${adminEmail}',
            'Osman Can Çetiner',
            'ADMIN'::"UserRole",
            true,
            NOW(),
            NOW()
          )
          ON CONFLICT (email) DO UPDATE SET 
              role = 'ADMIN'::"UserRole", 
              "isActive" = true, 
              "fullName" = 'Osman Can Çetiner',
              "updatedAt" = NOW();
        `);
        log("Admin kullanıcısı güncellendi.");

        // 4. Test Kullanıcısı (Verification)
        let testResult = "Test Başarılı";
        try {
            // Prisma create kullan
            const test = await prisma.user.create({
                data: {
                    email: `test_${Date.now()}@test.com`,
                    fullName: "Test User",
                    role: "LECTURER" as any,
                    isActive: false
                }
            });
            await prisma.user.delete({ where: { id: test.id } });
        } catch (e: any) {
            testResult = "TEST HATASI: " + e.message;
        }

        return NextResponse.json({
            success: true,
            logs,
            testResult
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            logs
        }, { status: 500 });
    }
}
