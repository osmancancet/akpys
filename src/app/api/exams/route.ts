import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Sınavları getir
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

        const exams = await prisma.exam.findMany({
            where: { courseId },
            include: {
                questions: {
                    include: { learningOutcome: true },
                    orderBy: { questionNo: "asc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(exams);
    } catch (error) {
        console.error("Sınav getirme hatası:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST - Yeni sınav oluştur
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const body = await req.json();
        const { courseId, type, academicYear, semester, totalPoints, questions } = body;

        if (!courseId || !type || !academicYear || !semester) {
            return NextResponse.json({ error: "Tüm alanlar gerekli" }, { status: 400 });
        }

        // Yetki kontrolü
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course || (course.lecturerId !== session.user.id && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Bu ders için yetkiniz yok" }, { status: 403 });
        }

        // Sınav oluştur
        const exam = await prisma.exam.create({
            data: {
                courseId,
                type,
                academicYear,
                semester,
                totalPoints: totalPoints || 100,
                questions: {
                    create: questions?.map((q: { questionNo: number; points: number; learningOutcomeId?: string }) => ({
                        questionNo: q.questionNo,
                        points: q.points,
                        learningOutcomeId: q.learningOutcomeId || null,
                    })) || [],
                },
            },
            include: {
                questions: {
                    include: { learningOutcome: true },
                    orderBy: { questionNo: "asc" },
                },
            },
        });

        return NextResponse.json(exam);
    } catch (error) {
        console.error("Sınav oluşturma hatası:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// PUT - Soru puanlarını güncelle (öğrenci ortalamalarını ekle ve DÖÇ başarı hesapla)
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const body = await req.json();
        const { examId, questions } = body;

        if (!examId || !questions) {
            return NextResponse.json({ error: "examId ve questions gerekli" }, { status: 400 });
        }

        // Soruları güncelle
        for (const q of questions) {
            await prisma.question.update({
                where: { id: q.id },
                data: {
                    avgStudentPoints: q.avgStudentPoints,
                    learningOutcomeId: q.learningOutcomeId || null,
                },
            });
        }

        // DÖÇ başarı oranlarını hesapla
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                questions: { include: { learningOutcome: true } },
                course: { include: { learningOutcomes: true } },
            },
        });

        if (exam) {
            // Her DÖÇ için başarı hesapla
            for (const outcome of exam.course.learningOutcomes) {
                const relatedQuestions = exam.questions.filter(q => q.learningOutcomeId === outcome.id);

                if (relatedQuestions.length > 0) {
                    const totalPoints = relatedQuestions.reduce((sum, q) => sum + q.points, 0);
                    const totalAvgPoints = relatedQuestions.reduce((sum, q) => sum + (q.avgStudentPoints || 0), 0);
                    const achievementPct = (totalAvgPoints / totalPoints) * 100;

                    await prisma.learningOutcome.update({
                        where: { id: outcome.id },
                        data: { achievementPct },
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Soru güncelleme hatası:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// DELETE - Sınavı sil
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

        await prisma.exam.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Sınav silme hatası:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
