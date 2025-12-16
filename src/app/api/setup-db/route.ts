import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    let logs: string[] = [];
    const log = (msg: string) => { console.log(msg); logs.push(msg); };

    try {
        log("1. Veritabanı Şema Onarımı (Gelişmiş) Başlıyor...");

        // 1. UserRole Tipi Oluştur
        try {
            const typeExists: any[] = await prisma.$queryRaw`SELECT 1 FROM pg_type WHERE typname = 'UserRole'`;

            if (typeExists.length === 0) {
                log("UserRole tipi oluşturuluyor...");
                await prisma.$executeRawUnsafe(`CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'HEAD_OF_DEPARTMENT', 'SECRETARY', 'LECTURER')`);
                log("UserRole tipi oluşturuldu.");
            } else {
                log("UserRole tipi mevcut, eksik değerler ekleniyor.");
                await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'HEAD_OF_DEPARTMENT'`).catch(() => { });
                await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SECRETARY'`).catch(() => { });
            }
        } catch (e: any) {
            log("Enum işlem hatası (Önemsiz olabilir): " + e.message);
        }

        // 2. Tablo Kolonunu Dönüştür (Migration: Role -> UserRole)
        try {
            // A. Önce geçersiz değerleri temizle
            await prisma.$executeRawUnsafe(`
                UPDATE "User" 
                SET "role" = 'LECTURER' 
                WHERE "role"::text NOT IN ('ADMIN', 'MANAGER', 'HEAD_OF_DEPARTMENT', 'SECRETARY', 'LECTURER')
            `);
            log("Geçersiz rol değerleri temizlendi.");

            // B. Default Constraint'i KALDIR (Kritik Adım!)
            await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT`);
            log("Eski Default Constraint kaldırıldı.");

            // C. Kolon tipini değiştir
            await prisma.$executeRawUnsafe(`
                ALTER TABLE "User" 
                ALTER COLUMN "role" TYPE "UserRole" 
                USING "role"::text::"UserRole"
            `);
            log("Kolon tipi UserRole olarak değiştirildi.");

            // D. Default Constraint'i TEKRAR EKLE
            await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'LECTURER'::"UserRole"`);
            log("Yeni Default Constraint eklendi.");

        } catch (e: any) {
            log("Alter table (Migration) hatası: " + e.message);
        }

        // 3. Admin Kullanıcısını Güncelle
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

        // 4. Test (Verification)
        let testResult = "Test Başarılı";
        try {
            const test = await prisma.user.create({
                data: {
                    email: `test_${Date.now()}@test.com`,
                    fullName: "Migration Test User 2",
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
