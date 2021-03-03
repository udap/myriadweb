import React from "react";
import { Form, Row, Col, Radio, Button, Input, DatePicker } from "antd";
import moment from "moment";
import "moment/locale/zh-cn";

import "@css/common.less";

const { RangePicker } = DatePicker;

const QueryForm = ({
  loading,
  dateRange,
  onLoading,
  onSubmit,
  onIncluding,
  role,
  includingSubsidiaries,
}) => {
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
        role,
        searchTxt: "",
        dateRange: [
          moment(beginDate, "YYYY-MM-DD"),
          moment(endDate, "YYYY-MM-DD"),
        ],
        includingSubsidiaries,
      }}
    >
      <Row gutter={[16, 16]}>
        <Col>
          <Form.Item name="includingSubsidiaries" label="下属机构">
            <Radio.Group
              onChange={onIncluding}
              buttonStyle="solid"
              disabled={loading}
            >
              <Radio.Button value={true}>包含</Radio.Button>
              <Radio.Button value={false}>不包含</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="searchTxt"
            label="搜索"
            tooltip="根据券号、活动名、订单号、活动标签或客户:（原始编号、电话号、邮箱、真实名字）搜索"
          >
            <Input placeholder="请输入" allowClear />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item
            name="dateRange"
            label="核销时间"
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

export default QueryForm;
