@echo off
setlocal
cd /d "%~dp0"
title MooSPA - Demo local

where pnpm.cmd >nul 2>&1
if not errorlevel 1 (
  set "MOO_PNPM=pnpm.cmd"
  goto run_pnpm
)

set "MOO_RUNTIME=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies"
if exist "%MOO_RUNTIME%\bin\fallback\pnpm.cmd" (
  set "MOO_PNPM=%MOO_RUNTIME%\bin\fallback\pnpm.cmd"
  set "PATH=%MOO_RUNTIME%\node\bin;%PATH%"
  goto run_pnpm
)

where npm.cmd >nul 2>&1
if not errorlevel 1 goto run_npm
echo Instale Node.js 24 para iniciar a demo: https://nodejs.org/
pause
exit /b 1

:run_pnpm
if not exist node_modules (
  call "%MOO_PNPM%" install
  if errorlevel 1 goto failed
)
echo.
echo Abra o endereco Local exibido abaixo no navegador.
echo Mantenha esta janela aberta durante a demonstracao. Ctrl+C encerra.
call "%MOO_PNPM%" dev
exit /b %ERRORLEVEL%

:run_npm
if not exist node_modules (
  call npm.cmd install
  if errorlevel 1 goto failed
)
echo.
echo Abra o endereco Local exibido abaixo no navegador.
call npm.cmd run dev
exit /b %ERRORLEVEL%

:failed
echo Nao foi possivel instalar as dependencias. Confira a mensagem acima.
pause
exit /b 1
