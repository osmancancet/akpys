import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// GET - Tüm kullanıcıları listele (Sadece ADMIN)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
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

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const body = await req.json();
        const { email, fullName, role } = body;

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

        // Role kontrolü ve ataması
        let userRole: UserRole = UserRole.LECTURER;
        if (role && Object.values(UserRole).includes(role as UserRole)) {
            userRole = role as UserRole;
        }

        const user = await prisma.user.create({
            data: {
                email,
                fullName,
                role: userRole,
                isActive: true,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("Kullanıcı eklenemedi:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
