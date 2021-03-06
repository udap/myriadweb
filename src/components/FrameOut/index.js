import React, { Component } from "react";
import { Layout, Menu, notification } from "antd";
import { withRouter, Link } from "react-router-dom";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

import "./index.less";
//动态渲染导航栏
import { privateRoutes } from "@routes";
//引入图标
import { AntdIcon, ReactDocumentTitle } from "@components";
// import comEvents from "@utils/comEvents";
import storageUtils from "@utils/storageUtils";
import { logo } from "@assets/images";
import TopNav from "./topNav";

//过滤filter导航栏  左侧导航栏
const navLeft = privateRoutes.filter((item) => {
  return item.isTop === true;
});

//过滤filter导航栏 右上角设置菜单栏
// const navsRight = privateRoutes[1].children.filter((item) => {
//   let select = item.isNav === true;
//   return select;
// });

//布局框架组件
/*
withRouter 是一个高阶组件 用来包装非路由组件，返回一个新的组件
新的组件向非路由组件传递3个属性 history\location\match
*/

class FrameOut extends Component {
  rootSubmenuKeys = ["/admin/settlement"];
  rootSubmenuChildKeys = [
    "/admin/profile",
    "/admin/myOrgs",
    "/admin/merchant",
    "/admin/settlement",
    "/admin/tag",
    "/admin/customer",
    "/admin/reports/individual",
    "/admin/reports/organization",
  ];

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      current: "mail",
      selectedKeys: "/admin/dashboard",
      openKey: [],
    };
    this.updateSelected = this.updateSelected.bind(this);
  }

  componentDidMount() {
    //渲染前调用一次 为render数据做准备
    this.getNavMap(navLeft);
  }

  toggle = () => {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
      openKey: [],
    });
  };

  menusHandler = ({ item, key, keyPath, domEvent }) => {
    if (key === "username") {
      return false;
    }
    /*点击其他 关闭当前 */
    if (
      this.rootSubmenuKeys.indexOf(key) === -1 &&
      this.rootSubmenuChildKeys.indexOf(key) === -1
    ) {
      this.setState({ openKey: [] });
    }

    if (storageUtils.getUser().orgUid) {
      this.props.history.push(key);
      this.setState({
        selectedKeys: key,
      });
    } else {
      notification.warning({
        message: "您尚未加入任何机构！请注册新机构或者退出",
      });
      this.props.history.push("/admin/dashboard");
    }
  };

  onOpenChange = (openKeys) => {
    const { openKey } = this.state;
    const latestOpenKey = openKeys.find((key) => openKey.indexOf(key) === -1);
    if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      this.setState({ openKey: openKeys });
    } else {
      this.setState({
        openKey: latestOpenKey ? [latestOpenKey] : [],
      });
    }
  };

  updateSelected(key) {
    this.setState({ selectedKeys: key });
  }

  // 利用map遍历左侧导航
  getNavMap = (routes) => {
    // const path = this.props.location.pathname; //获取当前页面的路径名
    return routes.map((item) => {
      if (!item.children) {
        //没下级菜单
        return (
          <Menu.Item key={item.pathname} icon={<AntdIcon name={item.icon} />}>
            {item.title}
          </Menu.Item>
        );
      } else {
        //有下级菜单
        //默认打开当前子列表
        //找到当前路径的菜单
        const cItem = item.children.filter((cItem) => cItem.isNav === true);
        return (
          <Menu.SubMenu
            key={item.pathname}
            icon={<AntdIcon name={item.icon} />}
            title={item.title}
          >
            {this.getNavMap(cItem)}
          </Menu.SubMenu>
        );
      }
    });
  };

  getTitle = () => {
    // 得到当前请求路径
    const path = this.props.location.pathname;
    let title;

    privateRoutes.forEach((item) => {
      if (item.pathname === path) {
        // 如果当前item对象的key与path一样,item的title就是需要显示的title
        title = item.title;
      } else if (item.children) {
        // 在所有子item中查找匹配的
        const cItem = item.children.find(
          (cItem) => path.indexOf(cItem.pathname) === 0
        );
        // 如果有值才说明有匹配的
        if (cItem) {
          // 取出它的title
          title = cItem.title;
        }
      }
    });
    return title;
  };

  render() {
    const { openKey, collapsed } = this.state;
    const { location } = this.props;
    // //获取当前页面的路径地址
    const path = location.pathname;
    // //获取当前页面需要默认打开子列表的key值
    const selectedOpenKeys = this.selectedOpenKeys;
    // //更新title
    // let curTitle = comEvents.getTitle(location.pathname);
    // window.document.title = curTitle;
    let curTitle = this.getTitle() || "美意智慧营销平台";
    const user = storageUtils.getUser();

    return (
      <ReactDocumentTitle title={curTitle}>
        <Layout style={{ minHeight: "100%" }}>
          <Layout.Sider
            breakpoint="lg"
            collapsedWidth="0"
            collapsible
            collapsed={collapsed}
            trigger={null}
          >
            <Link
              to="/admin/dashboard"
              className="logo"
              onClick={() => this.updateSelected("/admin/dashboard")}
            >
              <img alt="江渝礼享" src={user.logo || logo} />
            </Link>
            <Menu
              onClick={this.menusHandler}
              mode="inline"
              theme="dark"
              selectedKeys={[path]}
              openKeys={openKey || selectedOpenKeys}
              onOpenChange={this.onOpenChange}
              defaultOpenKeys={[openKey]}
            >
              {this.getNavMap(navLeft)}
            </Menu>
          </Layout.Sider>
          <Layout className="site-layout">
            <Layout.Header
              className="site-layout-background"
              style={{ padding: 0 }}
            >
              {React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: "trigger",
                  onClick: this.toggle,
                }
              )}
              <span>{user.orgName || ""}</span>
              <TopNav />
            </Layout.Header>
            <Layout.Content
              className="site-layout-background"
              style={{
                margin: "24px 16px",
                padding: "0 24px 24px",
                minHeight: 280,
              }}
            >
              {this.props.children}
            </Layout.Content>
          </Layout>
        </Layout>
      </ReactDocumentTitle>
    );
  }
}

export default withRouter(FrameOut);
