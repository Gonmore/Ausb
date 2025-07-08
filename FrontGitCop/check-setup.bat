@echo off
echo =====================================================
echo   VERIFICACION PREVIA - AUSBILDUNG
echo =====================================================

echo.
echo [1/5] Verificando Node.js...
node --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no está instalado
    pause
    exit /b 1
) else (
    echo OK: Node.js instalado
)

echo.
echo [2/5] Verificando npm...
npm --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: npm no está disponible
    pause
    exit /b 1
) else (
    echo OK: npm disponible
)

echo.
echo [3/5] Verificando directorios...
if not exist "c:\Users\arman\OneDrive\Desarrollo\Ausb\ausback" (
    echo ERROR: Directorio backend no encontrado
    pause
    exit /b 1
) else (
    echo OK: Directorio backend encontrado
)

if not exist "c:\Users\arman\OneDrive\Desarrollo\Ausb\FrontGitCop" (
    echo ERROR: Directorio frontend no encontrado
    pause
    exit /b 1
) else (
    echo OK: Directorio frontend encontrado
)

echo.
echo [4/5] Verificando dependencias del backend...
cd /d "c:\Users\arman\OneDrive\Desarrollo\Ausb\ausback"
if not exist "node_modules" (
    echo AVISO: node_modules no encontrado en backend
    echo Instalando dependencias...
    npm install
)
echo OK: Dependencias backend verificadas

echo.
echo [5/5] Verificando dependencias del frontend...
cd /d "c:\Users\arman\OneDrive\Desarrollo\Ausb\FrontGitCop"
if not exist "node_modules" (
    echo AVISO: node_modules no encontrado en frontend
    echo Instalando dependencias...
    npm install
)
echo OK: Dependencias frontend verificadas

echo.
echo =====================================================
echo   VERIFICACION COMPLETADA
echo =====================================================
echo   Todo listo para iniciar las pruebas
echo =====================================================
echo.
echo Presiona cualquier tecla para continuar...
pause > nul
