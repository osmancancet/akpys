import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Dersin DÖÇ'lerini getir
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const courseId = req.nextUrl.searchParams.get("courseId");
        if (!courseId) {
            return NextResponse.json({ error: "courseId gerekli" }, { status: 400 });
        }

        const outcomes = await prisma.learningOutcome.findMany({
            where: { courseId },
            orderBy: { code: "asc" },
        });

        return NextResponse.json(outcomes);
    } catch (error) {
        console.error("DÖÇ getirme hatası:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST - Yeni DÖÇ ekle
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const body = await req.json();
        const { courseId, code, description, weight } = body;

        if (!courseId || !code || !description) {
            return NextResponse.json({ error: "Tüm alanlar gerekli" }, { status: 400 });
        }

        // Yetki kontrolü
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course || (course.lecturerId !== session.user.id && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Bu ders için yetkiniz yok" }, { status: 403 });
        }

        const outcome = await prisma.learningOutcome.create({
            data: {
                courseId,
                code,
                description,
                weight: weight || 1.0,
            },
        });

        return NextResponse.json(outcome);
    } catch (error) {
        console.error("DÖÇ ekleme hatası:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// DELETE - DÖÇ sil
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "id gerekli" }, { status: 400 });
        }

        await prisma.learningOutcome.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DÖÇ silme hatası:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
