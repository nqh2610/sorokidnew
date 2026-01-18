#!/bin/bash
#
# 📊 PROCESS MONITOR SCRIPT CHO SHARED HOST
# 
# Script này giúp theo dõi số lượng processes đang chạy
# Chạy định kỳ để phát hiện sớm vấn đề
#
# Cách sử dụng:
# chmod +x scripts/monitor-processes.sh
# ./scripts/monitor-processes.sh
#
# Thêm vào crontab để chạy mỗi 5 phút:
# */5 * * * * /path/to/sorokid/scripts/monitor-processes.sh >> /path/to/logs/process-monitor.log 2>&1

# ============ CONFIG ============
PROCESS_LIMIT=1000           # Giới hạn của shared host
WARNING_THRESHOLD=700        # Cảnh báo khi vượt 70%
CRITICAL_THRESHOLD=850       # Critical khi vượt 85%
LOG_DIR="${HOME}/logs"
APP_NAME="sorokid"

# ============ FUNCTIONS ============

get_timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# Đếm tổng processes của user
get_total_processes() {
    ps aux | grep -c "^$(whoami)"
}

# Đếm processes của Node.js
get_node_processes() {
    pgrep -u $(whoami) -c "node" 2>/dev/null || echo 0
}

# Đếm processes của PM2
get_pm2_processes() {
    pgrep -u $(whoami) -c "PM2" 2>/dev/null || echo 0
}

# Lấy memory usage của app
get_memory_usage() {
    pm2 jlist 2>/dev/null | grep -o '"memory":[0-9]*' | head -1 | grep -o '[0-9]*' || echo 0
}

# ============ MAIN ============

echo "================================================"
echo "📊 PROCESS MONITOR - $(get_timestamp)"
echo "================================================"

TOTAL_PROCESSES=$(get_total_processes)
NODE_PROCESSES=$(get_node_processes)
PM2_PROCESSES=$(get_pm2_processes)
MEMORY_BYTES=$(get_memory_usage)
MEMORY_MB=$((MEMORY_BYTES / 1024 / 1024))

echo ""
echo "📈 Process Statistics:"
echo "   Total User Processes: $TOTAL_PROCESSES / $PROCESS_LIMIT"
echo "   Node.js Processes:    $NODE_PROCESSES"
echo "   PM2 Processes:        $PM2_PROCESSES"
echo "   App Memory Usage:     ${MEMORY_MB}MB"
echo ""

# Tính phần trăm sử dụng
USAGE_PERCENT=$((TOTAL_PROCESSES * 100 / PROCESS_LIMIT))
echo "   Usage:                ${USAGE_PERCENT}%"
echo ""

# Cảnh báo theo mức
if [ $TOTAL_PROCESSES -ge $CRITICAL_THRESHOLD ]; then
    echo "🚨 CRITICAL: Process count is CRITICAL! ($TOTAL_PROCESSES >= $CRITICAL_THRESHOLD)"
    echo "   ACTION REQUIRED: Consider restarting app gracefully"
    echo ""
    
    # Log chi tiết processes
    echo "📋 Top processes by user:"
    ps aux --sort=-%mem | grep "^$(whoami)" | head -20
    
elif [ $TOTAL_PROCESSES -ge $WARNING_THRESHOLD ]; then
    echo "⚠️  WARNING: Process count is HIGH! ($TOTAL_PROCESSES >= $WARNING_THRESHOLD)"
    echo "   Monitor closely for further increases"
    echo ""
fi

# Kiểm tra PM2 status
echo "📱 PM2 Status:"
if command -v pm2 &> /dev/null; then
    pm2 list 2>/dev/null | grep "$APP_NAME" || echo "   App not running in PM2"
else
    echo "   PM2 not found"
fi

echo ""
echo "================================================"
echo "✅ Check completed at $(get_timestamp)"
echo "================================================"
echo ""
