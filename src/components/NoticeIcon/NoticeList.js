import React from "react";
import { List, Avatar } from "antd";

import "./NoticeList.less";

const NoticeList = (props) => {
  console.log(props);
  const {
    data = [],
    emptyText,
    onClick,
    showClear = true,
    onClear,
    clearText,
    title,
    showViewMore = false,
    onViewMore,
    viewMoreText,
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
          const leftIcon = item.avatar ? (
            typeof item.avatar === "string" ? (
              <Avatar className="avatar" src={item.avatar} />
            ) : (
              <span className="iconElement">{item.avatar}</span>
            )
          ) : null;

          return (
            <List.Item
              // className="item read"
              className="item"
              key={item.key || i}
              onClick={() => onClick && onClick(item)}
            >
              <List.Item.Meta
                className="meta"
                avatar={leftIcon}
                title={
                  <div className="title">
                    {item.title}
                    <div className="extra">{item.extra}</div>
                  </div>
                }
                description={
                  <div>
                    <div className="description">{item.description}</div>
                    <div className="datetime">{item.datetime}</div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
      <div className="bottomBar">
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
      </div>
    </div>
  );
};

export default NoticeList;
