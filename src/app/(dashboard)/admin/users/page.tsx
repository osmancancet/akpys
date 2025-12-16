"use client";

import { useEffect, useState } from "react";

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ email: "", fullName: "", role: "LECTURER" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Kullanıcılar alınamadı:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (userId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (res.ok) {
                setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u)));
            }
        } catch (error) {
            console.error("Güncelleme hatası:", error);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });

            if (res.ok) {
                const user = await res.json();
                setUsers([user, ...users]);
                setShowAddModal(false);
                setNewUser({ email: "", fullName: "", role: "LECTURER" });
            }
        } catch (error) {
            console.error("Kullanıcı eklenemedi:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const roleLabels: Record<string, string> = {
        ADMIN: "Müdür",
        MANAGER: "Müdür Yrd.",
        LECTURER: "Öğr. Gör.",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h1>
                    <p className="text-slate-400">Sisteme erişim izni olan personeli yönetin</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Kullanıcı Ekle
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700 bg-slate-800">
                            <th className="text-left p-4 text-sm font-medium text-slate-400">Kullanıcı</th>
                            <th className="text-left p-4 text-sm font-medium text-slate-400">E-posta</th>
                            <th className="text-left p-4 text-sm font-medium text-slate-400">Rol</th>
                            <th className="text-left p-4 text-sm font-medium text-slate-400">Durum</th>
                            <th className="text-right p-4 text-sm font-medium text-slate-400">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-700/30">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-medium">
                                            {user.fullName.charAt(0)}
                                        </div>
                                        <span className="font-medium text-white">{user.fullName}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-400">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${user.role === "ADMIN" ? "bg-purple-500/20 text-purple-400" :
                                            user.role === "MANAGER" ? "bg-blue-500/20 text-blue-400" :
                                                "bg-green-500/20 text-green-400"
                                        }`}>
                                        {roleLabels[user.role]}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => toggleActive(user.id, user.isActive)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.isActive ? "bg-green-500" : "bg-slate-600"
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.isActive ? "translate-x-6" : "translate-x-1"
                                                }`}
                                        />
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <span className={`text-sm ${user.isActive ? "text-green-400" : "text-red-400"}`}>
                                        {user.isActive ? "Aktif" : "Pasif"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold text-white mb-4">Yeni Kullanıcı Ekle</h2>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">E-posta</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                                    placeholder="ornek@okul.edu.tr"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={newUser.fullName}
                                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                                    placeholder="Dr. Ahmet Yılmaz"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Rol</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                                >
                                    <option value="LECTURER">Öğretim Görevlisi</option>
                                    <option value="MANAGER">Müdür Yardımcısı</option>
                                    <option value="ADMIN">Müdür</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {submitting ? "Ekleniyor..." : "Ekle"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
