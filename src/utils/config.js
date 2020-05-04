function versionLX() {
  console.log("envVersion", process.env.NODE_ENV);
  let version = process.env.NODE_ENV;
  console.log("versionLX -> version", version)
  switch (version) {
    case "development":
      return ""; //开发版
      break;
    case "production":
      return "https://gift-test.xinongtech.com"; //体验版
      break;
    default:
      return "";
  }
}


//调用
const host = versionLX();
console.log("host","versionLX",host)


module.exports = {
  host: host
}