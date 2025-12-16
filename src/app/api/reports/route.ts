import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Raporları listele (filtreli)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const courseId = searchParams.get("courseId");

        const where: Record<string, unknown> = {};

        // ADMIN ve MANAGER tüm raporları görebilir, diğerleri sadece kendi derslerini
        if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
            const userCourses = await prisma.course.findMany({
                where: { lecturerId: session.user.id },
                select: { id: true },
            });
            where.courseId = { in: userCourses.map((c) => c.id) };
        }

        // Filtreler
        if (status) {
            where.status = status;
        }
        if (courseId) {
            where.courseId = courseId;
        }

        const reports = await prisma.report.findMany({
            where,
            include: {
                course: {
                    include: {
                        lecturer: {
                            select: { id: true, fullName: true },
                        },
                    },
                },
            },
            orderBy: { uploadedAt: "desc" },
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error("Raporlar alınamadı:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST - Yeni rapor ekle (LECTURER)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const body = await req.json();
        const {
            courseId, term, minScore, maxScore, avgScore, studentCnt, fileName,
            academicYear, semester, medianScore, stdDev, passCount, failCount, passRate, gradeDistribution
        } = body;

        if (!courseId || !term || minScore === undefined || maxScore === undefined || avgScore === undefined) {
            return NextResponse.json({ error: "Tüm alanlar gerekli" }, { status: 400 });
        }

        // Yetki kontrolü - herkes sadece kendi dersine rapor yükleyebilir
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course || course.lecturerId !== session.user.id) {
            // ADMIN hariç herkes sadece kendi dersine rapor yükleyebilir
            if (session.user.role !== "ADMIN") {
                return NextResponse.json({ error: "Bu ders için yetkiniz yok" }, { status: 403 });
            }
        }

        const report = await prisma.report.create({
            data: {
                courseId,
                term,
                academicYear: academicYear || "2024-2025",
                semester: semester || "Güz",
                minScore,
                maxScore,
                avgScore,
                medianScore: medianScore || null,
                stdDev: stdDev || null,
                studentCnt: studentCnt || 0,
                passCount: passCount || null,
                failCount: failCount || null,
                passRate: passRate || null,
                gradeDistribution: gradeDistribution || null,
                fileName,
                status: "PENDING",
            },
            include: { course: true },
        });

        return NextResponse.json(report, { status: 201 });
    } catch (error) {
        console.error("Rapor eklenemedi:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
