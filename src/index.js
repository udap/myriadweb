import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { ConfigProvider } from 'antd'
// 配置中文
import zhCN from 'antd/es/locale/zh_CN'
// 开启路由操作
//HashRouter的原因, 如果是BrowserRouter
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { commonRoutes } from './routers'
import './css/index.less'

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <Router>
      <Switch>
        {/*2.公共可以访问*/}

        {commonRoutes.map((item, index) => {
          return (
            <Route
              key={item.pathname}
              path={item.pathname}
              component={item.component}
            />
          );
        })}
        {/* 1.私有操作，登陆后访问 //rootProps授权检测 */}
        <Route
          path="/admin"
          render={(rootProps) => {
            return <App {...rootProps} />;
          }}
        />

        {/* 3.默认操作和404 */}
        <Redirect from="/" to="/login" exact />
        <Redirect to="/404" />
      </Switch>
    </Router>
  </ConfigProvider>,
  document.getElementById("root")
);
