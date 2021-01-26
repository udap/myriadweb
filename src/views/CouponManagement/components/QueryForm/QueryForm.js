import React from "react";
import { Form, Row, Col, Select, Button, Input, DatePicker } from "antd";
import moment from "moment";

import "@css/common.less";

const { RangePicker } = DatePicker;

const QueryForm = (props) => {
  return (
    <Form
      onFinish={props.onFinish}
      layout="horizontal"
      name="advanced_search"
      className="ant-advanced-search-form"
      initialValues={{
        searchTxt: "",
        typeSelection: props.type,
        dateRange: [
          moment("2021-01-01", "YYYY-MM-DD"),
          moment(new Date(), "YYYY-MM-DD"),
        ],
      }}
    >
      <Row gutter={[16, 16]}>
        <Col>
          <Form.Item name="typeSelection" label="活动">
            <Select style={{ width: 140 }} loading={props.loading}>
              <Select.Option value="OWNED">我发布的活动</Select.Option>
              <Select.Option value="PARTICIPATED">我参与的活动</Select.Option>
              <Select.Option value="OWNED_BY_ORG">机构发布的活动</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="searchTxt"
            label="搜索"
            tooltip="包括券名、活动名、机构名、标签、创建人"
          >
            <Input placeholder="请输入" allowClear />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item name="dateRange" label="发布时间">
            <RangePicker format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button
              type="primary"
              className="cursor searchBtn"
              htmlType="submit"
              loading={props.loading}
            >
              查询
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default QueryForm;
