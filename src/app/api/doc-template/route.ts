import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// GET - DÖÇ örnek Excel taslağı indir
export async function GET() {
    try {
        const wb = XLSX.utils.book_new();

        // Kullanım Kılavuzu
        const infoData = [
            { "Bilgi": "YÖKAK DÖÇ Toplu Yükleme Şablonu" },
            { "Bilgi": "" },
            { "Bilgi": "KULLANIM TALİMATLARI:" },
            { "Bilgi": "1. 'DÖÇ Listesi' sayfasını doldurun" },
            { "Bilgi": "2. Her satıra bir DÖÇ (Ders Öğrenme Çıktısı) girin" },
            { "Bilgi": "3. Kod alanına DÖÇ1, DÖÇ2 gibi kodlar yazın" },
            { "Bilgi": "4. Açıklama alanına öğrenme çıktısını yazın" },
            { "Bilgi": "5. Dosyayı kaydedin ve sisteme yükleyin" },
        ];
        const wsInfo = XLSX.utils.json_to_sheet(infoData);
        wsInfo["!cols"] = [{ wch: 60 }];
        XLSX.utils.book_append_sheet(wb, wsInfo, "Kullanım Kılavuzu");

        // DÖÇ Listesi
        const docData = [
            { "Kod": "DÖÇ1", "Açıklama": "Temel mesleki kavramları açıklayabilir", "Ağırlık": 1.0 },
            { "Kod": "DÖÇ2", "Açıklama": "Problemleri analiz edebilir ve çözüm önerileri geliştirebilir", "Ağırlık": 1.0 },
            { "Kod": "DÖÇ3", "Açıklama": "Ekip çalışmasına uyum sağlar ve iletişim becerilerini kullanır", "Ağırlık": 1.0 },
            { "Kod": "DÖÇ4", "Açıklama": "Mesleki etik değerlere uygun davranır", "Ağırlık": 1.0 },
            { "Kod": "DÖÇ5", "Açıklama": "Güncel teknolojileri takip eder ve uygular", "Ağırlık": 1.0 },
        ];
        const wsDoc = XLSX.utils.json_to_sheet(docData);
        wsDoc["!cols"] = [{ wch: 10 }, { wch: 60 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, wsDoc, "DÖÇ Listesi");

        // Soru-DÖÇ Eşleştirme Örneği
        const mappingData = [
            { "Soru No": 1, "Puan": 20, "DÖÇ Kodu": "DÖÇ1", "Öğrenci Ort. Puanı": 15, "Açıklama": "Kavram sorusu" },
            { "Soru No": 2, "Puan": 25, "DÖÇ Kodu": "DÖÇ2", "Öğrenci Ort. Puanı": 18, "Açıklama": "Problem çözme" },
            { "Soru No": 3, "Puan": 20, "DÖÇ Kodu": "DÖÇ3", "Öğrenci Ort. Puanı": 16, "Açıklama": "Grup çalışması" },
            { "Soru No": 4, "Puan": 15, "DÖÇ Kodu": "DÖÇ4", "Öğrenci Ort. Puanı": 12, "Açıklama": "Etik değerlendirme" },
            { "Soru No": 5, "Puan": 20, "DÖÇ Kodu": "DÖÇ5", "Öğrenci Ort. Puanı": 17, "Açıklama": "Teknoloji uygulaması" },
        ];
        const wsMapping = XLSX.utils.json_to_sheet(mappingData);
        wsMapping["!cols"] = [{ wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 18 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, wsMapping, "Soru-DÖÇ Eşleştirme");

        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": "attachment; filename=YOKAK_DOC_Sablonu.xlsx",
            },
        });
    } catch (error) {
        console.error("DÖÇ taslağı oluşturulamadı:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
