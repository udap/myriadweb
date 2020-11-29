import React from "react";
import { Badge, Tabs } from "antd";
import useMergeValue from "use-merge-value";
import { BellOutlined } from "@ant-design/icons";

import HeaderDropdown from "../HeaderDropdown";
import NoticeList from "./NoticeList";
import "./index.less";

const { TabPane } = Tabs;

const NoticeIcon = (props) => {
  const onTabChange = () => {};

  const getNotificationBox = () => {
    const {
      children,
      clearText,
      viewMoreText,
      onClear,
      onItemClick,
      onViewMore,
      extraClick,
    } = props;
    const panes = [];
    React.Children.forEach(children, (child) => {
      const {
        list,
        title,
        count,
        tabKey,
        showClear,
        showViewMore,
      } = child.props;
      const len = list && list.length ? list.length : 0;
      const msgCount = count || count === 0 ? count : len;
      const tabTitle = msgCount > 0 ? `${title} (${msgCount})` : title;
      panes.push(
        <TabPane tab={tabTitle} key={tabKey}>
          <NoticeList
            {...child.props}
            clearText={clearText}
            viewMoreText={viewMoreText}
            data={list}
            onClear={() => onClear && onClear(title, tabKey)}
            onClick={(item) => onItemClick && onItemClick(item, child.props)}
            extraClick={extraClick}
            onViewMore={(event) => onViewMore && onViewMore(child.props, event)}
            showClear={showClear}
            showViewMore={showViewMore}
            title={title}
          />
        </TabPane>
      );
    });
    return (
      <>
        <Tabs onChange={onTabChange} centered>
          {panes}
        </Tabs>
      </>
    );
  };

  const { count } = props;
  const notificationBox = getNotificationBox();
  const [visible, setVisible] = useMergeValue(false, {
    value: props.popupVisible,
    onChange: props.onPopupVisibleChange,
  });
  const trigger = (
    <span className="noticeButton">
      <Badge count={count} style={{ boxShadow: "none" }} className="badge">
        <BellOutlined className="icon" />
      </Badge>
    </span>
  );
  return (
    <HeaderDropdown
      placement="bottomRight"
      overlay={notificationBox}
      overlayClassName="popover"
      trigger={["click"]}
      visible={visible}
      onVisibleChange={setVisible}
    >
      {trigger}
    </HeaderDropdown>
  );
};

NoticeIcon.Tab = NoticeList;

export default NoticeIcon;
