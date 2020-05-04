//引入文件
import {
  Dashboard,
  Employees,
  Login,
  NotFound,
  Market,
  MarketHome,
  Coupon,
  CouponHome,
  CouponDetail,
  Provide,
  Exchange,
  Setting,
  MyOrgs,
  FormDialog,
  MarketEdit,
  MarketDetail,
  Merchant,
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
    pathname: "/admin/market",
    component: Market,
    title: "营销活动",
    icon: "GiftOutlined",
    isTop: true, //顶级菜单
    exact: true,
  },
  //动态路由

  {
    pathname: "/admin/market/detail/:id",
    component: MarketDetail,
    title: "活动详情",
    icon: "",
    isTop: false, //顶级菜单
  },
  {
    pathname: "/admin/market/edit/:id",
    component: MarketEdit,
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
    pathname: "/admin/coupon/detail/:id",
    component: CouponDetail,
    title: "凭证详情",
    icon: "",
    isTop: false, //顶级菜单
  },
  {
    pathname: "/admin/provide",
    component: Provide,
    title: "发放记录",
    icon: "BarChartOutlined",
    isTop: true, //顶级菜单
  },
  {
    pathname: "/admin/exchange",
    component: Exchange,
    title: "兑换记录",
    icon: "CheckCircleOutlined",
    isTop: true, //顶级菜单
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
    pathname: "/admin/settings",
    component: Setting,
    title: "设置",
    icon: "SettingOutlined",
    isTop: true, //顶级菜单
    children: [
      {
        pathname: "/admin/myOrgs",
        component: MyOrgs,
        title: "我的机构",
        icon: "BankOutlined",
        isTop: false, //顶级菜单
      },
      {
        pathname: "/admin/merchant",
        component: Merchant,
        title: "入驻商户",
        icon: "ApartmentOutlined",
        isTop: false, //顶级菜单
      },
      {
        pathname: "/admin/setting",
        component: Setting,
        title: "结算中心",
        icon: "MoneyCollectOutlined",
        isTop: false, //顶级菜单
      },
      // {
      //   pathname: "/admin/setting/add",
      //   component: SettingAdd,
      //   title: "新增结算",
      //   icon: "MoneyCollectOutlined",
      //   isTop: false, //顶级菜单
      // },
    ],
  },
];

export { commonRoutes, privateRoutes };
