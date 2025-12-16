import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 text-white text-center py-3">
        <p className="text-sm font-medium">
          T.C. Kütahya Dumlupınar Üniversitesi | Simav Meslek Yüksekokulu
        </p>
      </div>

      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Simav MYO Logo"
                width={56}
                height={56}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Simav Meslek Yüksekokulu</h1>
                <p className="text-sm text-slate-400">Akademik Kalite Yönetim Sistemi</p>
              </div>
            </div>
            <Link
              href="/login"
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg transition-colors shadow-lg"
            >
              Personel Girişi
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-300 rounded-full text-sm mb-6 border border-red-800/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            YÖKAK Akreditasyon Uyumlu
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Akademik Performans ve
            <span className="text-red-500"> Kalite Güvence Sistemi</span>
          </h2>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Yükseköğretim Kalite Kurulu (YÖKAK) standartlarına uygun, ders bazlı öğrenme çıktıları
            ve program yeterlilikleri ölçümleme, istatistiksel analiz ve raporlama platformu.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3.5 bg-red-700 hover:bg-red-800 text-white font-medium rounded-xl transition-all shadow-lg"
            >
              Sisteme Giriş
            </Link>
          </div>
        </div>
      </section>

      {/* YÖKAK Criteria */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-3">YÖKAK Kalite Göstergeleri</h3>
          <p className="text-slate-400">Akreditasyon süreçlerinde gerekli tüm metrikler</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            title="Öğrenme Çıktıları Analizi"
            description="Ders bazlı öğrenme çıktılarının başarı düzeylerini ölçümleyin"
          />
          <FeatureCard
            icon="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            title="Program Yeterlilikleri"
            description="Programın genel yeterlilik hedeflerine ulaşma oranları"
          />
          <FeatureCard
            icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            title="Başarı Oranları"
            description="Sınıf bazında geçme/kalma oranları ve not dağılımları"
          />
          <FeatureCard
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            title="Kazanım Hesaplamaları"
            description="Ders öğrenme çıktısı - soru eşleştirmeli kazanım analizi"
          />
          <FeatureCard
            icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            title="Onay ve Denetim"
            description="Hiyerarşik onay sistemi ile kalite güvencesi"
          />
          <FeatureCard
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            title="Dönemsel Takip"
            description="Akademik dönem bazlı karşılaştırmalı raporlar"
          />
        </div>
      </section>

      {/* Process Flow */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white mb-3">Kalite Güvence Süreci</h3>
            <p className="text-slate-400">PUKO döngüsüne uygun süreç yönetimi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ProcessStep number={1} title="Planla" description="Ders içerikleri ve öğrenme çıktılarını tanımla" color="blue" />
            <ProcessStep number={2} title="Uygula" description="Sınav ve değerlendirmeleri gerçekleştir" color="green" />
            <ProcessStep number={3} title="Kontrol Et" description="Sonuçları analiz et, başarı oranlarını ölç" color="yellow" />
            <ProcessStep number={4} title="Önlem Al" description="İyileştirme aksiyonlarını belirle" color="red" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-800/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded"
              />
              <div>
                <p className="text-white font-medium">Simav Meslek Yüksekokulu</p>
                <p className="text-sm text-slate-400">Kütahya Dumlupınar Üniversitesi</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-slate-500 text-sm">© 2024-2025 Akademik Kalite Yönetim Sistemi</p>
              <p className="text-slate-600 text-xs">YÖKAK Akreditasyon Uyumlu</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-red-800/50 transition-colors">
      <div className="w-12 h-12 bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}

function ProcessStep({ number, title, description, color }: { number: number; title: string; description: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-600",
    red: "bg-red-600",
  };

  return (
    <div className="text-center">
      <div className={`w-14 h-14 ${colors[color]} text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg`}>
        {number}
      </div>
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}
