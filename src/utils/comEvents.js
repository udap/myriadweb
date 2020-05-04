import {privateRoutes} from '../routers'
//获取当前页面的title
const getTitle = (pathname)=>{
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
}
const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : "0" + n;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return [year, month, day].map(formatNumber).join("-");
};
const getDateStr = (AddDayCount, date) => {
  var dd = date ? date : new Date();
  dd.setDate(dd.getDate() + AddDayCount);
  const year = dd.getFullYear();
  const month = dd.getMonth() + 1;
  const day = dd.getDate();

  return [year, month, day].map(formatNumber).join("-");
};
/*console.log("前天：" + GetDateStr(-2));
console.log("昨天：" + GetDateStr(-1));
console.log("今天：" + GetDateStr(0));
console.log("明天：" + GetDateStr(1));
console.log("后天：" + GetDateStr(2));
console.log("大后天：" + GetDateStr(3));*/

export default {
  getTitle,
  formatDate,
  getDateStr,
};
