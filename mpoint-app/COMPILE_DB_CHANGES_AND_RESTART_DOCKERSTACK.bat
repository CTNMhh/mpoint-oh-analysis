@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM === Konfiguration ===
set CONTAINER=mpoint-nextjs
set MIGRATIONS_DIR=%~dp0prisma\migrations

echo [1/4] Ermittele naechste commit_nr_...

REM PowerShell ermittelt die naechste Nummer anhand vorhandener Migrationsordner
for /f "usebackq delims=" %%N in (`powershell -NoProfile -Command ^
  "$dir = '%MIGRATIONS_DIR%' ;" ^
  "if (!(Test-Path $dir)) { $next = 1 } else {" ^
  "  $nums = Get-ChildItem -Path $dir -Directory -Name | ForEach-Object {" ^
  "    if ($_ -match 'commit_nr_(\d+)') { [int]$matches[1] }" ^
  "  } ;" ^
  "  if ($nums) { $next = ($nums | Measure-Object -Maximum).Maximum + 1 } else { $next = 1 }" ^
  "}" ^
  "Write-Output $next"`
) do set NEXT=%%N

set NAME=commit_nr_%NEXT%
echo Nächster Migrationsname: %NAME%

echo.
echo [2/4] Fuehre Migration im Container aus...
REM -i statt -it vermeidet TTY-Probleme beim Doppelklick
docker exec -i %CONTAINER% npx prisma migrate dev --name %NAME%
if errorlevel 1 (
  echo [FEHLER] Migration fehlgeschlagen. Abbruch.
  exit /b 1
)

echo.
echo [3/4] Docker-Compose Stack neu starten...
docker compose -p mpoint restart
if errorlevel 1 (
  echo [WARNUNG] Konnte Stack nicht neu starten. Bitte manuell pruefen.
) else (
  echo Stack 'mpoint' neu gestartet.
)

echo.
echo [4/4] Fertig. Erzeugt: %NAME%
endlocal
pause
