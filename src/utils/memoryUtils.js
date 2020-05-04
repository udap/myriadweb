const user = {};
const token = "";
const marketType = [
  //INITIATED 草稿, ACTIVATING 券正在生成, ACTIVATED 券已生成, REJECTED 审批拒绝, ARCHIVED 已删除, TERMINATED 已终止;
  { INITIATED: "草稿" },
  { ACTIVATING: "正在发布" },
  { ACTIVATED: "已发布" },
  { TERMINATED: "已撤销" },
];
const couponType = [
  { NEW: "新券" }, // 可发布
  { PENDING: "未生效" }, // 未生效
  { ACTIVE: "可用" }, //  可用
  { REDEEMED: "已兑换" }, // 已兑换
  { EXPIRED: "已过期" }, // 已过期
];


const listType = [
  //  intial creation
  { INITIATED: "草稿" },
  // when settlement is created by merchant
  { SUBMITTED: "提交" },
  // when settlement is approved and processed by marketer
  { PROCESSED: "审批完成" },
  // when something is wrong in the settlement process
  { FAILED: "是吧" },
];

//结算的类型
//NONE, MONTHLY, QUARTERLY, ;
//按月结算，按季度结算，按年结算，按活动结算
const listAddType = [
  {
    value: "NONE",
    name: "按活动结算",
  },
  {
    value: "MONTHLY",
    name: "按月结算",
  },
  {
    value: "QUARTERLY",
    name: "按季度结算",
  },
  {
    value: "ANNUAL",
    name: "按年结算",
  },
];

export {
  user, //保存当前登录的user信息
  token, //保存当前登录的token信息
  marketType, //营销活动
  couponType, //票券管理
  listType, //结算中心
  listAddType,//结算添加类型
};
