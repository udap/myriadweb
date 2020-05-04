/*
定义接口请求
*/
import ajax from "./serverAjax";
import {host} from "../utils/config";

let BASE = host;
// "proxy": "https://points.xinongtech.com/dev",
//"proxy": "https://myriad-test.xinongtech.com"
//https://gift-test.xinongtech.com
var env = process.env.NODE_ENV;


// if (env === "development") {
//   BASE = `https://gift-test.xinongtech.com`; // 开发环境
// } else if (
//   env === "production") {
//   BASE = `https://gift.xinongtech.com`; // 预发布环境
// } {
//   BASE = `https://gift-test.xinongtech.com`; // 生产环境
// }

/*
LOGIN START
 */
//获取验证码
export const reqVerify = (cellphone) =>
  ajax(BASE + "/public/login/phoneCode?cellphone=" + cellphone);
//登录
export const reqLogin = (values) =>
  ajax.get(BASE + "/public/login", { params: values });
//重新获取token
export const reqToken = (values) =>
         ajax.get(BASE + "/auth/refresh_token", { params: values });
/*
LOGIN END
 */

/*
dashboard START
 */
//登陆后获取个人信息 /accounts/em;
export const reqGetAccounts = () => ajax(BASE + "/accounts/me");
/*
dashboard END 
 */

/*
营销活动 START
 */
//获取营销活动列表
export const reqGetMarkets = (params) =>
  ajax.get(BASE + "/myriad/campaigns", { params: params });
//获取活动详情
export const reqGetCampaigns = (id) => ajax(BASE + "/myriad/campaigns/" + id);
//删除某个活动
export const reqDelCampaign = (id) =>
  ajax.delete(BASE + "/myriad/campaigns/" + id);
//发布某个活动
export const reqPublishCampaign = (id) =>
  ajax.put(BASE + "/myriad/campaigns/" + id + "/activate");
//批量分配
export const reqTransfer = (params) =>
  ajax.post(BASE + " /myriad/vouchers/batchTransfer", params, {
    "Content-Type": "multipart/form-data",
  });
//批量发放
export const reqDistributions = (params) =>
  ajax.post(BASE + " /myriad/distributions/batch", params, {
    "Content-Type": "multipart/form-data",
  });

//创建活动
export const reqAddCampaign = (params) =>
  ajax.post(BASE + "/myriad/campaigns", params);
//提交活动配置 有图片
// export const reqPostConfigImg = (id, params) =>
//          ajax({
//            method: "post",
//            url: BASE + "/myriad/campaigns/" + id + "/voucherConfig",
//            data: params,
//            headers: {
//              "Content-Type": "multipart/form-data",
//            },
//          });
export const reqPostConfig = (id, params) =>
  ajax.post(BASE + "/myriad/campaigns/" + id + "/voucherConfig", params);
//更新活动配置
export const reqPutConfig = (id, params) =>
  ajax.put(BASE + "/myriad/campaigns/" + id + "/voucherConfig", params);
//展示参与商户列表
export const reqShowParties = (id) =>
  ajax.get(BASE + "/myriad/campaigns/" + id + "/parties?type=MERCHANT");
//新增参与商户
export const reqPostParties = (id, params) =>
  ajax.post(BASE + "/myriad/campaigns/" + id + "/parties", params);
//删除参与机构
export const reqDelParty = (id, partyId) =>
  ajax.delete(BASE + "/myriad/campaigns/" + id + "/parties/" + partyId);
/*
营销活动 END
 */

/*
TOPNAV START
 */
/*

 /*
一.注册机构 START
 */
//注册机构
export const regAddOrg = (params) => ajax.post(BASE + "/organizations", params);
//查看当前机构
export const regGetCurOrg = (params) =>
  ajax.get(BASE + "/organizations/" + params);

//获取机构列表
export const regGetOrgs = (params) => ajax(BASE + "/organizations");
/*
注册机构 END
 */

/*
二.员工管理 START
 */

//获取员工列表
export const reqGetEmployees = (params) =>
  ajax.get(BASE + "/employees", { params: params });
//获取员工详情
export const reqGetEmployee = (id) => ajax(BASE + "/employee/" + id);

//获取员工所在组 getGroup
export const reqGetGroup = (orgid) =>
  ajax.get(BASE + "/groups", {
    params: { size: 200, orgUid: orgid },
  });
//添加员工
export const reqAddEmployees = (orgUid, params) =>
  ajax.post(BASE + "/employees?orgUid=" + orgUid, params);
/*
员工管理 END
 */

/*
三.商户管理 START
 */
//获取商户管理列表
export const reqGetMerchants = (params) =>
  ajax.get(BASE + "/merchants", { params: params });

//添加商户
export const reqAddMerchant = (params) =>
  ajax.post(BASE + "/merchants", params);
/*
商户管理 END
 */

/*
四：授权码 START
 */
//获取供应商的授权码
export const reqGetAuthCode = (params) =>
  ajax.get(BASE + "/organizations/" + params + "/merchantAuthCode");

/*
授权码 END
 */

/*
TOPNAV END
 */

/*
票券管理 START
 */

//获取票券管理列表
export const reqGetCoupons = (params) =>
  ajax.get(BASE + "/myriad/vouchers", { params: params });
export const reqGetClients = (params) =>
         ajax.get(BASE + "/customers", { params: params });
;
// 单个发券：
// post /distributions
// 参数：json格式
// voucherId
// customerId
export const reqPublishDis = (params) =>
  ajax.post(BASE + "/myriad/distributions", params);

/*
票券管理 END
 */



/*
结算管理 START
 */
//  查询结算单 
// get /myriad/settlements
// 参数：
// merchantId 商户id
// marketerId 机构id
// status 结算状态
// searchTxt 搜索框

export const reqGetList = (params) =>
         ajax.get(BASE + "/myriad/settlements", { params: params });

// 查询商户参与的活动：
// GET /myriad/campaigns
// partyId 商户id
// partyType = MERCHANT
export const reqGetMerchant = (params) =>
         ajax.get(BASE + "/myriad/campaigns", { params: params });


/*
结算管理 END
 */