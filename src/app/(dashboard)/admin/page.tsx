"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
    totalUsers: number;
    activeUsers: number;
    totalCourses: number;
    totalReports: number;
    pendingReports: number;
    approvedReports: number;
    rejectedReports: number;
}

interface RecentReport {
    id: string;
    term: string;
    avgScore: number;
    status: string;
    uploadedAt: string;
    course: { code: string; name: string };
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, coursesRes, reportsRes] = await Promise.all([
                fetch("/api/users"),
                fetch("/api/courses"),
                fetch("/api/reports"),
            ]);

            const users = await usersRes.json();
            const courses = await coursesRes.json();
            const reports = await reportsRes.json();

            const usersArr = Array.isArray(users) ? users : [];
            const reportsArr = Array.isArray(reports) ? reports : [];

            setStats({
                totalUsers: usersArr.length,
                activeUsers: usersArr.filter((u: { isActive: boolean }) => u.isActive).length,
                totalCourses: Array.isArray(courses) ? courses.length : 0,
                totalReports: reportsArr.length,
                pendingReports: reportsArr.filter((r: { status: string }) => r.status === "PENDING").length,
                approvedReports: reportsArr.filter((r: { status: string }) => r.status === "APPROVED").length,
                rejectedReports: reportsArr.filter((r: { status: string }) => r.status === "REJECTED").length,
            });

            setRecentReports(reportsArr.slice(0, 5));
        } catch (error) {
            console.error("Veriler alınamadı:", error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Günaydın";
        if (hour < 18) return "İyi günler";
        return "İyi akşamlar";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl p-8 border border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-400 text-sm font-medium mb-1">{getGreeting()}</p>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {session?.user?.fullName || "Yönetici"}
                        </h1>
                        <p className="text-slate-400">
                            Akademik Performans ve Kalite Yönetim Sistemi
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    label="Toplam Personel"
                    value={stats?.totalUsers || 0}
                    subValue={`${stats?.activeUsers || 0} aktif`}
                    color="blue"
                />
                <StatCard
                    icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    label="Toplam Ders"
                    value={stats?.totalCourses || 0}
                    color="green"
                />
                <StatCard
                    icon="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    label="Toplam Rapor"
                    value={stats?.totalReports || 0}
                    color="purple"
                />
                <StatCard
                    icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    label="Bekleyen Onay"
                    value={stats?.pendingReports || 0}
                    color="yellow"
                    highlight={stats?.pendingReports ? stats.pendingReports > 0 : false}
                />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Hızlı İşlemler
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <QuickAction href="/admin/users" icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" label="Kullanıcı Ekle" color="blue" />
                        <QuickAction href="/admin/courses" icon="M12 6v6m0 0v6m0-6h6m-6 0H6" label="Ders Ekle" color="green" />
                        <QuickAction href="/admin/reports" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" label="Raporlar" color="purple" />
                        <QuickAction href="/manager" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" label="Onay Bekleyenler" color="yellow" />
                    </div>
                </div>

                {/* Recent Reports */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Son Raporlar
                    </h3>
                    {recentReports.length > 0 ? (
                        <div className="space-y-3">
                            {recentReports.map((report) => (
                                <div key={report.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded font-mono">
                                            {report.course?.code}
                                        </span>
                                        <div>
                                            <p className="text-sm text-white">{report.course?.name}</p>
                                            <p className="text-xs text-slate-400">{report.term} - Ort: {report.avgScore}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={report.status} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-8">Henüz rapor yok</p>
                    )}
                </div>
            </div>

            {/* Report Status Summary */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Rapor Durumu Özeti</h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1 bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400">Onay Oranı</span>
                            <span className="text-green-400 font-bold">
                                {stats?.totalReports ? Math.round((stats.approvedReports / stats.totalReports) * 100) : 0}%
                            </span>
                        </div>
                        <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                                style={{ width: `${stats?.totalReports ? (stats.approvedReports / stats.totalReports) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex gap-6 text-center">
                        <div>
                            <p className="text-2xl font-bold text-green-400">{stats?.approvedReports || 0}</p>
                            <p className="text-xs text-slate-400">Onaylı</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-yellow-400">{stats?.pendingReports || 0}</p>
                            <p className="text-xs text-slate-400">Bekliyor</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-400">{stats?.rejectedReports || 0}</p>
                            <p className="text-xs text-slate-400">Reddedildi</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subValue, color, highlight }: {
    icon: string; label: string; value: number; subValue?: string; color: string; highlight?: boolean
}) {
    const colors: Record<string, string> = {
        blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
        green: "from-green-500/20 to-green-600/20 border-green-500/30",
        purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
        yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
    };
    const iconColors: Record<string, string> = {
        blue: "text-blue-400",
        green: "text-green-400",
        purple: "text-purple-400",
        yellow: "text-yellow-400",
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4 ${highlight ? 'animate-pulse' : ''}`}>
            <div className="flex items-center gap-3 mb-2">
                <svg className={`w-5 h-5 ${iconColors[color]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                <span className="text-slate-400 text-sm">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
        </div>
    );
}

function QuickAction({ href, icon, label, color }: { href: string; icon: string; label: string; color: string }) {
    const colors: Record<string, string> = {
        blue: "hover:bg-blue-500/20 hover:border-blue-500/40",
        green: "hover:bg-green-500/20 hover:border-green-500/40",
        purple: "hover:bg-purple-500/20 hover:border-purple-500/40",
        yellow: "hover:bg-yellow-500/20 hover:border-yellow-500/40",
    };
    const iconColors: Record<string, string> = {
        blue: "text-blue-400",
        green: "text-green-400",
        purple: "text-purple-400",
        yellow: "text-yellow-400",
    };

    return (
        <Link href={href} className={`flex items-center gap-3 p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg transition-all ${colors[color]}`}>
            <svg className={`w-5 h-5 ${iconColors[color]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
            <span className="text-sm text-white">{label}</span>
        </Link>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: "bg-yellow-500/20 text-yellow-400",
        APPROVED: "bg-green-500/20 text-green-400",
        REJECTED: "bg-red-500/20 text-red-400",
    };
    const labels: Record<string, string> = {
        PENDING: "Bekliyor",
        APPROVED: "Onaylı",
        REJECTED: "Red",
    };

    return (
        <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || styles.PENDING}`}>
            {labels[status] || labels.PENDING}
        </span>
    );
}
