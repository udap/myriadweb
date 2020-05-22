//引入文件
import {
  Dashboard,
  Employee,
  Login,
  NotFound,
  Empty,
  Campaign,
  CampaignEdit,
  CampaignDetail,
  Coupon,
  Distribution,
  Redemption,
  SettlementHome,
  SettlementNew,
  SettlementDetail,
  MyOrgs,
  Merchant,
  Groups,
  Profile,
} from "../views";

//公共路由
const commonRoutes = [
  {
    pathname: "/login",
    component: Login,
  },
  {
    pathname: "/404",
    component: NotFound,
  },
];

//私有路由
const privateRoutes = [
  {
    pathname: "/admin/dashboard",
    component: Dashboard,
    title: "仪表盘",
    icon: "DashboardOutlined",
    isTop: true, //顶级菜单
  },

  {
    pathname: "/admin/campaign",
    component: Campaign,
    title: "营销活动",
    icon: "GiftOutlined",
    isTop: true, //顶级菜单
    exact: true,
  },
  //动态路由
  {
    pathname: "/admin/campaign/detail/:id",
    component: CampaignDetail,
    title: "活动详情",
    icon: "",
    isTop: false, //顶级菜单
  },
  {
    pathname: "/admin/campaign/edit/:id",
    component: CampaignEdit,
    title: "新增活动",
    icon: "",
    isTop: false, //顶级菜单
  },
  {
    pathname: "/admin/coupon",
    component: Coupon,
    title: "票券管理",
    icon: "MoneyCollectOutlined",
    isTop: true, //顶级菜单
  },
  {
    pathname: "/admin/distribution",
    component: Distribution,
    title: "发放记录",
    icon: "BarChartOutlined",
    isTop: true, //顶级菜单
  },
  {
    pathname: "/admin/redemption",
    component: Redemption,
    title: "核销记录",
    icon: "InteractionOutlined",
    isTop: true, //顶级菜单
  },
  {
    pathname: "/admin/employee",
    component: Employee,
    title: "员工管理",
    icon: "UsergroupAddOutlined",
    isTop: false, //顶级菜单
  },
  {
    pathname: "/admin/group",
    component: Groups,
    title: "分组管理",
    isTop: false, //顶级菜单
  },
  {
    pathname: "/admin/merchant",
    component: Merchant,
    title: "入驻商户",
    icon: "ApartmentOutlined",
    isTop: false, //顶级菜单
    exact: true,
  },
  {
    pathname: "",
    component: Empty,
    title: "设置",
    icon: "SettingOutlined",
    isTop: true, //顶级菜单
    children: [
      {
        pathname: "/admin/profile",
        component: Profile,
        title: "我的账户",
        icon: "UserOutlined",
        isTop: false, //顶级菜单
        //exact: true,
        isNav: true,
      },
      {
        pathname: "/admin/myOrgs",
        component: MyOrgs,
        title: "我的机构",
        icon: "BankOutlined",
        isTop: false, //顶级菜单
        isNav: true,
      },
      {
        pathname: "/admin/merchant",
        component: Merchant,
        title: "入驻商户",
        icon: "ApartmentOutlined",
        isTop: false, //顶级菜单
        isNav: true,
      },
      {
        pathname: "/admin/settlement",
        component: SettlementHome,
        title: "结算中心",
        icon: "TransactionOutlined",
        isTop: false, //顶级菜单
        exact: true,
        isNav: true,
      },
      {
        pathname: "/admin/settlement/new",
        component: SettlementNew,
        title: "新增结算",
        icon: "MoneyCollectOutlined",
        isTop: false, //顶级菜单
        isNav: false,
      },
      {
        pathname: "/admin/settlement/:id",
        component: SettlementDetail,
        title: "结算详情",
        icon: "",
        isTop: false,
        isNav: false,
      },
    ],
  },
  {
    pathname: "/admin/empty",
    component: Empty,
    title: "空页面",
    icon: "",
    isTop: false, //顶级菜单
  },
];

export { commonRoutes, privateRoutes };
