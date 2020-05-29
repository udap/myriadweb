const user = {};
const token = "";
const campaignStatuses = [
  //INITIATED 草稿, ACTIVATING 券正在生成, ACTIVATED 券已生成, REJECTED 审批拒绝, ARCHIVED 已删除, TERMINATED 已终止;
  { INITIATED: "草稿" },
  { ACTIVATING: "发布中" },
  { ACTIVATED: "已发布" },
  { TERMINATED: "已撤销" },
];
const couponStatuses = [
  { NEW: "新券" }, // 可发布
  { PENDING: "未生效" }, // 未生效
  { ACTIVE: "可用" }, //  可用
  { REDEEMED: "已兑换" }, // 已兑换
  { EXPIRED: "已过期" }, // 已过期
];

const campaignTypes = [
  { VOUCHER: "票券活动" },
  { COUPON: "优惠券活动" },
  { GIFT: "礼品卡活动" },
  { PREPAID_CARD: "储值卡活动" },
  { MEMBERSHIP_CARD: "会员卡活动" },
  { PROMOTION: "促销活动" },
];

const voucherTypes = [
  { COUPON: "优惠券" },
  { AMOUNT: "代金券" },
  { PERCENT: "折扣券" },
  { UNIT: "产品券" },
  { GIFT: "礼品卡" },
  { PREPAID_CARD: "储值卡" },
  { MEMBERSHIP_CARD: "会员卡" },
];

const settlementStatuses = [
  { INITIATED: "预结算" },
  { SUBMITTED: "结算中" },
  { PROCESSED: "结算完成" },
  { FAILED: "结算失败" },
];

const employeeStatuses = [
  { NEW: "新增" },
  { ACTIVE: "在职" },
  { SUSPENDED: "停职" },
  { TERMINATED: "离职" },
];
const roleTypes = [{ ADMIN: "管理员" }, { STAFF: "职员" }];

