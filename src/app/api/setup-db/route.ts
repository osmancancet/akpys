import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Enum Değerlerini Ekle
        try {
            await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE 'HEAD_OF_DEPARTMENT'`);
            console.log("HEAD_OF_DEPARTMENT eklendi");
        } catch (e) {
            console.log("HEAD_OF_DEPARTMENT zaten var veya hata oluştu", e);
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE 'SECRETARY'`);
            console.log("SECRETARY eklendi");
        } catch (e) {
            console.log("SECRETARY zaten var veya hata oluştu", e);
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

        const finalUser = await prisma.user.findUnique({ where: { email: adminEmail } });
        console.log("İşlem sonrası kullanıcı:", finalUser);

        return NextResponse.json({
            success: true,
            message: "Veritabanı güncellendi. Kullanıcı detayı aşağıdadır.",
            user: finalUser
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
