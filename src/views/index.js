//index导出全部页面 其它时候按需导出
//懒加载
import Loadable from "react-loadable";
import Loading from "../components/Loading";

const MyOrgs = Loadable({
  loader: () => import("./myOrgs"),
  loading: Loading,
});

const NotFound = Loadable({
  loader: () => import("./notFound"),
  loading: Loading,
});
const Empty = Loadable({
  loader: () => import("./empty"),
  loading: Loading,
});
const Dashboard = Loadable({
  loader: () => import("./dashboard"),
  loading: Loading,
});

const Employee = Loadable({
  loader: () => import("./employee"),
  loading: Loading,
});

const Campaign = Loadable({
  loader: () => import("./campaign"),
  loading: Loading,
});
const CampaignEdit = Loadable({
  loader: () => import("./CampaignEdit"),
  loading: Loading,
});
const Coupon = Loadable({
  loader: () => import("./coupon"),
  loading: Loading,
});
const CouponHome = Loadable({
  loader: () => import("./coupon/couponHome"),
  loading: Loading,
});

const Distribution = Loadable({
  loader: () => import("./distribution"),
  loading: Loading,
});

const Redemption = Loadable({
  loader: () => import("./redemption"),
  loading: Loading,
});

const Login = Loadable({
  loader: () => import("./login"),
  loading: Loading,
});

const SettlementHome = Loadable({
  loader: () => import("./settlement"),
  loading: Loading,
});
const SettlementNew = Loadable({
  loader: () => import("./settlement/settlementNew"),
  loading: Loading,
});
const SettlementDetail = Loadable({
  loader: () => import("./settlement/settlementDetail"),
  loading: Loading,
});
const Merchant = Loadable({
  loader: () => import("./merchant"),
  loading: Loading,
});

const Groups = Loadable({
  loader: () => import("./group"),
  loading: Loading,
});
const Profile = Loadable({
  loader: () => import("./profile"),
  loading: Loading,
});
const TagManager = Loadable({
  loader: () => import("./tag"),
  loading: Loading,
});

const Subsidiaries = Loadable({
  loader: () => import("./Subsidiaries"),
  loading: Loading,
});
const Customer = Loadable({
  loader: () => import("./customer"),
  loading: Loading,
});

const TransferStats = Loadable({
  loader: () => import("./transferLog"),
  loading: Loading,
});

const SummaryReport = Loadable({
  loader: () => import("./analytics"),
  loading: Loading,
});

//同时更新routers路由
export {
  MyOrgs,
  Dashboard,
  Employee,
  Login,
  NotFound,
  Empty,
  Campaign,
  CampaignEdit,
  Coupon,
  CouponHome,
  Distribution,
  Redemption,
  SettlementHome,
  SettlementNew,
  SettlementDetail,
  Merchant,
  Groups,
  Profile,
  TagManager,
  Subsidiaries,
  Customer,
  TransferStats,
  SummaryReport,
};
