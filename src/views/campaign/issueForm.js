import React from "react";
import {
  Drawer,
  Form,
  Button,
  InputNumber,
} from "antd";
import "../../css/common.less";

const IssueForm = (props) => {
  return (
  <Drawer
    width={480}
    title={"增发"}
    visible={props.visible}
    onClose={props.onClose}
    footer={null}
  >
    <Form
      name="issueForm"
      layout="horizontal"
      initialValues={{
        amount: 100,
      }}
      onFinish={props.onSubmit}
    >
      <Form.Item
        label="增发数量"
        name="amount"
        rules={[{ required: true }]}
      >
        <InputNumber min={1} max={10000} />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
        >
          提交
        </Button>
      </Form.Item>
    </Form>
  </Drawer>
  ) 
}

export default IssueForm;