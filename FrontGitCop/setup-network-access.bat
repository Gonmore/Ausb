@echo off
echo ============================================
echo    CONFIGURACION DE ACCESO A RED LOCAL
echo ============================================
echo.
echo Este script configura el sistema para que
echo otros usuarios de la red puedan acceder.
echo.

REM Obtener la IP local
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /R /C:"IPv4 Address"') do (
    for /f "tokens=*" %%a in ("%%i") do set IP=%%a
)
set IP=%IP:~1%

if "%IP%"=="" (
    echo ❌ No se pudo detectar la IP local
    echo Verifica tu conexión de red
    pause
    exit /b 1
)

echo ✅ IP local detectada: %IP%
echo.
echo ============================================
echo    INSTRUCCIONES PARA ACCESO EN RED
echo ============================================
echo.
echo 1. El backend ya está configurado para escuchar
echo    en todas las interfaces de red.
echo.
echo 2. Para que el frontend funcione desde otros
echo    equipos, actualiza el archivo .env.local:
echo.
echo    Cambia esta línea:
echo    NEXT_PUBLIC_API_URL=http://localhost:5000
echo.
echo    Por esta:
echo    NEXT_PUBLIC_API_URL=http://%IP%:5000
echo.
echo 3. Reinicia el servidor frontend con:
echo    npm run dev
echo.
echo 4. Otros usuarios podrán acceder desde:
echo    http://%IP%:3001 (o el puerto que uses)
echo.
echo ============================================
echo.
echo ¿Quieres que actualice automáticamente
echo la configuración del frontend? (S/N)
set /p choice=

if /i "%choice%"=="S" (
    echo.
    echo Actualizando configuración...
    powershell -Command "(Get-Content .env.local) -replace 'NEXT_PUBLIC_API_URL=http://localhost:5000', 'NEXT_PUBLIC_API_URL=http://%IP%:5000' | Set-Content .env.local"
    echo ✅ Configuración actualizada
    echo.
    echo Ahora reinicia el servidor frontend:
    echo npm run dev
) else (
    echo.
    echo Configuración no modificada.
    echo Recuerda actualizar manualmente .env.local
)

echo.
echo Presiona cualquier tecla para continuar...
pause >nul