//结算的类型
//NONE, MONTHLY, QUARTERLY, ;
//按月结算，按季度结算，按年结算，按活动结算
const settlementTypes = [
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

//发放列表
//PENDING, SUCCESS, FAILED;
const distributionStatuses = [
  { PENDING: "发放中" },
  { SUCCESS: "发放成功" },
  { FAILED: "发放失败" },
];

const redemptionStatuses = [
  { PENDING: "核销中" },
  { SUCCESS: "核销成功" },
  { FAILED: "核销失败" },
];
const orgStatusesList = [
  { NEW: "新建" },
  { ACTIVE: "已启用" },
  { SUSPENDED: "已暂停" },
  { DELETED: "已删除" },
];
//请求权限
var Operations = {
  MANAGE_ORGANIZATION: "管理机构",
  LIST_SUBSIDIARIES: "查询机构列表",
  VIEW_ORGANIZATION: "显示机构详情",
  CREATE_SUBSIDIARY: "添加下属机构",
  UPDATE_ORGANIZATION: "修改机构信息",
  DELETE_SUBSIDIARY: "删除下属机构",
  MANAGE_SHIPPING_ADDRESS: "管理收货地址",
  MANAGE_EMPLOYEE: "管理员工",
  LIST_EMPLOYEES: "查询员工列表",
  VIEW_EMPLOYEE: "显示员工详情",
  CREATE_EMPLOYEE: "增加员工",
  UPDATE_EMPLOYEE: "修改员工信息",
  DELETE_EMPLOYEE: "删除员工",
  ONBOARDING: "确认员工加入机构",
  TRANSFER_EMPLOYEE: "调动员工",
  MANAGE_GROUP: "管理分组",
  LIST_GROUPS: "查询分组列表",
  CREATE_GROUP: "新增分组",
  VIEW_GROUP: "显示分组详情",
  UPDATE_GROUP: "修改分组信息",
  DELETE_GROUP: "删除分组",
  MANAGE_DISTRIBUTION_POINT: "管理兑换门店",
  LIST_DISTRIBUTION_POINTS: "查询门店列表",
  CREATE_DISTRIBUTION_POINT: "添加门店",
  VIEW_DISTRIBUTION_POINT: "显示门店详情",
  UPDATE_DISTRIBUTION_POINT: "修改门店信息",
  DELETE_DISTRIBUTION_POINT: "删除门店",
  JOIN_DISTRIBUTION_NETWORK: "加入门店",
  MANAGE_CAMPAIGN: "管理营销活动",
  LIST_CAMPAIGNS: "查询营销活动列表",
  VIEW_CAMPAIGN: "显示营销活动详情",
  CREATE_CAMPAIGN: "创建营销活动",
  UPDATE_CAMPAIGN: "修改营销活动信息",
  DELETE_CAMPAIGN: "删除营销活动",
  CREATE_DURABLE_QRCODE: "生成领券二维码",
  MANAGE_CUSTOMER: "管理客户",
  LIST_CUSTOMERS: "查询直属客户列表",
  LIST_CUSTOMERS_INC_SUBS: "查询所有客户列表",
  CREATE_CUSTOMER: "添加客户",
  VIEW_CUSTOMER: "查看客户详情",
  UPDATE_CUSTOMER: "修改客户信息",
  DELETE_CUSTOMER: "删除客户",
  TRANSFER_CUSTOMER: "移交客户",
  MANAGE_TAG: "管理标签",
  LIST_TAGS: "查看标签",
  CREATE_TAG: "创建标签",
  DELETE_TAG: "删除标签",
  MANAGE_RESOURCE: "管理资源需求", //商品库管理 需求管理
  MANAGE_PRODUCT: "商品库管理",
  LIST_PRODUCTS: "查询商品信息列表",
  VIEW_PRODUCT: "查看商品信息",
  CREATE_PRODUCT: "商品信息批量导入",
  UPDATE_PRODUCT: "商品信息维护",
  DELETE_PRODUCT: "删除商品信息",
  MANAGE_DEMAND: "管理需求",
  LIST_DEMANDS: "需求列表及查询",
  VIEW_DEMAND: "查看需求",
  CREATE_DEMAND: "需求录入",
  UPDATE_DEMAND: "修改需求",
  REVIEW_DEMAND: "需求审批",
  DELETE_DEMAND: "删除或撤销需求",
  STATISTICS_DEMANDS: "需求统计",
  MANAGE_MERCHANT: "管理入驻商户",
  LIST_MERCHANTS: "查询入驻商户列表",
  VIEW_MERCHANT: "查询入驻商户详情",
  CREATE_MERCHANT: "添加入驻商户",
  UPDATE_MERCHANT: "修改入驻商户信息",
  DELETE_MERCHANT: "删除入驻商户",
  MANAGE_GIFT: "管理商品",
  LISTING: "上架商品",
  DELISTING: "下架商品",
  VIEW_GIFT: "查看商品",
  STOCK_IN: "入库",
  STOCK_OUT: "出库",
  MANAGE_QUOTA: "配额分配",
  ENTRUST: "配送（委托）",
  TRANSFER: "让渡（调配）",
  REDEEM_GIFT: "兑换礼品",
  VIEW_INVENTORY: "库存查询",
  ISSUE_CERTIFICATE: "礼品核销",
  MANAGE_ORDER: "管理订单",
  VIEW_LOGS: "查看日志",
  VIEW_ORG_CERTIFICATE_LOGS: "查询机构发券/兑换记录",
  MANAGE_SETTLEMENT: "结算管理",
  LIST_SETTLEMENT: "结算列表",
  CREATE_SETTLEMENT: "生成结算记录",
  VIEW_SETTLEMENT: "查看结算详情",
  SUBMIT_SETTLEMENT: "提交结算",
  APPROVE_SETTLEMENT: "审核结算",
  DELETE_SETTLEMENT: "删除结算",
  VIEW_REDEMPTION: "核销记录",
  VIEW_DISTRIBUTION: "发放记录",
  LIST_TAGS:"标签列表",
  CREATE_TAG:"新增标签",
  DELETE_TAG:"删除标签",
};
const tagStatuses = [
  {
    value: "CUSTOMER",
    name: "客户",
  },
  {
    value: "MERCHANT",
    name: "商户",
  },
  {
    value: "CAMPAIGN",
    name: "活动",
  },
];
export {
  user, //保存当前登录的user信息
  token, //保存当前登录的token信息
  campaignTypes,
  voucherTypes,
  campaignStatuses, //营销活动
  couponStatuses, //票券管理
  settlementStatuses, //结算中心
  settlementTypes, //结算添加类型
  Operations, //权限判断,
  distributionStatuses, //发放列表
  redemptionStatuses, //核销列表
  employeeStatuses, //员工状态
  roleTypes, //员工角色
  orgStatusesList, //机构状态列表
  tagStatuses, //公共标签
};
