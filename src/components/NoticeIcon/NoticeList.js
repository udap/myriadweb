import React from "react";
import { List, Avatar } from "antd";
import moment from "moment";
import { DeliveredProcedureOutlined, SettingFilled } from "@ant-design/icons";

import "./NoticeList.less";

const NoticeList = (props) => {
  const {
    data = [],
    emptyText,
    onClick,
    // showClear = true,
    // onClear,
    // clearText,
    // title,
    // showViewMore = false,
    // onViewMore,
    // viewMoreText,
  } = props;
  if (!data || data.length === 0) {
    return (
      <div className="notFound">
        <img
          src="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
          alt="not found"
        />
        <div>{emptyText}</div>
      </div>
    );
  }

  return (
    <div style={{ border: "none" }}>
      <List
        className="list"
        dataSource={data}
        renderItem={(item, i) => {
          let leftIcon;
          switch (item.content.type) {
            case "BATCH_DISTRIBUTION":
              leftIcon = (
                <Avatar
                  className="avatar"
                  icon={<DeliveredProcedureOutlined />}
                />
              );
              break;

            default:
              leftIcon = <Avatar className="avatar" icon={<SettingFilled />} />;
              break;
          }

          return (
            <List.Item
              className={`item ${item.isRead ? "read" : ""}`}
              key={item.id || i}
              onClick={() => onClick && onClick(item)}
            >
              <List.Item.Meta
                className="meta"
                avatar={leftIcon}
                title={
                  <div className="title">
                    {item.content.msg}
                    {/* <div className="extra">{item.extra}</div> */}
                  </div>
                }
                description={
                  <div>
                    {/* <div className="description">{item.description}</div> */}
                    <div className="datetime">
                      {moment(item.date).format("YYYY/MM/DD hh:mm:ss")}
                    </div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
      {/* <div className="bottomBar">
        {showClear ? (
          <div onClick={onClear}>
            {clearText} {title}
          </div>
        ) : null}
        {showViewMore ? (
          <div
            onClick={(e) => {
              if (onViewMore) {
                onViewMore(e);
              }
            }}
          >
            {viewMoreText}
          </div>
        ) : null}
      </div> */}
    </div>
  );
};

export default NoticeList;
