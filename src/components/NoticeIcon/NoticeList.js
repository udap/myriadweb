import React from "react";
import { List, Avatar } from "antd";
import moment from "moment";

import "./NoticeList.less";
import { notice, noNotice } from "../../assets/images";
import { noticeType } from "../../utils/constants";

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
        <img src={noNotice} alt="not found" />
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
              leftIcon = notice;
              break;

            default:
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
                avatar={<Avatar className="avatar" src={leftIcon} />}
                title={
                  <div className="title">
                    {noticeType[item.content.type]}
                    {/* <div className="extra">{item.extra}</div> */}
                  </div>
                }
                description={
                  <div>
                    <div className="description">{item.content.msg}</div>
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
