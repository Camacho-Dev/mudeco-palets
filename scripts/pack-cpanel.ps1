# scripts/pack-cpanel.ps1 - Generador del paquete de despliegue para cPanel (Namecheap)
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Generador de Paquete de Despliegue cPanel (Namecheap)   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

Write-Host "`n1. Generando Prisma Client y Compilando proyecto en modo Standalone..." -ForegroundColor Yellow
npm run build

$standaloneDir = Join-Path $rootDir ".next\standalone"
$standaloneNext = Join-Path $standaloneDir ".next"
$sourceStatic = Join-Path $rootDir ".next\static"
$targetStatic = Join-Path $standaloneNext "static"

Write-Host "`n2. Copiando archivos estaticos de Next.js al standalone..." -ForegroundColor Yellow
if (Test-Path $sourceStatic) {
    if (-not (Test-Path $targetStatic)) {
        New-Item -ItemType Directory -Path $targetStatic -Force | Out-Null
    }
    Copy-Item -Path "$sourceStatic\*" -Destination $targetStatic -Recurse -Force
}

$sourcePublic = Join-Path $rootDir "public"
$targetPublic = Join-Path $standaloneDir "public"
Write-Host "3. Copiando carpeta public..." -ForegroundColor Yellow
if (Test-Path $sourcePublic) {
    if (-not (Test-Path $targetPublic)) {
        New-Item -ItemType Directory -Path $targetPublic -Force | Out-Null
    }
    Copy-Item -Path "$sourcePublic\*" -Destination $targetPublic -Recurse -Force
}

$sourcePrisma = Join-Path $rootDir "prisma"
$targetPrisma = Join-Path $standaloneDir "prisma"
Write-Host "4. Copiando esquemas y migraciones de Prisma..." -ForegroundColor Yellow
if (Test-Path $sourcePrisma) {
    if (-not (Test-Path $targetPrisma)) {
        New-Item -ItemType Directory -Path $targetPrisma -Force | Out-Null
    }
    Copy-Item -Path "$sourcePrisma\*" -Destination $targetPrisma -Recurse -Force
}

# Asegurar que los motores binarios de Prisma para Linux estén copiados al standalone
$sourcePrismaEngines = Join-Path $rootDir "node_modules\.prisma\client"
$targetPrismaEngines = Join-Path $standaloneDir "node_modules\.prisma\client"
Write-Host "5. Asegurando binarios Linux de Prisma (CloudLinux/RHEL/CentOS)..." -ForegroundColor Yellow
if (-not (Test-Path $targetPrismaEngines)) {
    New-Item -ItemType Directory -Path $targetPrismaEngines -Force | Out-Null
}
if (Test-Path $sourcePrismaEngines) {
    Get-ChildItem -Path $sourcePrismaEngines -Filter "*.so.node" | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $targetPrismaEngines -Force
        Write-Host "   + Copiado motor: $($_.Name)" -ForegroundColor Green
    }
    # Eliminar temporales que pudieran inflar el zip
    Get-ChildItem -Path $targetPrismaEngines -Filter "*.tmp*" | Remove-Item -Force -ErrorAction SilentlyContinue
}

$envTemplate = Join-Path $rootDir ".env.example"
if (Test-Path $envTemplate) {
    Copy-Item -Path $envTemplate -Destination (Join-Path $standaloneDir ".env.example") -Force
}

$zipPath = Join-Path $rootDir "cpanel-deploy.zip"
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

Write-Host "`n6. Empaquetando en cpanel-deploy.zip..." -ForegroundColor Yellow
Set-Location $standaloneDir

# Empaquetar todo el contenido incluyendo directorios ocultos (.next)
tar -acf $zipPath * .next

Set-Location $rootDir
$zipItem = Get-Item $zipPath
$sizeMb = [math]::Round($zipItem.Length / 1MB, 2)

Write-Host "`n[OK] Paquete creado con exito:" -ForegroundColor Green
Write-Host "  Ruta: $zipPath" -ForegroundColor White
Write-Host "  Tamano: $sizeMb MB" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
