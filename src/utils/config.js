function versionLX() {
  let version = process.env.NODE_ENV;
  switch (version) {
    case "development":
      return ""; //开发版
      break;
    case "production":
      return "https://gift-support.xinongtech.com"; //体验版
      break;
    default:
      return "";
  }
}


//调用
const host = versionLX();


module.exports = {
  host: host
}