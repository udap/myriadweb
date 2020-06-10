/*
定义接口请求
*/
import ajax from "./serverAjax";
import qs from "qs";
import { host } from "../utils/config";
import { notification } from "antd";

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

//LOGIN START
//获取验证码
export const reqVerify = (cellphone) =>
  ajax.get(BASE + "/public/login/phoneCode?cellphone=" + cellphone);
//登录
export const reqLogin = (values) =>
  ajax.get(BASE + "/public/login", { params: values });
//重新获取token
export const reqToken = (values) =>
  ajax.get(BASE + "/auth/refresh_token", { params: values });
//LOGIN END

//dashboard START
//登陆后获取个人信息 /accounts/em;
export const reqGetAccounts = () => ajax.get(BASE + "/accounts/me");
//dashboard END

//营销活动 START
//获取营销活动列表reqGetMarkets
export const reqGetCampaigns = (params) =>
  ajax.get(BASE + "/myriad/campaigns", { params: params });
//获取活动详情reqGetCampaigns
export const reqGetCampaignById = (id) =>
  ajax.get(BASE + "/myriad/campaigns/" + id);
//删除某个活动
export const reqDelCampaign = (id) =>
  ajax.delete(BASE + "/myriad/campaigns/" + id);
//发布某个活动
export const reqPublishCampaign = (id) =>
  ajax.put(BASE + "/myriad/campaigns/" + id + "/activate");
//获取分配数量'/myriad/vouchers/count?campaignId=' + couponuid + '&owner=' + wx.getStorageSync('userId')
export const reqGetNumber = (campaignId, owner, action) =>
  ajax.get(
    BASE +
      "/myriad/vouchers/count?campaignId=" +
      campaignId +
      "&owner=" +
      owner +
      "&action=" +
      action.toUpperCase()
  );

//批量分配reqTransfer
export const reqBatchTransfer = (params) =>
  ajax.post(BASE + "/myriad/vouchers/batchTransfer", params, {
    "Content-Type": "multipart/form-data",
  });

//批量发放reqDistributions
export const reqBatchDistribution = (params) =>
  ajax.post(BASE + "/myriad/distributions/batch", params, {
    "Content-Type": "multipart/form-data",
  });

//创建活动
export const reqAddCampaign = (params) =>
  ajax.post(BASE + "/myriad/campaigns", params);
//POST / myriad / campaigns / { id } / rules;
export const reqAddCampaignRule = (id, params) =>
  ajax.post(BASE + "/myriad/campaigns/" + id + "/rules", params);
export const reqPutCampaignRule = (id, params) =>
  ajax.put(BASE + "/myriad/campaigns/" + id + "/rules", params);
//提交活动配置 有图片
// export const reqPostConfigImg = (id, params) =>
//          ajax({
//            method: "post",
//            url: BASE + "/myriad/campaigns/" + id + "/voucherConfig",
//            data: params,
//            headers: {
//              "Content-Type": "multipart/form-data",
//            },
//          }
//更新活动基本信息
export const reqPutCampaign = (id, params) =>
  ajax.put(BASE + "/myriad/campaigns/" + id, params);
export const reqPostConfig = (id, params) =>
  ajax.post(BASE + "/myriad/campaigns/" + id + "/voucherConfig", params);
//更新活动配置
export const reqPutConfig = (id, params) =>
  ajax.put(BASE + "/myriad/campaigns/" + id + "/voucherConfig", params);
//展示参与商户列表
export const reqGetCampaignMerchants = (id) =>
  ajax.get(BASE + "/myriad/campaigns/" + id + "/parties?type=MERCHANT");
//新增参与商户
export const reqPostParties = (id, params) =>
  ajax.post(BASE + "/myriad/campaigns/" + id + "/parties", params);
//删除参与商户
export const reqDelMerchant = (uid) => ajax.delete(BASE + "/merchants/" + uid);
//删除参与机构
export const reqDelParty = (id, partyId) =>
  ajax.delete(BASE + "/myriad/campaigns/" + id + "/parties/" + partyId);
//营销活动 END

//TOPNAV START

//一.注册机构 START
//注册机构
export const reqAddOrg = (params) => ajax.post(BASE + "/organizations", params);
//查看当前机构
export const reqGetOrg = (uid) => ajax.get(BASE + "/organizations/" + uid);
//修改机构信息
export const reqPutOrg = (uid, params) =>
  ajax.put(BASE + "/organizations/" + uid, params);

export const reqDelOrg = (uid) => ajax.delete(BASE + "/organizations/" + uid);

//获取机构列表
export const reqGetOrgs = (params) => ajax(BASE + "/organizations");

//权限判断
export const reqPermit = (str) =>
  ajax
    .get(BASE + "/accounts/me/permissions/any?operations=" + str)
    .then(function (response) {
      if (response.data.retcode === 0 && !response.data.content) {
        notification.warn({
          message: "对不起，您没有权限！",
        });
      }
      return response.data.content;
    });
//获取所有权限
export const reqGetPermissions = () =>
  ajax.get(BASE + "/accounts/me/permissions");
//注册机构 END

//二.员工管理 START
//获取员工列表
export const reqGetEmployees = (params) =>
  ajax.get(BASE + "/employees", {
    params: params,
    paramsSerializer: (params) => {
      return qs.stringify(params, { indices: false });
    },
  });
//获取员工详情
export const reqGetEmployee = (uid) => ajax(BASE + "/employees/" + uid);

//获取员工所在组
export const reqGetGroupsByOrg = (params) =>
  ajax.get(BASE + "/groups", {
    params: params,
  });
//添加员工
export const reqAddEmployees = (params) =>
  ajax.post(BASE + "/employees", params);
