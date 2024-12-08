:: 启动后端服务
echo.
echo 正在启动后端服务...
start "后端服务" cmd /c "cd backend && npm start"

:: 等待2秒
timeout /t 2 > nul

:: 启动前端服务
echo.
echo 正在启动前端服务...
start "前端服务" cmd /c "cd frontend && npm run dev"

:: 等待2秒
timeout /t 2 > nul

:: 打开浏览器
::echo.
::echo 正在打开浏览器...
::start http://localhost:8080