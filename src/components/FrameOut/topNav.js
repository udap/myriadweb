import React from "react";
import { withRouter } from "react-router-dom";
import { Menu, Row, Col, Modal, notification, Button, Badge } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { ExclamationCircleOutlined, BellOutlined } from "@ant-design/icons";

import { AntdIcon } from "../../components";
import storageUtils from "../../utils/storageUtils";
import "./index.less";
import { DrawerView } from "./components";

const TopNav = (props) => {
  const [visible, setVisible] = React.useState(false);
  const [selectedOpenKeys, setSelectedOpenKeys] = React.useState("");
  const [message, setMessage] = React.useState([{ title: "Test" }]);

  //退出登录
  const logout = () => {
    Modal.confirm({
      title: "确认退出登录吗？",
      icon: <ExclamationCircleOutlined />,
      onOk: () => {
        //清空缓存localStorage
        storageUtils.removeUser();
        storageUtils.removeOrg();
        storageUtils.removeToken();
        //user = {};
        //返回登陆页
        props.history.push("/login");
      },
    });
  };

  const menusHandler = ({ item, key }) => {
    switch (key) {
      case "loginOut":
        logout();
        break;

      default:
        setSelectedOpenKeys(item.pathname);
        if (storageUtils.getUser().orgUid) {
          props.history.push(key);
        } else {
          notification.info({
            message: "您尚未加入任何结构！请注册新机构或者退出",
          });
          props.history.push("/admin/dashboard");
        }
        break;
    }
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Row>
        <Col flex="auto">
          <></>
        </Col>
        <Col flex="none">
          <Row>
            <Col>
              <Menu
                mode="horizontal"
                onClick={menusHandler}
                selectedKeys={[selectedOpenKeys]}
                defaultOpenKeys={[selectedOpenKeys]}
              >
                <Menu.SubMenu
                  title={
                    <span className="submenu-title-wrapper">
                      <SettingOutlined />
                      {storageUtils.getUser().cellphone}
                    </span>
                  }
                >
                  <Menu.Item key="/admin/profile">
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
                  <Menu.Item key="loginOut">
                    <AntdIcon name="LoginOutlined" />
                    退出登录
                  </Menu.Item>
                </Menu.SubMenu>
              </Menu>
            </Col>
            <Col>
              <Button
                style={{ marginRight: 18, marginLeft: 10 }}
                type="link"
                icon={
                  <Badge count={message.length} size="small">
                    <BellOutlined style={{ fontSize: 20, paddingRight: 8 }} />
                  </Badge>
                }
                onClick={showDrawer}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <DrawerView visible={visible} onClose={onClose} />
    </>
  );
};

export default withRouter(TopNav);
