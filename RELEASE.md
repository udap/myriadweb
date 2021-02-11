## myriadweb-v1.6.1-release

> 更新内容：

- 修复 主页 => 设置 => 我的客户，录入新增客户信息后，点击“提交”按钮出错的问题
- 修复 主页 => 设置 => 我的客户，客户经理为空，点击操作栏的编辑按钮出错的问题
- 修复 手机验证码登录时，手机号判断是否为空（改为是否为 11 位）的问题

> 基于 myriadweb-v1.6.0-release 修改

编辑时间：2021-01-14 20:40

## myriadweb-v1.7.0-release

> 更新内容：

- 变更注册机构的请求
- 添加审批拒绝的请求及界面

> 基于 myriadweb-v1.6.1-release 修改

编辑时间：2021-01-20 17:03

## myriadweb-v1.8.0-release

> 更新内容：

- 新增 下属机构页面，添加下属机构时，能为下属机构创建新机构
- 新增 登录时，“非正常”机构提示时，添加此机构全称显示
- 修改 机构为 SUSPENDED 时，显示文案修改
- 优化 页面 main 层级，取消 padding-top: 24px

> 基于 myriadweb-v1.7.0-release 修改

编辑时间：2021-01-25 11:27

## myriadweb-v1.8.1-release

> 更新内容：

- 修改 通知列表日期，由前端设置(date)改为后端返回(createTime)
- 修改 SSE heartbeatTimeout=30_000(默认 45s)
- 取消 SSE onopen, onerror 打印日志(console.log)
- 新增 “一键已读 消息” 功能
- 添加 ChangeLog.md 文件，记录开发日志

> 基于 myriadweb-v1.8.0-release 修改

编辑时间：2021-01-26 17:59

## myriadweb-v1.9.0-release

> 更新内容：

- 重构 “票券管理”页面完成
- 注释 营销活动 与 票券管理相关的操作（增发、配券和发放）
- 修改 票券管理 => 详情，“允许增发”改为“自动增发”
- 修改 样式书写问题 class => className
- 移除 项目备注.md 文件

> 基于 myriadweb-v1.8.1-release 修改

编辑时间：2021-02-10 20:09
