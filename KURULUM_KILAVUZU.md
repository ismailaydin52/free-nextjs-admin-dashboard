# Akgül Elektrik - Kurulum ve Kullanım Kılavuzu

## 📁 Dosya Konumu
```
c:\Users\ASUS\Documents\GitHub\free-nextjs-admin-dashboard
```

## 🚀 Kurulum Adımları

### 1. Node.js Yüklenmesi (Eğer yoksa)
- https://nodejs.org/ adresinden LTS sürümü indir ve kur

### 2. Bağımlılıkları Kur
PowerShell'i yönetici olarak aç ve şunu çalıştır:
```bash
cd c:\Users\ASUS\Documents\GitHub\free-nextjs-admin-dashboard
npm install
```

### 3. EXE Dosyası Oluştur
```bash
npm run electron-build
```

Tamamlandığında `dist` klasöründe `.exe` dosyası olacak.
Kullanıcılara bunu gönderebilirsin.

## 🎯 Kullanım

### Geliştirme Sırasında
```bash
npm run electron-dev
```

### Oluşturduğunuz EXE'yi Çalıştırma
Basitçe `.exe` dosyasına çift tıkla. Hiçbir kurulum gerekmez.

## 💾 Otomatik Yedekleme

- **Haftalık**: Her 7 günde bir otomatik yedek alınır
- **Konum**: `%APPDATA%\Akgül Elektrik\backups`
- **Format**: `backup-YYYY-MM-DD-HH-mm-ss.json`

### Manuel Yedek Alma
Verileri Excel'e aktar (her tab için Dış Aktar butonu)

## 🔤 Excel Yazı Encoding Problemi Çözüldü
- UTF-8 BOM eklendi
- Türkçe karakterler (ç, ğ, ı, ö, ş, ü) doğru görüntülenecek
- Excel otomatik olarak doğru karakterleri gösterecek

## 📊 Veri Yapısı

### Saklanan Veriler:
1. **Ürünler** (Adı, Kategori, Stok, Fiyat)
2. **İşlemler** (Gelir/Gider, Açıklama, Miktar, Tarih)
3. **Borç/Alacak** (Kişi, Miktar, Tür, Durum, Tarih)

Tüm veriler cihazda saklanır - çevrimiçi sunucu gerekmez.

## ❓ Sorun Giderme

### EXE çalışmıyor?
- Node.js kurulu mu kontrol et
- PowerShell'i yönetici olarak aç
- `npm install` tekrar çalıştır

### Veri kaybı?
- Otomatik yedekler `backups` klasöründe
- Excel'e aktarılan dosyalar kurtarılabilir

### Türkçe karakterler bozuk gözüküyor?
- Excel'i kapat ve yeniden aç
- CSV dosyasını Excel'de açarken UTF-8 seç

## 📱 Sistem Gereksinimleri
- Windows 7+
- 200MB boş alan
- İnternet bağlantısı gerekmez

## 🔄 Güncelleme
Yeni sürüm için:
1. Proje dosyalarını güncelle
2. `npm run electron-build` çalıştır
3. Yeni `.exe` yi kullanıcılara gönder
