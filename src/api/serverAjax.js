import axios from "axios";
//import qs from "qs";
import { message,notification } from "antd";
import storageUtils from "../utils/storageUtils";

// 添加请求拦截器:让post请求的请求格式为urlencode格式 a=1&b=2
// 在发送请求之前做些什么

//axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

axios.interceptors.request.use(function (config, headers) {
  //得到请求方式和请求体数据
  const { method, data } = config;
  //处理post请求 将data对象转换成query参数格式字符串
  if (method.toLocaleLowerCase() === "post" && typeof data === "object") {
    //config.data = qs.stringify(data);
  }
  const token = storageUtils.getToken();
  const user = storageUtils.getUser();
  if (token) {
    config.headers["X-ACCESS-TOKEN"] = token;
  }
  if (user.orgUid) {
    config.headers["X-TENANT-ID"] = user.orgUid;
  }
  return config;
});

// 添加响应拦截器
//请求返回之后，且在我们指定的请求函数之前
axios.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    if (response.status === 200 || response.success) {
      if (response.data.retcode !== 0) {
        //message.error(response.data.msg);
        notification.error({
          message: response.data.msg,
        });
        return response;
        //return response.data;
      } else {
        return response;
      }
    }
  },
  function (error) {
    if (error.response.status === 504 || error.response.status === 404) {
      //message.error("服务器被吃了⊙﹏⊙∥");
       notification.warning({
         message: "服务器被吃了⊙﹏⊙∥",
       });
    } else if (error.response.status === 401) {
      //message.error("登录信息失效⊙﹏⊙∥");
       notification.warning({
         message: "登录信息失效⊙﹏⊙∥",
       });
      //清空缓存localStorage
      storageUtils.removeUser();
      storageUtils.removeToken();
      //返回登陆页
      window.location.href = "/login#/login";
    } else if (error.response.status === 500) {
     // message.error("服务器开小差了⊙﹏⊙∥");
      notification.warning({
        message: "服务器开小差了⊙﹏⊙∥",
      });
    }
    return Promise.reject(error);
    // 中断promise返回一个pending的promise
    //return new Promise.reject(() => {});
  }
);

export default axios;
