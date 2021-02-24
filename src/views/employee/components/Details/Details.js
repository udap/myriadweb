import React from "react";
import { Drawer, Row, Col, Descriptions, Tag, Skeleton } from "antd";

import { employeeStatuses, roleTypes } from "@utils/constants";

const scrollStyle = {
  display: "block",
  maxHeight: "400px",
  overflow: "auto",
  overflowX: "hidden",
};

const Details = (props) => {
  return (
    <div>
      <Drawer
        width={400}
        title="员工详情"
        visible={props.visible}
        onClose={props.onClose}
        footer={null}
      >
        {props.loading ? (
          <Skeleton />
        ) : (
          <Row>
            <Col span={24}>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="姓名">
                  {props.curInfo?.name}
                </Descriptions.Item>
                <Descriptions.Item label="手机号">
                  {props.curInfo?.cellphone}
                </Descriptions.Item>
                <Descriptions.Item label="员工编码">
                  {props.curInfo?.code}
                </Descriptions.Item>
                <Descriptions.Item label="是否管理员">
                  {props.curInfo?.admin ? "是" : "否"}
                </Descriptions.Item>
                <Descriptions.Item label="部门">
                  {props.curInfo?.org?.name}
                </Descriptions.Item>
                <Descriptions.Item label="分组">
                  <div style={scrollStyle}>
                    {props.curInfo?.groups &&
                      props.curInfo?.groups.length !== 0 &&
                      props.curInfo?.groups.map((item, index) => (
                        <Tag color="blue" key={index}>
                          {item["name"]}
                        </Tag>
                      ))}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="角色">
                  <Tag color="green">
                    {roleTypes.map((item, index) => (
                      <span key={index}>{item[props.curInfo?.role]}</span>
                    ))}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color="green">
                    {employeeStatuses.map((item, index) => (
                      <span key={index}>{item[props.curInfo?.status]}</span>
                    ))}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="备注">
                  {props.curInfo?.desc}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        )}
      </Drawer>
    </div>
  );
};

export default Details;
