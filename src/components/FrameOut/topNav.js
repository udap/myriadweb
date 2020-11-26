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
import moment from "moment";

import { HeaderDropdown, NoticeIcon } from "../../components";
import storageUtils from "../../utils/storageUtils";
import { host } from "../../utils/config";
import "./index.less";

const TopNav = (props) => {
  const sse = React.useRef(null);
  const [noticeArr, setNoticeArr] = React.useState([]);

  const filterLocalUserNotice = (arr = []) => {
    const user = storageUtils.getUser();
    return arr.filter((item) => item.recipient === String(user.id));
  };

  React.useLayoutEffect(() => {
    const localNotifications = JSON.parse(
      localStorage.getItem("notifications")
    );

    const tempArr = filterLocalUserNotice(localNotifications);
    setNoticeArr([...tempArr]);

    const token = storageUtils.getToken();

    sse.current = new EventSourcePolyfill(`${host}/sse/messages`, {
      withCredentials: false,
      headers: { "X-ACCESS-TOKEN": token },
      // 结束请求，并重新发起的时间间距
      heartbeatTimeout: 300000,
    });

    sse.current.onopen = () => {
      console.log("SSE Conneted", new Date());
    };

    sse.current.onmessage = (e) => {
      const notifications = JSON.parse(localStorage.getItem("notifications"));
      const notificationData = JSON.parse(e.data);
      let arr = [];

      if (!(notifications instanceof Array)) {
        arr.push({
          ...notificationData,
          date: moment().valueOf(),
          isRead: false,
        });
      } else {
        const filterObj = notifications.find(
          (item) => item.id === notificationData.id
        );
        if (!filterObj) {
          notifications.push({
            ...notificationData,
            date: moment().valueOf(),
            isRead: false,
          });
        }

        arr = [...notifications];
      }

      const tempFilterArr = filterLocalUserNotice(arr);
      setNoticeArr([...tempFilterArr]);
      localStorage.setItem("notifications", JSON.stringify(arr));
    };

    sse.current.onerror = (err) => {
      console.log("SSE Error", err, new Date());
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
    let tempNoticeArr = [];
    noticeArr.forEach((item) => {
      if (item.id === clickedItem.id) {
        item.isRead = true;
      }
      tempNoticeArr.push(item);
    });

    const tempFilterArr = filterLocalUserNotice(tempNoticeArr);
    setNoticeArr([...tempFilterArr]);
    localStorage.setItem("notifications", JSON.stringify(tempNoticeArr));
  };

  const onNoticeVisibleChange = (item) => {
    console.log("onNoticeVisibleChange", item);
  };

  const handleNoticeClear = (title, key) => {
    console.log("handleNoticeClear", title, key);
  };

  const countOfUnRead = noticeArr.filter((item) => item.isRead === false);

  return (
    <div className="right">
      <NoticeIcon
        className="action"
        count={countOfUnRead.length}
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
          count={noticeArr.length}
          list={noticeArr}
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
