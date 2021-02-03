import React from "react";
import { Drawer, Form, Button, InputNumber } from "antd";

import "@css/common.less";

const IssueForm = (props) => {
  const validator = (rule, value, callback) => {
    // 正整数正则
    const positiveInteger = /^\+?[1-9][0-9]*$/;
    if (!positiveInteger.test(value)) {
      callback("请输入为正整数的增发数量！");
    }

    if (props.data?.totalSupply) {
      if (value > props.data?.totalSupply) {
        callback("请输入小于该活动的发行总数！");
      }
    }

    // 必须总是返回一个 callback，否则 validateFields 无法响应
    callback();
  };
  return (
    <Drawer
      width={480}
      title={"增发"}
      visible={props.visible}
      onClose={props.onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        name="issueForm"
        layout="horizontal"
        initialValues={{
          amount: props.data?.totalSupply ?? 100,
        }}
        onFinish={props.onSubmit}
      >
        <Form.Item label="增发数量" name="amount" rules={[{ validator }]}>
          <InputNumber style={{ width: "50%" }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={props.loading}>
            提交
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default IssueForm;
