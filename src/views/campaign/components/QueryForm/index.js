import React from "react";
import { Form, Row, Col, Radio, Button, Input, Select } from "antd";

import "@css/common.less";

const QueryForm = (props) => {
  return (
    <Form
      onFinish={props.onFinish}
      layout="horizontal"
      name="advanced_search"
      className="ant-advanced-search-form"
      initialValues={{
        searchTxt: "",
        group: "participant",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col>
          <Form.Item name="group" label="活动">
            {/* <Radio.Group
              onChange={props.onChangeType}
              buttonStyle="solid"
              disabled={props.loading}
            >
              <Radio.Button value="participant">我参与的</Radio.Button>
              <Radio.Button value="participantCreate">我创建的</Radio.Button>
              <Radio.Button value="party">机构参与的</Radio.Button>
              <Radio.Button value="partyCreate">机构发布的</Radio.Button>
            </Radio.Group> */}
            <Select
              style={{ width: 120 }}
              loading={props.loading}
              onChange={props.onChangeType}
            >
              <Select.Option value="participant">我参与的</Select.Option>
              <Select.Option value="participantCreate">我创建的</Select.Option>
              <Select.Option value="party">机构参与的</Select.Option>
              <Select.Option value="partyCreate">机构发布的</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col>
          <Form.Item name="camMethod" label="类型">
            <Radio.Group
              defaultValue="valid"
              buttonStyle="solid"
              onChange={props.onChangeEffective}
              disabled={props.loading}
            >
              <Radio.Button value="valid">有效活动</Radio.Button>
              <Radio.Button value="all">全部活动</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="searchTxt" label="搜索" tooltip="包含名称、标签">
            <Input placeholder="请输入" allowClear />
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
