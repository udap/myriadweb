import React from "react";
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
      onFinish={props.onSubmit}
      layout="horizontal"
      name="advanced_search"
      className="ant-advanced-search-form"
      initialValues={{
        searchTxt: "",
        group: "owner",
      }}
    >
      <Row>
        <Col>
          <Form.Item name="group" label="查询条件">
            <Radio.Group onChange={props.onChangeCategory}>
              <Radio value="owner">我的</Radio>
              <Radio value="organization">机构</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="searchTxt">
            <Input
              placeholder="请输入活动名、标签或员工号进行搜索"
              allowClear
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button
              type="primary"
              className="cursor searchBtn"
              htmlType="submit"
              loading={props.loading}
              onClick={props.onLoad}
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