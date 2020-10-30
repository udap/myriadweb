import React from "react";
import { Form, Row, Col, DatePicker, Button, Input } from "antd";
import moment from "moment";
import "moment/locale/zh-cn";

import "../../css/common.less";
const { RangePicker } = DatePicker;

const QueryForm = ({ loading, dateRange, onLoading, onSubmit }) => {
  let beginDate = dateRange && dateRange[0] ? dateRange[0] : new Date();
  let endDate = dateRange && dateRange[1] ? dateRange[1] : new Date();
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
      <Form.Item name="typeSelection" label="查询条件">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Form.Item name="searchTxt">
              <Input placeholder="请输入活动名或标签进行搜索" allowClear />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="dateRange">
              <RangePicker format="YYYY-MM-DD" disabled={loading} />
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
                搜索
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default QueryForm;
