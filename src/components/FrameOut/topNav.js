import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Menu, Row, Col, Modal, notification } from "antd";
import { AntdIcon, LinkBtn } from "../../components";
import storageUtils from "../../utils/storageUtils";
import { ExclamationCircleOutlined } from "@ant-design/icons";
//获取titile
import comEvents from "../../utils/comEvents";
import "./index.less";
import { SettingOutlined } from "@ant-design/icons";

const { SubMenu } = Menu;
const { confirm } = Modal;

//右上角导航
@withRouter
class TopNav extends Component {
  state = {
    current: "mail",
  };
  componentDidMount() {}

  handleClick = (e) => {
    console.log("click ", e);
    this.setState({
      current: e.key,
      selectedKeys: "",
      authCode: "",
    });
  };

  //退出登录
  logout = () => {
    confirm({
      title: "确认退出登录吗？",
      icon: <ExclamationCircleOutlined />,
      onOk: () => {
        //清空缓存localStorage
        storageUtils.removeUser();
        storageUtils.removeOrg();
        storageUtils.removeToken();
        //user = {};
        //返回登陆页
        this.props.history.push("/login");
      },
    });
  };
  menusHandler = ({ item, key, keyPath, domEvent }) => {
    console.log(item, key, keyPath, domEvent);
    this.selectedOpenKeys = item.pathname;
    if (storageUtils.getUser().orgUid) {
      this.props.history.push(key);
      this.setState({
        selectedKeys: key,
      });
    } else {
      notification.info({
        message: "您尚未加入任何结构！请注册新机构或者退出",
      });
      this.props.history.push("/admin/dashboard");
    }
  };
  render() {
    //获取当前页面需要默认打开子列表的key值
    const openKey = this.selectedOpenKeys;
    //获取当前页面的路径地址
    const path = openKey;
    //更新title
    let curTtile = comEvents.getTitle(path);
    window.document.title = curTtile;
    return (
      <div>
        <Row>
          <Col span={10} offset={6}>
            <Menu
              mode="horizontal"
              onClick={this.menusHandler}
              selectedKeys={[path]}
              defaultOpenKeys={[openKey]}
            >
              <SubMenu
                title={
                  <span className="submenu-title-wrapper">
                    <SettingOutlined />
                    {storageUtils.getUser().cellphone}
                  </span>
                }
              >
                <Menu.Item key="/admin/myAccount">
                  <AntdIcon name="UserOutlined" />
                  我的账户
                </Menu.Item>
                <Menu.Item key="/admin/myOrgs">
                  <AntdIcon name="BankOutlined" />
                  我的机构
                </Menu.Item>
                <Menu.Item key="/admin/merchant">
                  <AntdIcon name="ApartmentOutlined" />
                  入驻商户
                </Menu.Item>
              </SubMenu>
            </Menu>
          </Col>
          <Col span={8}>
            <AntdIcon name="LoginOutlined" />
            <LinkBtn className="title" onClick={this.logout.bind(this)}>
              <span className="btnText">退出登录</span>
            </LinkBtn>
          </Col>
        </Row>
      </div>
    );
  }
}
export default TopNav;
