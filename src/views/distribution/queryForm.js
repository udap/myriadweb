import React from "react";
import { Form, Row, Col, Radio, Button, Input, DatePicker } from "antd";

import moment from "moment";
import "moment/locale/zh-cn";

import "../../css/common.less";

const { RangePicker } = DatePicker;

const QueryForm = ({
  loading,
  dateRange,
  onLoading,
  onSwitchType,
  onSubmitQuery,
}) => {
  let beginDate = dateRange && dateRange[0] ? dateRange[0] : new Date();
  let endDate = dateRange && dateRange[1] ? dateRange[1] : new Date();
  return (
    <Form
      onFinish={onSubmitQuery}
      layout="horizontal"
      name="advanced_search"
      className="search-form"
      initialValues={{
        searchTxt: "",
        type: "user",
        dateRange: [
          moment(beginDate, "YYYY-MM-DD"),
          moment(endDate, "YYYY-MM-DD"),
        ],
      }}
    >
      <Row gutter={[16, 16]}>
        <Col>
          <Form.Item name="type" label="查询条件">
            <Radio.Group onChange={onSwitchType} buttonStyle="solid">
              <Radio.Button value="user">我的发放</Radio.Button>
              <Radio.Button value="org">机构发放</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="searchTxt">
            <Input
              placeholder="请输入券号、活动名、活动标签进行搜索"
              allowClear
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item name="dateRange">
            <RangePicker format="YYYY-MM-DD" />
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
    </Form>
  );
};

export default QueryForm;
