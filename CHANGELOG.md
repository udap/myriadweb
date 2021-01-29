# Changelog

### 1.8.1 (January 26, 2021)

Fixes and Functionality:

- 修改 通知列表日期，由前端设置(date)改为后端返回(createTime)
- 修改 SSE heartbeatTimeout=30_000(默认 45s)
- 取消 SSE onopen, onerror 打印日志(console.log)
- 新增 “一键已读 消息” 功能
- 添加 ChangeLog.md 文件，记录开发日志

### 1.8.x (January 28, 2021)

Fixes and Functionality:

- 修改 campaign => 查看详情，“允许增发”改为“自动增发”
- 修改 campaign => 更多 => 增发，“增发数量”：每次增发的数量不要超过原来的“计划发行数”
- 优化 “增发数量”的 InputNumber 宽度为 50%
