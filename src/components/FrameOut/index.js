import React, { Component } from "react";
import { Layout, Menu, Row, Col, Modal, notification } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import "./index.less";
//动态渲染导航栏
import { privateRoutes } from "../../routers";
//引入装饰器 因为FrameOut没有Route
import { withRouter, Link } from "react-router-dom";
//引入图标
import { AntdIcon, ReactDocumentTitle } from "../../components";
import comEvents from "../../utils/comEvents";
import storageUtils from "../../utils/storageUtils";
import logo from "../../assets/images/logo.jpg";
import TopNav from "./topNav";

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
//过滤filter导航栏  左侧导航栏
const navsLeft = privateRoutes.filter((item) => {
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

@withRouter
class FrameOut extends Component {
  rootSubmenuKeys = ["/admin/settings"];
  rootSubmenuChildKeys = ["/admin/myOrgs", "/admin/merchant", "/admin/setting"];
  state = {
    collapsed: false,
    current: "mail",
    selectedKeys: "/admin/dashboard",
    openKey: [],
  };
  componentDidMount() {
    //渲染前调用一次 为render数据做准备
    this.getNavMap(navsLeft);
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
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
        message: "您尚未加入任何结构！请注册新机构或者退出",
      });
      this.props.history.push("/admin/dashboard");
    }
  };

  onOpenChange = (openKey) => {
    const latestOpenKey = openKey.find(
      (key) => this.state.openKey.indexOf(key) === -1
    );
    if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      this.setState({ openKey });
    } else {
      this.setState({
        openKey: latestOpenKey ? [latestOpenKey] : [],
      });
    }
  };

  updateSelected(key) {
    this.setState({
      selectedKeys: key,
    });
  }

  //getNavMap 利用map遍历左侧导航
  getNavMap = (routes) => {
    const path = this.props.location.pathname; //获取当前页面的路径名
    return routes.map((item) => {
      if (!item.children) {
        //没下级菜单
        return (
          <Menu.Item key={item.pathname}>
            <AntdIcon name={item.icon} />
            <span className="title">{item.title}</span>
          </Menu.Item>
        );
      } else {
        //有下级菜单
        //默认打开当前子列表
        //找到当前路径的菜单
        // const cItem = item.children.find((cItem) => cItem.pathname === path);
        const cItem = item.children.filter((cItem) => cItem.isNav === true);
        return (
          <SubMenu
            key={item.pathname}
            title={
              <span className="submenu-title-wrapper">
                <AntdIcon name={item.icon} />
                <span className="title">{item.title}</span>
              </span>
            }
          >
            {this.getNavMap(cItem)}
          </SubMenu>
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
    const { openKey } = this.state;
    const { location } = this.props;
    // //获取当前页面的路径地址
    const path = location.pathname;
    // //获取当前页面需要默认打开子列表的key值
    const selectedOpenKeys = this.selectedOpenKeys;
    // //更新title
    // let curTtile = comEvents.getTitle(location.pathname);
    // window.document.title = curTtile;
    let curTtile = this.getTitle() || "江渝礼享";

    return (
      <ReactDocumentTitle title={curTtile}>
        <Layout
          style={{
            minHeight: "100%",
          }}
        >
          <Layout>
            <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
              <Link
                to="/admin/dashboard"
                className="logo"
                onClick={this.updateSelected.bind(this, "/admin/dashboard")}
              >
                <img alt="江渝礼享" src={logo} />
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
                {this.getNavMap(navsLeft)}
              </Menu>
            </Sider>
            <Layout
              className="site-layout"
              style={{
                padding: 0,
              }}
            >
              <Header
                className="site-layout-background"
                style={{
                  padding: 0,
                }}
              >
                <Row>
                  <Col xs={{ span: 12 }} lg={{ span: 12 }}>
                    {React.createElement(
                      this.state.collapsed
                        ? MenuUnfoldOutlined
                        : MenuFoldOutlined,
                      {
                        className: "trigger",
                        onClick: this.toggle,
                      }
                    )}
                  </Col>
                  <Col xs={{ span: 12 }} lg={{ span: 8, offset: 4 }}>
                    <TopNav />
                  </Col>
                </Row>
              </Header>
              <Content
                className="site-layout-background"
                style={{
                  margin: "24px 16px",
                  padding: 24,
                  minHeight: 280,
                }}
              >
                {this.props.children}
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </ReactDocumentTitle>
    );
  }
}
export default FrameOut;
