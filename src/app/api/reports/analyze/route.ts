import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { analyzeExcelFile } from "@/lib/excel";

// POST - Excel dosyasını analiz et
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
        }

        // Dosya türü kontrolü
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
        ];

        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Geçersiz dosya türü. Sadece .xlsx ve .xls kabul edilir." }, { status: 400 });
        }

        // Dosyayı buffer'a çevir
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Analiz et
        const analysis = analyzeExcelFile(buffer);

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Excel analiz hatası:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Dosya analiz edilemedi" },
            { status: 500 }
        );
    }
}
