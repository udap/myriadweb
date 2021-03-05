import React from "react";
import { Descriptions, Table, Divider } from "antd";

import {
  SCHEDULE_TYPE,
  GIVEAWAY_SELECTION,
  GIVEAWAY_REWARDS_TYPE,
} from "@utils/constants";

const { Column } = Table;

const CheckInPanel = (props) => {
  return (
    <>
      <Divider orientation="left" plain>
        签到计划
      </Divider>
      <Descriptions
        size="small"
        bordered
        column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
      >
        {props.schedule && (
          <>
            <Descriptions.Item label="签到日程">
              {SCHEDULE_TYPE[props.schedule?.type]}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>
      <Divider orientation="left" plain>
        赠送品
      </Divider>

      {props.giveaway?.rewards && (
        <Table
          bordered
          size="small"
          dataSource={props.giveaway?.rewards}
          pagination={{
            pageSize: 20,
            total: props.giveaway?.rewards.length,
            hideOnSinglePage: true,
            showSizeChanger: false,
          }}
        >
          <Column title="赠品" dataIndex="name" key="name" />
          <Column
            title="描述"
            dataIndex="description"
            key="description"
            ellipsis
          />
          <Column
            title="概率"
            dataIndex="probability"
            key="probability"
            render={(text) => `${text}%`}
          />
          <Column title="数量" dataIndex="amount" key="amount" />
          <Column
            title="类型"
            dataIndex="type"
            key="type"
            render={(text) => GIVEAWAY_REWARDS_TYPE[text]}
          />
        </Table>
      )}
      <Descriptions
        size="small"
        bordered
        column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
      >
        {props.giveaway && (
          <>
            <Descriptions.Item label="现场赠送">
              {props.giveaway?.instant ? "是" : "否"}
            </Descriptions.Item>
            <Descriptions.Item label="发放方式">
              {GIVEAWAY_SELECTION[props.giveaway?.selection]}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>
    </>
  );
};

export default CheckInPanel;
