import React from "react";
import { Form, Row, Col, Radio, Button, Input } from "antd";
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
      <Row gutter={[16, 16]}>
        <Col>
          <Form.Item name="group" label="查询条件">
            <Radio.Group
              defaultValue="participant"
              onChange={props.onChangeType}
              buttonStyle="solid"
            >
              <Radio.Button value="participant">我参与的</Radio.Button>
              <Radio.Button value="party">机构参与的</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col>
          <Radio.Group
            defaultValue="valid"
            buttonStyle="solid"
            onChange={props.onChangeEffective}
          >
            <Radio.Button value="valid">有效活动</Radio.Button>
            <Radio.Button value="all">全部活动</Radio.Button>
          </Radio.Group>
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
};

export default QueryForm;
