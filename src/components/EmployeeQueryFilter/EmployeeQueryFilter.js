import React from "react";
import { Form, Row, Col, Radio, Input, Button } from "antd";

const QueryFilter = (props) => {
  return (
    <Form
      onFinish={props.onFinish}
      layout="horizontal"
      initialValues={{
        searchTxt: "",
        includingSubsidiaries: props.includingSubsidiaries,
      }}
    >
      <Row gutter={[16, 16]}>
        <Col>
          <Form.Item name="includingSubsidiaries" label="下属机构员工">
            <Radio.Group onChange={props.onChange} buttonStyle="solid">
              <Radio.Button value={true}>包含</Radio.Button>
              <Radio.Button value={false}>不包含</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="searchTxt"
            label="搜索"
            tooltip="根据员工的姓名、手机号、编码或登录账号搜索"
          >
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
