import React from "react";
import { withRouter } from "react-router-dom";
import { Menu, Modal, notification, Avatar, message } from "antd";
import {
  ExclamationCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  BankOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { EventSourcePolyfill } from "event-source-polyfill";

import { HeaderDropdown, NoticeIcon } from "../../components";
import storageUtils from "../../utils/storageUtils";
import "./index.less";

let msg = [];
for (let index = 0; index < 10; index++) {
  msg.push({
    avatar:
      "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
    key: index,
    title: `你收到了 ${index} 份新周报`,
    description: "description",
    extra: "extra",
    datetime: "2020-11-11 00:00:00",
  });
}

const TopNav = (props) => {
  const sse = React.useRef(null);
  const [currentUser, setCurrentUser] = React.useState({ unreadCount: 11 });
  const [unreadMsg, setUnreadMsg] = React.useState({ notification: 9 });
  const [noticeData, setNoticeData] = React.useState({
    notification: msg,
  });

  React.useLayoutEffect(() => {
    const token = storageUtils.getToken();

    sse.current = new EventSourcePolyfill("/myriadapi/sse/messages", {
      withCredentials: false,
      headers: {
        "X-ACCESS-TOKEN": token,
      },
      // 结束请求，并重新发起的时间间距
      heartbeatTimeout: 10000,
    });

    sse.current.onopen = () => {
      console.log("Conneted", new Date());
    };

    sse.current.onmessage = (e) => console.log("onmessage", e, new Date());

    sse.current.onerror = (err) => {
      console.log("onerror", err, new Date());
    };

    return () => {
      sse.current.close();
    };
  }, [sse]);

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
        //返回登陆页
        props.history.push("/login");
      },
    });
  };

  const menusHandler = ({ item, key }) => {
    switch (key) {
      case "logout":
        logout();
        break;

      default:
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

  const menuHeaderDropdown = (
    <Menu className="menu" selectedKeys={[]} onClick={menusHandler}>
      <Menu.Item key="/admin/profile">
        <UserOutlined />
        我的账户
      </Menu.Item>
      <Menu.Item key="/admin/myOrgs">
        <BankOutlined />
        我的机构
      </Menu.Item>
      <Menu.Item key="/admin/merchant">
        <ApartmentOutlined />
        入驻商户
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">
        <LogoutOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  );

  const changeReadState = (clickedItem) => {
    console.log("changeReadState", clickedItem);
  };

  const onNoticeVisibleChange = (item) => {
    console.log("onNoticeVisibleChange", item);
  };

  const handleNoticeClear = (title, key) => {
    console.log("handleNoticeClear", title, key);
  };

  return (
    <div className="right">
      <NoticeIcon
        className="action"
        count={currentUser && currentUser.unreadCount}
        onItemClick={(item) => {
          changeReadState(item);
        }}
        clearText="清空"
        viewMoreText="查看更多"
        onClear={handleNoticeClear}
        onPopupVisibleChange={onNoticeVisibleChange}
        onViewMore={() => message.info("Click on view more")}
        clearClose
      >
        <NoticeIcon.Tab
          tabKey="notification"
          count={unreadMsg.notification}
          list={noticeData.notification}
          title="通知"
          emptyText="你已查看所有通知"
          showViewMore
        />
        {/* <NoticeIcon.Tab
          tabKey="message"
          count={unreadMsg.message}
          list={noticeData.message}
          title="消息"
          emptyText="您已读完所有消息"
          showViewMore
        />
        <NoticeIcon.Tab
          tabKey="event"
          title="待办"
          emptyText="你已完成所有待办"
          count={unreadMsg.event}
          list={noticeData.event}
          showViewMore
        /> */}
      </NoticeIcon>
      <div className="action">
        <HeaderDropdown overlay={menuHeaderDropdown}>
          <span className="action account">
            <Avatar
              size="small"
              className="avatar"
              src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
              alt="avatar"
            />
            <span className="name">{storageUtils.getUser().cellphone}</span>
          </span>
        </HeaderDropdown>
      </div>
    </div>
  );
};

export default withRouter(TopNav);
