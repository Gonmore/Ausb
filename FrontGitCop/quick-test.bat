@echo off
echo ==============================================
echo PRUEBA RAPIDA DE AUSBILDUNG
echo ==============================================

echo.
echo [1/3] Verificando que el backend este corriendo...
curl -s http://localhost:5000 > nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: El backend no esta corriendo en puerto 5000
    echo Ejecuta start-servers.bat primero
    pause
    exit /b 1
)
echo ✓ Backend corriendo correctamente

echo.
echo [2/3] Verificando que el frontend este corriendo...
curl -s http://localhost:3001 > nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: El frontend no esta corriendo en puerto 3001
    echo Ejecuta start-servers.bat primero
    pause
    exit /b 1
)
echo ✓ Frontend corriendo correctamente

echo.
echo [3/3] Abriendo paginas de prueba...
start http://localhost:3001
timeout /t 2 /nobreak > nul
start http://localhost:3001/test
timeout /t 2 /nobreak > nul
start http://localhost:3001/registro

echo.
echo ==============================================
echo PRUEBA COMPLETA
echo ==============================================
echo ✓ Ambos servidores funcionando
echo ✓ Paginas de prueba abiertas
echo.
echo Paginas abiertas:
echo   - Homepage: http://localhost:3001
echo   - Test Page: http://localhost:3001/test
echo   - Registro: http://localhost:3001/registro
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
