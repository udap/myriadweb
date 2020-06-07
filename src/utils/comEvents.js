import { privateRoutes } from "../routers";
import { ChinaRegions } from "./china-regions";
//获取当前页面的title
const getTitle = (pathname) => {
  let title;
  privateRoutes.forEach((item) => {
    if (item.pathname === pathname) {
      title = item.title;
    } else if (item.children) {
      const cItem = item.children.find((cItem) => cItem.pathname === pathname);
      if (cItem) {
        title = cItem.title;
      }
    }
  });
  return title;
};
const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : "0" + n;
};

const compareToday = (dateValue) => {
  return (
    new Date().getTime() >= new Date(dateValue).getTime() + 3600 * 1000 * 24
  );
};
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return [year, month, day].map(formatNumber).join("-");
};

const formatExpiry = (expiry) => {
  return expiry ? getDateStr(-1, expiry) : "";
};

const getDateStr = (AddDayCount, date) => {
  var dd = date ? date : new Date();
  if (date && typeof date === "string") dd = new Date(date);
  dd.setDate(dd.getDate() + AddDayCount);
  const year = dd.getFullYear();
  const month = dd.getMonth() + 1;
  const day = dd.getDate();

  return [year, month, day].map(formatNumber).join("-");
};

const firstDayOfMonth = () => {
  var dd = new Date();
  const year = dd.getFullYear();
  const month = dd.getMonth() + 1;
  const day = dd.getDate();

  return [year, month, 1].map(formatNumber).join("-");
};

const formatCurrency = (value) => {
  if (value && typeof value === "number") return (value / 100).toFixed(2);
  if (value && typeof value === "string")
    return (parseInt(value) / 100).toFixed(2);
  return "";
};

const hasPower = async (self, reqPermit, str, handleName, id, type) => {
  const result = await reqPermit(str);
  if (result) {
    if (handleName) {
      self[handleName](id, type);
    } else {
      return result;
    }
  }
};
const compareTwoArrayEqual = (arr1, arr2) => {
  let newArr = [];
  for (let j = 0; j < arr1.length; j++) {
    arr2.map((item) => {
      if (item.key === arr1[j]) newArr.push(item.title);
    });
  }
  return newArr;
};

const mergeArrays = (arr1, arr2) => {
  return arr1.concat(arr2.filter((item) => arr1.indexOf(item) < 0));
};

const siftRegion = (p, c) => {
  //province, city, district
  let newArr = [];
  if (p) {
    for (let i = 0; i < ChinaRegions.length; i++) {
      newArr.push({
        value: ChinaRegions[i].value,
        label: ChinaRegions[i].label,
      });
    }
  }
  if (p && c) {
    let data = JSON.parse(JSON.stringify(ChinaRegions));
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].children.length; j++) {
        data[i].children[j].children = [];
      }
    }
    newArr = data;
  }
  return newArr;
};
export default {
  getTitle,
  formatDate,
  formatExpiry,
  getDateStr,
  firstDayOfMonth,
  formatCurrency,
  hasPower,
  compareToday,
  compareTwoArrayEqual,
  mergeArrays,
  siftRegion,
};
