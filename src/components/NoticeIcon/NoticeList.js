import React from "react";
import { List, Avatar, Popover, Button } from "antd";
import { EllipsisOutlined, DownloadOutlined } from "@ant-design/icons";

import "./NoticeList.less";
import {
  noNotice,
  defaultNotice,
  eventRelease,
  additionalCoupons,
  batchIssuing,
  bulkCoupons,
} from "@assets/images";
import { noticeType } from "@utils/constants";

const NoticeList = (props) => {
  const {
    data = [],
    emptyText,
    onClick,
    extraClick,
    downloading,
    showClear,
    // onClear,
    // clearText,
    // title,
    showViewMore,
    // onViewMore,
    // viewMoreText,
    showReadAll,
    readAllText,
    onReadAllClick,
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
          let leftIcon = defaultNotice;
          switch (item.content.type) {
            case "BATCH_DISTRIBUTION":
              leftIcon = batchIssuing;
              break;
            case "CAMPAIGN_ACTIVATION":
              leftIcon = eventRelease;
              break;
            case "BATCH_TRANSFER":
              leftIcon = bulkCoupons;
              break;
            case "VOUCHER_ISSUANCE":
              leftIcon = additionalCoupons;
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
                    {item.content.attachments &&
                    item.content.attachments.length ? (
                      <div className="extra">
                        <Popover
                          content={
                            <Button
                              type="link"
                              icon={<DownloadOutlined />}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                extraClick(item);
                              }}
                              loading={downloading}
                            >
                              附件
                            </Button>
                          }
                          trigger="hover"
                        >
                          <EllipsisOutlined />
                        </Popover>
                      </div>
                    ) : null}
                  </div>
                }
                description={
                  <div>
                    <div className="description">{item.content.msg}</div>
                    <div className="dateline">{item.createTime}</div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
      {(showReadAll || showClear || showViewMore) && (
        <div className="bottomBar">
          {showReadAll && <div onClick={onReadAllClick}>{readAllText}</div>}
          {/* {showClear ? (
          <div onClick={onClear}>
            {clearText} {title}
          </div>
        ) : null} */}
          {/* {showViewMore ? (
          <div
            onClick={(e) => {
              if (onViewMore) {
                onViewMore(e);
              }
            }}
          >
            {viewMoreText}
          </div>
        ) : null} */}
        </div>
      )}
    </div>
  );
};

export default NoticeList;
