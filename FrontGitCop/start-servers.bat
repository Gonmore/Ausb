@echo off
echo =====================================================
echo   INICIANDO AUSBILDUNG - FRONTEND Y BACKEND
echo =====================================================

echo.
echo [1/4] Verificando directorios...
if not exist "c:\Users\arman\OneDrive\Desarrollo\Ausb\ausback" (
    echo ERROR: No se encuentra el directorio del backend
    pause
    exit /b 1
)

if not exist "c:\Users\arman\OneDrive\Desarrollo\Ausb\FrontGitCop" (
    echo ERROR: No se encuentra el directorio del frontend
    pause
    exit /b 1
)

echo [2/4] Iniciando Backend...
cd /d "c:\Users\arman\OneDrive\Desarrollo\Ausb\ausback"
start "Backend - Ausbildung" cmd /k "npm run dev"

echo [3/4] Esperando 5 segundos...
timeout /t 5 /nobreak > nul

echo [4/4] Iniciando Frontend...
cd /d "c:\Users\arman\OneDrive\Desarrollo\Ausb\FrontGitCop"
start "Frontend - Ausbildung" cmd /k "npm run dev"

echo.
echo =====================================================
echo   SERVIDORES INICIADOS
echo =====================================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3001
echo =====================================================
echo.
echo Presiona cualquier tecla para abrir el frontend...
pause > nul

start http://localhost:3001

echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
