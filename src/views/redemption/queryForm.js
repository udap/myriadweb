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
  onSwitchRole,
  onSubmit,
}) => {
  let beginDate = dateRange && dateRange[0] ? dateRange[0] : new Date();
  let endDate = dateRange && dateRange[1] ? dateRange[1] : new Date();
  return (
    <Form
      onFinish={onSubmit}
      layout="horizontal"
      name="advanced_search"
      className="search-form"
      initialValues={{
        role: "marketer",
        searchTxt: "",
        dateRange: [
          moment(beginDate, "YYYY-MM-DD"),
          moment(endDate, "YYYY-MM-DD"),
        ],
      }}
    >
      <Row gutter={[16, 16]}>
        <Col>
          <Form.Item name="role" label="查询条件">
            <Radio.Group
              onChange={onSwitchRole}
              buttonStyle="solid"
              disabled={loading}
            >
              <Radio.Button value="marketer">营销机构</Radio.Button>
              <Radio.Button value="merchant">核销机构</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="searchTxt">
            <Input
              placeholder="请输入券号、活动名、订单号进行搜索"
              allowClear
              disabled={loading}
            />
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
    </Form>
  );
};

export default QueryForm;
