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

### 1.9.1 (February 18, 2021)

Fixes and Functionality:

- 关闭 CouponManagement 页面 RangePicker 的清除按钮

### 1.9.x (February 18, 2021)

Fixes and Functionality:

- 新增 设置 => 我的账户 => 密码设置，密码必须是包含 8-18 位英文字母、数字、字符的组合
- 新增 用户登陆时，需用验证码
- 新增 配券记录、发放记录、核销记录查询时间，限制三个月内
- 新增 员工管理，添加“登录账号”列
- 修改 移除 核销记录，机构类型：营销机构、核销机构
- 修改 发放记录，“客户”列，保留前、后八位，中间隐藏用“\*\*\*”代替
- 修改 移除 dotenv-cli 打包组件
