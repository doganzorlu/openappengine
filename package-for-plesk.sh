#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=========================================================="
echo "🚀 OpenAppEngine Plesk Dağıtım Paketi Hazırlanıyor..."
echo "=========================================================="

echo "📦 1. React Frontend derleniyor (npm run build)..."
docker exec openappengine-frontend npm run build

echo "📁 2. React build çıktıları Laravel public dizinine kopyalanıyor..."
cp -r frontend/dist/* backend/public/

echo "💾 3. Veritabanı dökümü alınıyor (openappengine_plesk_dump.sql)..."
docker exec openappengine-db mysqldump -uopenappengine -popenappenginesecure openappengine > openappengine_plesk_dump.sql

echo "📦 4. Zip paketi sıkıştırılıyor..."
PACKAGE_NAME="openappengine-plesk-deploy.zip"
rm -f "$PACKAGE_NAME" backend/"$PACKAGE_NAME"

# Create zip using docker php container to include vendor without host permission issues
docker exec openappengine-backend php -r '
$zip = new ZipArchive();
if ($zip->open("/var/www/html/openappengine-plesk-deploy.zip", ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
    $base = "/var/www/html";

    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($base, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    $count = 0;
    foreach ($files as $name => $file) {
        $filePath = $file->getPathname();
        $relativePath = substr($filePath, strlen($base) + 1);

        if ($file->isLink() || !is_readable($filePath) || !file_exists($filePath)) continue;
        if (str_starts_with(basename($filePath), "._")) continue;
        if (str_starts_with($relativePath, "public/storage")) continue;

        if (str_starts_with($relativePath, "storage/logs/") && !str_ends_with($relativePath, ".gitignore")) continue;
        if (str_starts_with($relativePath, ".git")) continue;
        if (str_ends_with($relativePath, ".zip")) continue;
        if (str_ends_with($relativePath, ".sql")) continue;

        if (!$file->isDir()) {
            $zip->addFile($filePath, $relativePath);
            $count++;
        }
    }
    $zip->close();
    echo "Pakete $count dosya eklendi.\n";
} else {
    echo "Zip açılamadı.\n";
    exit(1);
}
'

mv backend/openappengine-plesk-deploy.zip ./

echo "=========================================================="
echo "✅ Plesk Paketi Hazır!"
echo "   - Web Uygulama Paketi : openappengine-plesk-deploy.zip"
echo "   - Veritabanı Dökümü   : openappengine_plesk_dump.sql"
echo "=========================================================="
ls -lh openappengine-plesk-deploy.zip openappengine_plesk_dump.sql