//删除员工reqDelEmploy
export const reqDelEmployee = (uid) => ajax.delete(BASE + "/employees/" + uid);
//激活员工
export const reqActivateEmployee = (uid) =>
  ajax.put(BASE + "/employees/" + uid + "/activate");

//修改员工
export const reqPutEmployee = (uid, params) =>
  ajax.put(BASE + "/employees/" + uid, params);
//员工管理 END

//三.商户管理 START

//获取商户管理列表
export const reqGetMerchants = (params) =>
  ajax.get(BASE + "/merchants", { params: params });

//添加商户
export const reqAddMerchant = (params) =>
  ajax.post(BASE + "/merchants", params);

//添加商户标签
export const reqPutMerchantTags = (uid, params) =>
  ajax.put(BASE + "/merchants/" + uid + "/tags", params);

//商户管理 END

//四：授权码 START
//获取供应商的授权码
export const reqGetAuthCode = (params) =>
  ajax.get(BASE + "/organizations/" + params + "/merchantAuthCode");
//授权码

//TOPNAV END

//票券管理 START
//获取票券管理列表
export const reqGetCoupons = (params) =>
  ajax.get(BASE + "/myriad/vouchers", { params: params });

export const reqGetVoucherById = (id) =>
  ajax.get(BASE + "/myriad/vouchers/" + id);

export const reqGetClients = (params) =>
  ajax.get(BASE + "/customers", { params: params });
// 单个发券：
export const reqPublishDis = (params) =>
  ajax.post(BASE + "/myriad/distributions", params);

//票券管理 END

//结算管理 START
//  查询结算单reqGetList
export const reqGetSettlements = (params) =>
  ajax.get(BASE + "/myriad/settlements", { params: params });

// 查询商户参与的活动：reqGetCampaigns
// 查询商户加入的机构：
export const reqGetOrgLists = (uid, params) =>
  ajax.get(BASE + "/merchants/" + uid + "/orgs", { params: params });

// 创建结算单：
export const reqAddSettlement = (params) =>
  ajax.post(BASE + "/myriad/settlements", params);

// 删除结算单;
// DELETE / myriad / settlements / { id };
export const reqDelSettlement = (id) =>
  ajax.delete(BASE + "/myriad/settlements/" + id);
// 提交结算单
// PUT /myriad/settlements/{id}/submit
// json 参数：
// merchantId 当前机构id
export const reqPutSettlement = (id, params) =>
  ajax.put(BASE + "/myriad/settlements/" + id + "/submit", params);
//   审批结算单
// PUT /myriad/settlements/{id}/approve
// json 参数：
// marketerId 当前机构id
export const reqAgreeSettlement = (id, params) =>
  ajax.put(BASE + "/myriad/settlements/" + id + "/approve", params);
//结算详情;
//get / myriad / settlements / { id } / redemptions;
export const reqGetSettlementDetail = (id, params) =>
  ajax.get(BASE + "/myriad/settlements/" + id + "/redemptions", {
    params: params,
  });

//结算管理 END
//核销记录 reqGetExchangeLists;
export const reqGetRedemptions = (params) =>
  ajax.get(BASE + "/myriad/redemptions", {
    params: params,
  });
//核销记录

//发放记录reqDistributionsLists
export const reqGetDistributions = (params) =>
  ajax.get(BASE + "/myriad/distributions", {
    params: params,
  });
//发放记录

//分组管理 START
//分页查询机构的组列表
export const reqGetGroups = (params) =>
  ajax.get(BASE + "/groups", {
    params: params,
  });
//添加分组
export const reqPostGroup = (params) =>
  ajax.post(BASE + "/groups", params, {
    "Content-Type": "multipart/form-data",
  });
//修改分组
export const reqPutGroup = (id, params) =>
  ajax.put(BASE + "/groups/" + id, params);
//删除某个分组 后台没有
export const reqDelGroup = (id) => ajax.delete(BASE + "/groups/" + id);
//查询某个组的详情
export const reqGetGroupItem = (id) => ajax.get(BASE + "/groups/" + id);
//分组管理 END

//我的账户 START

//我的账户的详情
export const reqGetAccountProfile = () =>
  ajax.get(BASE + "/accounts/me/profile");
//微信状态
export const reqGetWeChatState = () =>
  ajax.get(BASE + "/accounts/me/bindWxCode");
//微信绑定
export const reqGetWeChatBind = (accountUid) => {
  ajax.get(
    BASE +
      "/public/wxAccounts/web/bind?&appid=wxe6f169c3efb14dce&accountUid=" +
      accountUid
  );
};
//修改我的账户
export const reqPutAccountProfile = (params) =>
  ajax.put(BASE + "/accounts/me", params);
//我的账户 END

export const reqGetStats = (keys, since) =>
  ajax.get(BASE + "/myriad/stats", {
    params: {
      key: keys,
      since: since,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { indices: false });
    },
  });

// export functions
export const reqDownloadSettlement = (id) =>
  ajax.get(BASE + "/myriad/settlements/" + id + "/export", {
    responseType: "blob",
  });

export const reqExportRedemption = (params) =>
  ajax.get(BASE + "/myriad/redemptions/export", {
    params: params,
    responseType: "blob",
  });

//公共标签
export const reqPostTags = (params) => ajax.post(BASE + "/tags", params);
export const reqDelTag = (id) => ajax.delete(BASE + "/tags/" + id);
export const reqGetTags = (params) =>
  ajax.get(BASE + "/tags", { params: params });

//下属机构管理
export const reqGetSubsidiaries = (uid, params) =>
  ajax.get(BASE + "/organizations/" + uid + "/subsidiaries", {
    params: params,
  });
