import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardRedirect() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Role göre yönlendir
    switch (session.user.role) {
        case "ADMIN":
            redirect("/admin");
        case "MANAGER":
            redirect("/manager");
        case "LECTURER":
            redirect("/lecturer");
        default:
            redirect("/login");
    }
}
