import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";

import { privateRoutes } from "./routes";
import { FrameOut } from "./components";

class App extends Component {
  //返回路由组件
  getComponent(privateRoutes) {
    return privateRoutes.map((item) => {
      if (!item.children) {
        if (item.exact) {
          return (
            <Route
              exact={item.exact}
              key={item.pathname}
              path={item.pathname}
              component={item.component}
            />
          );
        } else {
          return (
            <Route
              key={item.pathname}
              path={item.pathname}
              component={item.component}
            />
          );
        }
      } else {
        return this.getComponent(item.children);
      }
    });
  }

  render() {
    return (
      <FrameOut>
        {/* 只匹配其中一个 */}
        <Switch>{this.getComponent(privateRoutes)}</Switch>
      </FrameOut>
    );
  }
}

export default App;
