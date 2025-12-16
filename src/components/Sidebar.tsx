"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const menuItems = {
    ADMIN: [
        { href: "/admin", label: "Kontrol Paneli", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
        { href: "/admin/users", label: "Personel Yönetimi", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
        { href: "/admin/courses", label: "Ders Yönetimi", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
        { href: "/admin/outcomes", label: "Kazanım Yönetimi", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
        { href: "/admin/reports", label: "Raporlar", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
        { href: "/admin/templates", label: "Şablonlar", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
    ],
    MANAGER: [
        { href: "/manager", label: "Kontrol Paneli", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
        { href: "/manager/pending", label: "Onay Bekleyenler", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        { href: "/manager/approved", label: "Onaylananlar", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
        { href: "/manager/outcomes", label: "Kazanım Yönetimi", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
        { href: "/manager/templates", label: "Şablonlar", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
    ],
    LECTURER: [
        { href: "/lecturer", label: "Kontrol Paneli", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
        { href: "/lecturer/upload", label: "Not Girişi", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
        { href: "/lecturer/my-courses", label: "Derslerim", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
        { href: "/lecturer/outcomes", label: "Kazanım Yönetimi", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
        { href: "/lecturer/reports", label: "Raporlarım", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
        { href: "/lecturer/templates", label: "Şablonlar", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
    ],
};

const roleLabels = {
    ADMIN: "Yüksekokul Müdürü",
    MANAGER: "Müdür Yardımcısı",
    LECTURER: "Öğretim Görevlisi",
};

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const userRole = session?.user?.role || "LECTURER";
    const items = menuItems[userRole as keyof typeof menuItems] || menuItems.LECTURER;

    return (
        <aside
            className={`relative bg-gradient-to-b from-slate-900 via-slate-850 to-slate-800 border-r border-slate-700/30 h-screen sticky top-0 flex flex-col shadow-2xl transition-all duration-500 ease-out ${isCollapsed ? "w-20" : "w-72"} ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
        >
            {/* Animated Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-600/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 -left-10 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute -bottom-10 right-0 w-28 h-28 bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            {/* Header with Logo */}
            <div className="relative p-4 border-b border-slate-700/30">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative transform transition-all duration-300 group-hover:scale-110">
                            <div className="absolute inset-0 bg-red-600/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Image
                                src="/logo.png"
                                alt="Simav MYO"
                                width={isCollapsed ? 42 : 50}
                                height={isCollapsed ? 42 : 50}
                                className="relative rounded-xl shadow-xl transition-all duration-300"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden">
                                <h1 className="text-base font-bold text-white leading-tight transform transition-all duration-300 group-hover:translate-x-1">
                                    Simav MYO
                                </h1>
                                <p className="text-xs text-red-400 font-medium transform transition-all duration-300 delay-75 group-hover:translate-x-1">
                                    Kalite Yönetim Sistemi
                                </p>
                            </div>
                        )}
                    </Link>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-300 hover:rotate-180"
                        title={isCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
                        </svg>
                    </button>
                </div>
            </div>

            {/* User Profile Card */}
            {session?.user && (
                <div className={`relative p-4 border-b border-slate-700/30 ${isCollapsed ? "text-center" : ""}`}>
                    <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""} group`}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300 animate-pulse" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-lg shadow-xl transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                                {session.user.name?.charAt(0).toUpperCase() || "K"}
                            </div>
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate transform transition-all duration-300 group-hover:translate-x-1">
                                    {session.user.fullName || session.user.name || "Kullanıcı"}
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <p className="text-xs text-slate-400 font-medium transform transition-all duration-300 delay-75 group-hover:translate-x-1">
                                        {roleLabels[userRole as keyof typeof roleLabels]}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Menu Section Title */}
            {!isCollapsed && (
                <div className="px-4 pt-4 pb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-8 h-px bg-slate-600" />
                        Ana Menü
                        <span className="flex-1 h-px bg-slate-600" />
                    </p>
                </div>
            )}

            {/* Navigation Menu */}
            <nav className="relative flex-1 px-3 py-2 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {items.map((item, index) => {
                    const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/admin" && item.href !== "/manager" && item.href !== "/lecturer");
                    const isHovered = hoveredItem === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.label : undefined}
                            onMouseEnter={() => setHoveredItem(item.href)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${isActive
                                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/40"
                                : "text-slate-400 hover:text-white"
                                } ${isCollapsed ? "justify-center" : ""}`}
                            style={{
                                animationDelay: `${index * 50}ms`,
                            }}
                        >
                            {/* Hover Background Effect */}
                            {!isActive && (
                                <div className={`absolute inset-0 bg-gradient-to-r from-slate-700/50 to-slate-700/30 rounded-xl transition-all duration-300 ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} />
                            )}

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg shadow-white/30" />
                            )}

                            {/* Icon */}
                            <div className={`relative z-10 transition-all duration-300 ${isActive ? "" : "group-hover:scale-110 group-hover:text-red-400"}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                            </div>

                            {/* Label */}
                            {!isCollapsed && (
                                <span className={`relative z-10 text-sm font-medium transition-all duration-300 ${isActive ? "" : "group-hover:translate-x-1"}`}>
                                    {item.label}
                                </span>
                            )}

                            {/* Arrow Indicator */}
                            {!isCollapsed && isActive && (
                                <svg className="w-4 h-4 ml-auto text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* YÖKAK Badge */}
            {!isCollapsed && (
                <div className="px-4 py-3 border-t border-slate-700/30">
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-green-900/30 to-green-800/20 rounded-xl border border-green-700/30 group hover:from-green-900/40 hover:to-green-800/30 transition-all duration-300">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/30 rounded-lg blur animate-pulse" />
                            <svg className="relative w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-green-400">YÖKAK Uyumlu</span>
                            <p className="text-[10px] text-green-500/70">Akreditasyon Sistemi</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Button */}
            <div className="p-3 border-t border-slate-700/30">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-red-400 transition-all duration-300 w-full group overflow-hidden ${isCollapsed ? "justify-center" : ""}`}
                    title="Güvenli Çıkış"
                >
                    {/* Hover Background */}
                    <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/30 rounded-xl transition-all duration-300" />

                    {/* Icon with Animation */}
                    <div className="relative z-10 transition-all duration-300 group-hover:-translate-x-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>

                    {!isCollapsed && (
                        <span className="relative z-10 text-sm font-medium transition-all duration-300 group-hover:translate-x-1">
                            Güvenli Çıkış
                        </span>
                    )}
                </button>
            </div>

            {/* Version Info */}
            {!isCollapsed && (
                <div className="px-4 pb-3">
                    <p className="text-[10px] text-slate-600 text-center">
                        AKPYS v1.0 • © 2024-2025
                    </p>
                </div>
            )}
        </aside>
    );
}
