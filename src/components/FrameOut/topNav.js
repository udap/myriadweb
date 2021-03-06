import React from "react";
import { withRouter } from "react-router-dom";
import { Menu, Modal, notification, Avatar, message } from "antd";
import {
  ExclamationCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  BankOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { EventSourcePolyfill } from "event-source-polyfill";
import moment from "moment";
import FileSaver from "file-saver";

import { HeaderDropdown, NoticeIcon } from "@components";
import storageUtils from "@utils/storageUtils";
import { host } from "@utils/config";
import "./index.less";
import { reqDownloadTemplate } from "@api";
import { defaultUser } from "@/assets/images";

const TopNav = (props) => {
  const sse = React.useRef(null);
  const [noticeArr, setNoticeArr] = React.useState([]);
  const [downloading, setDownloading] = React.useState(false);

  const filterLocalUserNotice = (arr = []) => {
    const user = storageUtils.getUser();
    // 当前登录用户
    return arr.filter((item) => item.recipient === String(user.id));
  };

  React.useLayoutEffect(() => {
    const localNotifications =
      JSON.parse(localStorage.getItem("notifications")) || [];

    // 得到 createTime 相较于当前时间小于一天的数组
    const daysAgoArr = localNotifications.filter((item) => {
      const numOfDays = moment()
        .locale("zh-cn")
        .diff(moment(item.createTime), "days");

      return numOfDays === 0;
    });

    // 清除 1 days 之前的消息
    localStorage.setItem("notifications", JSON.stringify(daysAgoArr));

    // 设置当前登录用户的消息列表（数组）
    const tempArr = filterLocalUserNotice(daysAgoArr);
    setNoticeArr([...tempArr]);

    const token = storageUtils.getToken();
    const user = storageUtils.getUser();

    sse.current = new EventSourcePolyfill(`${host}/sse/messages`, {
      withCredentials: false,
      headers: { "X-ACCESS-TOKEN": token, "CLIENT-ID": user.guid },
      // 结束请求，并重新发起的时间间距
      heartbeatTimeout: 30_000,
    });

    sse.current.onopen = () => {};

    sse.current.onmessage = (e) => {
      const notifications = JSON.parse(localStorage.getItem("notifications"));
      const notificationData = JSON.parse(e.data);
      let arr = [];

      if (!(notifications instanceof Array)) {
        arr.unshift({
          ...notificationData,
          isRead: false,
        });
      } else {
        const isExist = notifications.some(
          (item) => item.id === notificationData.id
        );
        if (!isExist) {
          notifications.unshift({
            ...notificationData,
            isRead: false,
          });
        }

        arr = [...notifications];
      }

      const tempFilterArr = filterLocalUserNotice(arr);
      setNoticeArr([...tempFilterArr]);
      localStorage.setItem("notifications", JSON.stringify(arr));
    };

    sse.current.onerror = () => {};

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
      <Menu.Item key="/admin/customer">
        <SolutionOutlined />
        我的客户
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">
        <LogoutOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  );

  const changeReadState = (clickedItem) => {
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

  // 消息列表是否展开 boolean
  const onNoticeVisibleChange = (isExpend) => {};

  const countOfUnRead = noticeArr.filter((item) => item.isRead === false);

  const extraClick = (item) => {
    changeReadState(item);

    item.content.attachments.forEach((element) => {
      if (!element) return;
      setDownloading(true);
      // 后端返回下载文件名及文件后缀名
      const filename = `${element}`;
      reqDownloadTemplate(filename)
        .then((response) => {
          FileSaver.saveAs(response.data, filename);
          setDownloading(false);
        })
        .catch(() => {
          setDownloading(false);
          notification.warning({
            message: "下载失败，请稍后再试",
          });
        });
    });
  };

  const userData = storageUtils.getUser();

  // 一键已读 通知
  const onReadAllClick = () => {
    let tempNoticeArr = [];
    noticeArr.forEach((item) => {
      item.isRead = true;
      tempNoticeArr.push(item);
    });

    const tempFilterArr = filterLocalUserNotice(tempNoticeArr);
    setNoticeArr([...tempFilterArr]);
    localStorage.setItem("notifications", JSON.stringify(tempNoticeArr));
  };

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
        readAllText="全部已读"
        onPopupVisibleChange={onNoticeVisibleChange}
        onViewMore={() => message.info("Click on view more")}
        clearClose
        extraClick={extraClick}
        onReadAllClick={onReadAllClick}
      >
        <NoticeIcon.Tab
          tabKey="notification"
          count={noticeArr.length}
          list={noticeArr}
          title="通知"
          emptyText="暂无通知"
          // showViewMore
          // showClear
          showReadAll
          downloading={downloading}
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
              src={defaultUser}
              alt="avatar"
            />
            <span className="name">{userData && userData.cellphone}</span>
          </span>
        </HeaderDropdown>
      </div>
    </div>
  );
};

export default withRouter(TopNav);
