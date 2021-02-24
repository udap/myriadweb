import React from "react";
import { Form, Row, Col, DatePicker, Button, Input } from "antd";
import moment from "moment";
import "moment/locale/zh-cn";

import "@css/common.less";
const { RangePicker } = DatePicker;

const QueryFilter = ({ loading, dateRange, onLoading, onSubmit }) => {
  const beginDate = dateRange && dateRange[0] ? dateRange[0] : new Date();
  const endDate = dateRange && dateRange[1] ? dateRange[1] : new Date();

  const disabledDate = (current) => {
    // 时间点：三个月前
    const prohibitedTime = moment().subtract(3, "months");
    return current < prohibitedTime;
  };

  return (
    <Form
      onFinish={onSubmit}
      layout="horizontal"
      name="advanced_search"
      className="ant-advanced-search-form"
      initialValues={{
        searchTxt: "",
        dateRange: [
          moment(beginDate, "YYYY-MM-DD"),
          moment(endDate, "YYYY-MM-DD"),
        ],
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Form.Item
            name="searchTxt"
            label="搜索"
            tooltip="包含活动名、员工名、员工号、员工手机号、所属机构"
          >
            <Input placeholder="请输入" allowClear />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item
            name="dateRange"
            label="配券时间"
            tooltip="只能选择当前时间的前三个月内的时间段"
          >
            <RangePicker
              format="YYYY-MM-DD"
              disabled={loading}
              allowClear={false}
              disabledDate={disabledDate}
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button
              type="primary"
              className="cursor searchBtn"
              htmlType="submit"
              loading={loading}
              onClick={onLoading}
            >
              查询
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default QueryFilter;
