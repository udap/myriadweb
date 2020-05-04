const {override, addDecoratorsLegacy, fixBabelImports, addLessLoader} = require("customize-cra");

//包含所有less变量的信息 修改以后需要重启
const modifyVars = require("./theme/yc.js")
module.exports = override(
    addDecoratorsLegacy(),
	//针对antd 按需打包
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
	//重新指定antd less文件
    addLessLoader({
        javascriptEnabled: true,
        modifyVars
    }),
);