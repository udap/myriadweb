import React from "react";
import { Form, Row, Col, Radio, Button, Input, DatePicker } from "antd";
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
        typeSelection: "owner",
        dateRange: [
          moment("2021-01-01", "YYYY-MM-DD"),
          moment(new Date(), "YYYY-MM-DD"),
        ],
      }}
    >
      <Row gutter={[16, 16]}>
        <Col>
          <Form.Item name="typeSelection" label="票券归属">
            <Radio.Group
              onChange={props.onChangeType}
              buttonStyle="solid"
              defaultValue="owner"
              disabled={props.loading}
            >
              <Radio.Button value="owner">我的活动</Radio.Button>
              <Radio.Button value="publisherId">机构活动</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="searchTxt" label="搜索">
            <Input
              placeholder="请输入券名、活动名、机构名、标签、创建人查询"
              allowClear
            />
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
              onClick={props.enableLoading}
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
