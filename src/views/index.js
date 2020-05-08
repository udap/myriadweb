//inedx导出全部页面 其它时候按需导出
//懒加载
import Loadable from 'react-loadable';
import Loading  from '../components/Loading';
 
const MyOrgs = Loadable({
  loader: () => import('./myOrgs'),
  loading: Loading
});

const NotFound = Loadable({
  loader: () => import('./notFound'),
  loading: Loading
});

const Dashboard = Loadable({
  loader: () => import('./dashboard'),
  loading: Loading
});

const Employees = Loadable({
  loader: () => import("./employees"),
  loading: Loading,
});

const FormDialog = Loadable({
  loader: () => import("./employees/FormDialog"),
  loading: Loading,
});
const Market = Loadable({
  loader: () => import("./market"),
  loading: Loading,
});
const MarketHome = Loadable({
  loader: () => import("./market/marketHome"),
  loading: Loading,
});
const MarketEdit= Loadable({
  loader: () => import("./market/marketEdit"),
  loading: Loading,
});
const MarketDetail = Loadable({
  loader: () => import("./market/marketDetail"),
  loading: Loading,
});
const Coupon = Loadable({
  loader: () => import('./coupon'),
  loading: Loading
});
const CouponHome = Loadable({
  loader: () => import("./coupon/couponHome"),
  loading: Loading,
});


const Provide = Loadable({
  loader: () => import('./provide'),
  loading: Loading
});

const Exchange = Loadable({
  loader: () => import('./exchange'),
  loading: Loading
});

const Login = Loadable({
  loader: () => import('./Login'),
  loading: Loading
});

const Setting = Loadable({
  loader: () => import("./setting/setHome"),
  loading: Loading,
});
const SetDetail = Loadable({
  loader: () => import("./setting/setForm"),
  loading: Loading,
});
;
const Merchant = Loadable({
  loader: () => import("./merchant"),
  loading: Loading,
});
//同时更新routers路由
export {
  MyOrgs,
  Dashboard,
  Employees,
  Login,
  NotFound,
  Market,
  MarketHome,
  MarketEdit,
  MarketDetail,
  Coupon,
  CouponHome,
  Provide,
  Exchange,
  Setting,
  SetDetail,
  FormDialog,
  Merchant,
};