import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// GET - Tüm dersleri listele
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const courses = await prisma.course.findMany({
            include: {
                lecturer: {
                    select: { id: true, fullName: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(courses);
    } catch (error) {
        console.error("Dersler alınamadı:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST - Yeni ders ekle (Herkes kendi dersini ekleyebilir)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const body = await req.json();
        const { code, name, lecturerId } = body;

        if (!code || !name) {
            return NextResponse.json({ error: "Ders kodu ve adı gerekli" }, { status: 400 });
        }

        // lecturerId belirtilmemişse, giriş yapan kullanıcıyı ata
        // ADMIN başka birini atayabilir, diğerleri sadece kendilerini
        let finalLecturerId = lecturerId || session.user.id;

        if (lecturerId && lecturerId !== session.user.id && session.user.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Sadece kendi adınıza ders ekleyebilirsiniz" }, { status: 403 });
        }

        // Ders kodu kontrolü
        const existingCourse = await prisma.course.findUnique({
            where: { code },
        });

        if (existingCourse) {
            return NextResponse.json({ error: "Bu ders kodu zaten mevcut" }, { status: 400 });
        }

        const course = await prisma.course.create({
            data: { code, name, lecturerId: finalLecturerId },
            include: { lecturer: true },
        });

        return NextResponse.json(course, { status: 201 });
    } catch (error) {
        console.error("Ders eklenemedi:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
