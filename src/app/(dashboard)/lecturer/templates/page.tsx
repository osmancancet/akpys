"use client";

import { useEffect, useState } from "react";

interface Course {
    id: string;
    code: string;
    name: string;
}

export default function TemplatesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch("/api/courses/my");
            const data = await res.json();
            setCourses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Dersler alınamadı:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTemplateUrl = (type: string) => {
        const course = courses.find(c => c.id === selectedCourse);
        if (!course) return `/api/template?type=${type}`;
        return `/api/template?type=${type}&course=${course.code}&name=${encodeURIComponent(course.name)}`;
    };

    const selectedCourseName = courses.find(c => c.id === selectedCourse)?.name || "";
    const selectedCourseCode = courses.find(c => c.id === selectedCourse)?.code || "";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Sınav Şablonları</h1>
                <p className="text-slate-400">YÖKAK uyumlu Excel şablonlarını indirin ve doldurun</p>
            </div>

            {/* Course Selection */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Ders Seçimi</h2>
                <p className="text-slate-400 text-sm mb-4">
                    Şablonları ders bazlı indirmek için önce ders seçin. Genel şablon için seçim yapmadan devam edebilirsiniz.
                </p>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full md:w-1/2 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                    <option value="">Genel Şablon (Ders seçilmedi)</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vize Template */}
                <TemplateCard
                    title="Vize Sınavı Şablonu"
                    description="Vize notları ve Ders Öğrenme Çıktıları (DÖÇ) eşleştirme sayfası içerir."
                    features={[
                        "Öğrenci not listesi",
                        "Soru-DÖÇ eşleştirme tablosu",
                        "Ders bilgi sayfası"
                    ]}
                    color="blue"
                    icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    downloadUrl={getTemplateUrl("vize")}
                    courseName={selectedCourseName}
                    courseCode={selectedCourseCode}
                    examType="Vize"
                />

                {/* Final Template */}
                <TemplateCard
                    title="Final Sınavı Şablonu"
                    description="Final notları ve genişletilmiş DÖÇ eşleştirme sayfası içerir."
                    features={[
                        "Öğrenci not listesi",
                        "Kapsamlı Soru-DÖÇ eşleştirme",
                        "Ders bilgi sayfası"
                    ]}
                    color="green"
                    icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    downloadUrl={getTemplateUrl("final")}
                    courseName={selectedCourseName}
                    courseCode={selectedCourseCode}
                    examType="Final"
                />

                {/* Bütünleme Template */}
                <TemplateCard
                    title="Bütünleme Sınavı Şablonu"
                    description="Sadece bütünlemeye giren öğrenciler için hazırlanmış şablon."
                    features={[
                        "Bütünleme öğrenci listesi",
                        "Sadeleştirilmiş format",
                        "Ders bilgi sayfası"
                    ]}
                    color="yellow"
                    icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    downloadUrl={getTemplateUrl("butunleme")}
                    courseName={selectedCourseName}
                    courseCode={selectedCourseCode}
                    examType="Bütünleme"
                />
            </div>

            {/* Info Section */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Şablon Kullanım Kılavuzu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <h4 className="text-white font-medium mb-2">Nasıl Doldurulur?</h4>
                        <ol className="text-slate-400 space-y-1 list-decimal list-inside">
                            <li>Şablonu indirin ve Excel'de açın</li>
                            <li>"Ders Bilgisi" sayfasını kontrol edin</li>
                            <li>Not sayfasındaki örnek verileri silin</li>
                            <li>Öğrenci bilgilerini ve notları girin</li>
                            <li>Dosyayı kaydedin</li>
                        </ol>
                    </div>
                    <div>
                        <h4 className="text-white font-medium mb-2">DÖÇ Eşleştirme Nedir?</h4>
                        <p className="text-slate-400">
                            Ders Öğrenme Çıktıları (DÖÇ), YÖKAK akreditasyonu için gerekli bir bilgidir.
                            Her soru hangi öğrenme çıktısını ölçtüğünü belirtmeniz gerekmektedir.
                            Eşleştirme tablosunda "1" o DÖÇ'ü ölçtüğünü, "0" ölçmediğini belirtir.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TemplateCard({
    title, description, features, color, icon, downloadUrl, courseName, courseCode, examType
}: {
    title: string;
    description: string;
    features: string[];
    color: string;
    icon: string;
    downloadUrl: string;
    courseName: string;
    courseCode: string;
    examType: string;
}) {
    const colors: Record<string, { bg: string; border: string; icon: string; btn: string }> = {
        blue: {
            bg: "bg-blue-500/10",
            border: "border-blue-500/30",
            icon: "text-blue-400",
            btn: "bg-blue-600 hover:bg-blue-700"
        },
        green: {
            bg: "bg-green-500/10",
            border: "border-green-500/30",
            icon: "text-green-400",
            btn: "bg-green-600 hover:bg-green-700"
        },
        yellow: {
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/30",
            icon: "text-yellow-400",
            btn: "bg-yellow-600 hover:bg-yellow-700"
        },
    };

    const c = colors[color];

    return (
        <div className={`${c.bg} border ${c.border} rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 ${c.bg} rounded-lg`}>
                    <svg className={`w-6 h-6 ${c.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>

            <p className="text-slate-400 text-sm mb-4">{description}</p>

            {courseName && (
                <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-400">Seçili Ders:</p>
                    <p className="text-white font-medium">{courseCode} - {courseName}</p>
                </div>
            )}

            <ul className="text-sm text-slate-300 space-y-1 mb-6">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                        <svg className={`w-4 h-4 ${c.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                    </li>
                ))}
            </ul>

            <a
                href={downloadUrl}
                download
                className={`w-full py-2.5 ${c.btn} text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {examType} Şablonunu İndir
            </a>
        </div>
    );
}
