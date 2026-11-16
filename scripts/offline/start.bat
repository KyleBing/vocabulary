@echo off
cd /d "%~dp0"
set PORT=18765
echo 蚕食单词离线版：http://127.0.0.1:%PORT%/
echo 关闭本窗口即可停止服务。
start "" "http://127.0.0.1:%PORT%/"
python -m http.server %PORT%
if errorlevel 1 (
  echo.
  echo 未找到 python，请先安装 Python，或用浏览器直接打开 index.html 试一下。
  pause
)
