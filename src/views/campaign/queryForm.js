import React, { Component } from "react";
import {
  Form,
  Row,
  Col,
  Radio,
  Button,
  Input,
} from "antd";
import "../../css/common.less";

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
    <Row>
      <Col>
        <Form.Item name="group" label="查询条件">
          <Radio.Group onChange={props.onChangeType}>
            <Radio value="participant">我参与的</Radio>
            <Radio value="party">机构参与的</Radio>
          </Radio.Group>
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item name="searchTxt">
          <Input placeholder="请输入名称或标签进行搜索" allowClear />
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
            搜索
          </Button>
        </Form.Item>
      </Col>
    </Row>
    </Form>
  );
}

export default QueryForm;