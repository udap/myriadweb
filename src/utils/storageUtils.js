//storageUtils
/*
存储本地数据
*/
import store from "store";
let localStore = window.sessionStorage || sessionStorage;
console.log("store,sessionStorage", localStore);
const USER_KEY = "user";
//window.sessionStorage.setItem;
/*保存user*/
const saveUser = (user) => {
  localStore.setItem(USER_KEY, JSON.stringify(user));
  //store.setItem(USER_KEY, user);
};
/*读取user*/
const getUser = () => {
  return JSON.parse(localStore.getItem(USER_KEY)) || {};
  //return JSON.parse(USER_KEY) || {};
};

/*移除user*/
const removeUser = () => {
  localStore.removeItem(USER_KEY);
};

const TOKEN = "token";

/*保存Token*/
const saveToken = (token) => {
  localStore.setItem(TOKEN, token);
  //store.setItem(TOKEN, token);
};
/*读取Token*/
const getToken = () => {
  return localStore.getItem(TOKEN) || "";
  //return store.getItem(TOKEN) || "";
};

/*移除Token*/
const removeToken = () => {
  localStore.removeItem(TOKEN);
  //store.removeItem(TOKEN);
};

export default {
  saveUser,
  getUser,
  removeUser,
  saveToken,
  getToken,
  removeToken,
};
