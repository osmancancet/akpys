import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Tek rapor detayı
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const report = await prisma.report.findUnique({
            where: { id },
            include: {
                course: {
                    include: {
                        lecturer: {
                            select: { id: true, fullName: true, email: true },
                        },
                    },
                },
            },
        });

        if (!report) {
            return NextResponse.json({ error: "Rapor bulunamadı" }, { status: 404 });
        }

        return NextResponse.json(report);
    } catch (error) {
        console.error("Rapor alınamadı:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// PATCH - Rapor durumunu güncelle (MANAGER veya ADMIN)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const body = await req.json();
        const { status } = body;

        if (!status || !["APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
        }

        const report = await prisma.report.update({
            where: { id },
            data: {
                status,
                reviewedAt: new Date(),
                reviewerId: session.user.id,
            },
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error("Rapor güncellenemedi:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// DELETE - Rapor sil (ADMIN)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        await prisma.report.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Rapor silinemedi:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
