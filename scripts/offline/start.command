#!/bin/bash
cd "$(dirname "$0")"
PORT=18765
echo "蚕食单词离线版：http://127.0.0.1:${PORT}/"
echo "关闭本窗口即可停止服务。"
(sleep 1 && open "http://127.0.0.1:${PORT}/") &
python3 -m http.server "$PORT"
