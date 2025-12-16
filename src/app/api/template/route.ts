import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// GET - Excel taslağı indir (query param ile sınav türü seçimi)
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const examType = searchParams.get("type") || "general"; // vize, final, butunleme, general
        const courseCode = searchParams.get("course") || "DERS101";
        const courseName = searchParams.get("name") || "Örnek Ders";

        // Workbook oluştur
        const wb = XLSX.utils.book_new();

        // Şablon türüne göre farklı içerik
        if (examType === "vize") {
            createVizeTemplate(wb, courseCode, courseName);
        } else if (examType === "final") {
            createFinalTemplate(wb, courseCode, courseName);
        } else if (examType === "butunleme") {
            createButunlemeTemplate(wb, courseCode, courseName);
        } else {
            createGeneralTemplate(wb);
        }

        // Excel dosyasını oluştur
        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        const fileName = examType === "general"
            ? "AKPYS_Not_Taslagi.xlsx"
            : `AKPYS_${courseCode}_${examType.toUpperCase()}.xlsx`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename=${fileName}`,
            },
        });
    } catch (error) {
        console.error("Taslak oluşturulamadı:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// Genel Şablon
function createGeneralTemplate(wb: XLSX.WorkBook) {
    // Bilgi sayfası
    const infoData = [
        { "AKPYS - Akademik Kalite Yönetim Sistemi": "" },
        { "AKPYS - Akademik Kalite Yönetim Sistemi": "" },
        { "AKPYS - Akademik Kalite Yönetim Sistemi": "GENEL NOT GİRİŞ ŞABLONU" },
        { "AKPYS - Akademik Kalite Yönetim Sistemi": "" },
        { "AKPYS - Akademik Kalite Yönetim Sistemi": "KULLANIM:" },
        { "AKPYS - Akademik Kalite Yönetim Sistemi": "1. 'Notlar' sayfasına öğrenci bilgilerini girin" },
        { "AKPYS - Akademik Kalite Yönetim Sistemi": "2. Notları 0-100 arası sayısal değer olarak girin" },
        { "AKPYS - Akademik Kalite Yönetim Sistemi": "3. Dosyayı sisteme yükleyin" },
    ];
    const wsInfo = XLSX.utils.json_to_sheet(infoData);
    XLSX.utils.book_append_sheet(wb, wsInfo, "Bilgi");

    // Not tablosu
    const templateData = [
        { "Öğrenci No": "2021001", "Ad Soyad": "Örnek Öğrenci 1", "Not": 75 },
        { "Öğrenci No": "2021002", "Ad Soyad": "Örnek Öğrenci 2", "Not": 60 },
        { "Öğrenci No": "2021003", "Ad Soyad": "Örnek Öğrenci 3", "Not": 45 },
    ];
    const wsData = XLSX.utils.json_to_sheet(templateData);
    wsData["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsData, "Notlar");
}

// Vize Şablonu
function createVizeTemplate(wb: XLSX.WorkBook, courseCode: string, courseName: string) {
    // Ders Bilgisi
    const infoData = [
        { "Alan": "Ders Kodu", "Değer": courseCode },
        { "Alan": "Ders Adı", "Değer": courseName },
        { "Alan": "Sınav Türü", "Değer": "VİZE" },
        { "Alan": "Akademik Yıl", "Değer": "2024-2025" },
        { "Alan": "Dönem", "Değer": "Güz" },
        { "Alan": "", "Değer": "" },
        { "Alan": "YÖKAK Uyarısı", "Değer": "Notları 0-100 arası girin. Sistem otomatik hesaplama yapar." },
    ];
    const wsInfo = XLSX.utils.json_to_sheet(infoData);
    wsInfo["!cols"] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsInfo, "Ders Bilgisi");

    // Vize notları
    const vizeData = [
        { "Öğrenci No": "2021001", "Ad Soyad": "Örnek Öğrenci 1", "Vize Notu": 75, "Açıklama": "" },
        { "Öğrenci No": "2021002", "Ad Soyad": "Örnek Öğrenci 2", "Vize Notu": 60, "Açıklama": "" },
        { "Öğrenci No": "2021003", "Ad Soyad": "Örnek Öğrenci 3", "Vize Notu": 45, "Açıklama": "Sınava girmedi" },
    ];
    const wsVize = XLSX.utils.json_to_sheet(vizeData);
    wsVize["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsVize, "Vize Notları");

    // Öğrenme Çıktıları Değerlendirmesi (opsiyonel)
    const docData = [
        { "Soru No": 1, "DÖÇ1": 1, "DÖÇ2": 0, "DÖÇ3": 0, "Puan": 20 },
        { "Soru No": 2, "DÖÇ1": 0, "DÖÇ2": 1, "DÖÇ3": 0, "Puan": 25 },
        { "Soru No": 3, "DÖÇ1": 1, "DÖÇ2": 1, "DÖÇ3": 0, "Puan": 25 },
        { "Soru No": 4, "DÖÇ1": 0, "DÖÇ2": 0, "DÖÇ3": 1, "Puan": 15 },
        { "Soru No": 5, "DÖÇ1": 0, "DÖÇ2": 1, "DÖÇ3": 1, "Puan": 15 },
    ];
    const wsDoc = XLSX.utils.json_to_sheet(docData);
    wsDoc["!cols"] = [{ wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsDoc, "Soru-DÖÇ Eşleştirme");
}

// Final Şablonu
function createFinalTemplate(wb: XLSX.WorkBook, courseCode: string, courseName: string) {
    // Ders Bilgisi
    const infoData = [
        { "Alan": "Ders Kodu", "Değer": courseCode },
        { "Alan": "Ders Adı", "Değer": courseName },
        { "Alan": "Sınav Türü", "Değer": "FİNAL" },
        { "Alan": "Akademik Yıl", "Değer": "2024-2025" },
        { "Alan": "Dönem", "Değer": "Güz" },
        { "Alan": "", "Değer": "" },
        { "Alan": "YÖKAK Notu", "Değer": "Vize ve Final notlarını ayrı ayrı sisteme yükleyin." },
    ];
    const wsInfo = XLSX.utils.json_to_sheet(infoData);
    wsInfo["!cols"] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsInfo, "Ders Bilgisi");

    // Final notları
    const finalData = [
        { "Öğrenci No": "2021001", "Ad Soyad": "Örnek Öğrenci 1", "Final Notu": 80, "Açıklama": "" },
        { "Öğrenci No": "2021002", "Ad Soyad": "Örnek Öğrenci 2", "Final Notu": 55, "Açıklama": "" },
        { "Öğrenci No": "2021003", "Ad Soyad": "Örnek Öğrenci 3", "Final Notu": 0, "Açıklama": "Sınava girmedi" },
    ];
    const wsData = XLSX.utils.json_to_sheet(finalData);
    wsData["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsData, "Final Notları");

    // Öğrenme Çıktıları Değerlendirmesi
    const docData = [
        { "Soru No": 1, "DÖÇ1": 1, "DÖÇ2": 1, "DÖÇ3": 0, "DÖÇ4": 0, "Puan": 20 },
        { "Soru No": 2, "DÖÇ1": 0, "DÖÇ2": 1, "DÖÇ3": 1, "DÖÇ4": 0, "Puan": 20 },
        { "Soru No": 3, "DÖÇ1": 1, "DÖÇ2": 0, "DÖÇ3": 1, "DÖÇ4": 0, "Puan": 20 },
        { "Soru No": 4, "DÖÇ1": 0, "DÖÇ2": 0, "DÖÇ3": 0, "DÖÇ4": 1, "Puan": 20 },
        { "Soru No": 5, "DÖÇ1": 1, "DÖÇ2": 1, "DÖÇ3": 1, "DÖÇ4": 1, "Puan": 20 },
    ];
    const wsDoc = XLSX.utils.json_to_sheet(docData);
    wsDoc["!cols"] = [{ wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsDoc, "Soru-DÖÇ Eşleştirme");
}

// Bütünleme Şablonu
function createButunlemeTemplate(wb: XLSX.WorkBook, courseCode: string, courseName: string) {
    // Ders Bilgisi
    const infoData = [
        { "Alan": "Ders Kodu", "Değer": courseCode },
        { "Alan": "Ders Adı", "Değer": courseName },
        { "Alan": "Sınav Türü", "Değer": "BÜTÜNLEME" },
        { "Alan": "Akademik Yıl", "Değer": "2024-2025" },
        { "Alan": "Dönem", "Değer": "Güz" },
        { "Alan": "", "Değer": "" },
        { "Alan": "Önemli", "Değer": "Sadece bütünlemeye giren öğrencilerin notlarını girin." },
    ];
    const wsInfo = XLSX.utils.json_to_sheet(infoData);
    wsInfo["!cols"] = [{ wch: 20 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsInfo, "Ders Bilgisi");

    // Bütünleme notları
    const butData = [
        { "Öğrenci No": "2021002", "Ad Soyad": "Örnek Öğrenci 2", "Bütünleme Notu": 65, "Açıklama": "" },
        { "Öğrenci No": "2021003", "Ad Soyad": "Örnek Öğrenci 3", "Bütünleme Notu": 50, "Açıklama": "" },
    ];
    const wsData = XLSX.utils.json_to_sheet(butData);
    wsData["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsData, "Bütünleme Notları");
}
