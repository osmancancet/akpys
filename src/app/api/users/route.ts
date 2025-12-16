import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Tüm kullanıcıları listele (Sadece ADMIN)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Kullanıcılar alınamadı:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST - Yeni kullanıcı ekle (Sadece ADMIN)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const body = await req.json();
        const { email, fullName, role } = body;

        console.log("Kullanıcı ekleme isteği:", { email, fullName, role });

        if (!email || !fullName) {
            return NextResponse.json({ error: "E-posta ve ad soyad gerekli" }, { status: 400 });
        }

        // E-posta kontrolü
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 400 });
        }

        // Role kontrolü (Manuel string kontrolü)
        const VALID_ROLES = ["ADMIN", "MANAGER", "LECTURER", "HEAD_OF_DEPARTMENT", "SECRETARY"];
        let userRole = "LECTURER";

        if (role && VALID_ROLES.includes(role)) {
            userRole = role;
        }

        console.log("Prisma create çağrılıyor...", { email, userRole });

        const user = await prisma.user.create({
            data: {
                email,
                fullName,
                role: userRole as any, // Enum type mismatch fix
                isActive: true,
            },
        });

        console.log("Kullanıcı oluşturuldu:", user.id);

        return NextResponse.json(user, { status: 201 });
    } catch (error: any) {
        console.error("Kullanıcı eklenemedi DETAYLI:", error);
        return NextResponse.json({
            error: "Sunucu hatası: " + (error.message || "Bilinmeyen hata")
        }, { status: 500 });
    }
}
