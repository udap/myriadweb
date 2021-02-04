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

### 1.9.0 (February 03, 2021)

Fixes and Functionality:

- 重构 “票券管理”页面完成
- 注释 营销活动 与 票券管理相关的操作（增发、配券和发放）
- 修改 票券管理 => 详情，“允许增发”改为“自动增发”
- 修改 样式书写问题 class => className
- 移除 项目备注.md 文件
