import { privateRoutes } from "../routes";
import { ChinaRegions } from "./china-regions";
// import { traverse } from "@babel/types";
// import { rootCertificates } from "tls";

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
  return arr1.concat(
    arr2.filter((item) => item !== undefined && arr1.indexOf(item) < 0)
  );
};

// const formatExpression = (ruleExpressions) => {
//   let expr = ruleExpressions.toString();
//   return expr.replace(/,/, " and ");
// };

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

// const distinct = (arr) => {
//   let map = new Map();
//   let newArr = [];
//   for (let i = 0; i < arr.length; i++) {
//     if (!map.has(arr[i])) {
//       map.set(arr[i]);
//       newArr.push(arr[i]);
//     }
//   }
//   return newArr;
// };

// const trans = (arr, keys) => {
//   let result = [];
//   let keyToRef = {};
//   let len = keys.length;
//   arr.forEach((cur) => {
//     let obj;
//     let cacheKey = "";
//     for (let i = 0; i < len; i++) {
//       let key = keys[i];
//       cacheKey += key + cur[key];
//       let ref = keyToRef[cacheKey];
//       if (ref) {
//         obj = ref;
//       } else {
//         ref =
//           i === 0 ? result : obj.children ? obj.children : (obj.children = []);
//         obj = {
//           [key]: cur[key],
//         };
//         keyToRef[cacheKey] = obj;
//         ref.push(obj);
//       }
//     }
//   });
//   return result;
// };

const formatDistrict = (data, type) => {
  let obj = {};
  let result = [];
  data.forEach((element, index) => {
    if (!obj[element]) {
      obj[element] = [];
    }
    obj[element].push(element);
  });
  for (let key in obj) {
    result.push({
      type: type,
      name: key,
    });
  }
  return result;
};

const formatCity = (data, type) => {
  let obj = {};
  let result = [];
  data.forEach((element, index) => {
    let elem = element.split(",")[0];
    let elemValue =
      element.indexOf(",") !== -1
        ? element.substring(element.indexOf(",") + 1)
        : null;
    if (!obj[elem]) {
      obj[elem] = [];
    }
    if (elemValue) obj[elem].push(elemValue);
    else obj[elem] = [];
  });
  for (let key in obj) {
    if (obj[key].length > 0) {
      result.push({
        type: type,
        name: key,
        children: formatDistrict(obj[key], "D"),
      });
    } else {
      result.push({
        type: type,
        name: key,
      });
    }
  }
  return result;
};

const formatProvince = (data, type) => {
  let provs = {};
  let result = [];
  data.forEach((element, index) => {
    let elem = element.split(",")[0];
    let elemValue =
      element.indexOf(",") !== -1
        ? element.substring(element.indexOf(",") + 1)
        : null;
    if (!provs[elem]) {
      provs[elem] = [];
    }
    if (elemValue) provs[elem].push(elemValue);
    else provs[elem] = [];
  });
  for (let key in provs) {
    if (provs[key].length > 0) {
      result.push({
        type: type,
        name: key,
        children: formatCity(provs[key], "C"),
      });
    } else {
      result.push({
        type: type,
        name: key,
      });
    }
  }
  return result;
};

const formatRegions = (selectedRegion) => {
  let resultArr = selectedRegion ? formatProvince(selectedRegion, "P") : [];
  let strifyArr = JSON.stringify(resultArr);
  return strifyArr;
};

const flatRegions = (regions) => {
  let out = [];
  for (let i = 0; i < regions.length; i++) {
    let regionPath = [];
    traverseTree(regions[i], [], regionPath);
    out = out.concat(regionPath);
  }
  return out;
};

const traverseTree = (root, path, result) => {
  path.push(root.name);
  if (!root.children || root.children.length === 0) {
    let leaf = path.toString();
    result.push(leaf);
  } else {
    for (let i = 0; i < root.children.length; i++) {
      traverseTree(root.children[i], path.concat(), result);
    }
  }
};

function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
}

const floatMul = (arg1, arg2) => {
  let m = 0,
    s1 = arg1.toString(),
    s2 = arg2.toString();
  try {
    m += s1.split(".")[1].length;
  } catch (e) {}
  try {
    m += s2.split(".")[1].length;
  } catch (e) {}
  return (
    (Number(s1.replace(".", "")) * Number(s2.replace(".", ""))) /
    Math.pow(10, m)
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
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
  formatRegions,
  flatRegions,
  guid,
  floatMul,
};
