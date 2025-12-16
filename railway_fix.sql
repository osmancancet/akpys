-- 1. Enum Değerlerini Güncelle (Hata alırsanız bu adımı atlayın, zaten eklenmiş olabilir)
DO $$ BEGIN
    ALTER TYPE "UserRole" ADD VALUE 'HEAD_OF_DEPARTMENT';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "UserRole" ADD VALUE 'SECRETARY';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Admin Kullanıcısını Ekle veya Güncelle
INSERT INTO "User" (id, email, "fullName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'cm4r1admin001',
  'oskitocan55@gmail.com',
  'Osman Can Çetiner',
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET 
    role = 'ADMIN', 
    "isActive" = true, 
    "fullName" = 'Osman Can Çetiner',
    "updatedAt" = NOW();

-- 3. Diğer Test Kullanıcılarını Ekle (Opsiyonel)
INSERT INTO "User" (id, email, "fullName", role, "isActive", "createdAt", "updatedAt")
VALUES 
  ('cm4r1mgr001', 'mudur.yrd@okul.edu.tr', 'Dr. Ahmet Demir', 'MANAGER', true, NOW(), NOW()),
  ('cm4r1sec001', 'sekreter@okul.edu.tr', 'Ayşe Yılmaz', 'SECRETARY', true, NOW(), NOW()),
  ('cm4r1hod001', 'bolum.bsk@okul.edu.tr', 'Prof. Dr. Mehmet Kaya', 'HEAD_OF_DEPARTMENT', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
