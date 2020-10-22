import React from "react";
import { Button, Form, Input, InputNumber } from "antd";
import storageUtils from "../../../../utils/storageUtils";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

export default (props) => {
  const [loading, setLoading] = React.useState(false);
  const [form] = Form.useForm();

  const onFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <Form
      {...layout}
      form={form}
      initialValues={{
        productPrice: 0,
      }}
      onFinish={onFinish}
    >
      <Form.Item
        label="礼品券名称"
        name="giftName"
        rules={[{ required: true, message: "请输入礼品券名称!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="供应商名称">
        <span>{storageUtils.getUser().orgName}</span>
        <Button type="link">选择供应商</Button>
      </Form.Item>
      <Form.Item
        label="商品名称"
        name="productName"
        rules={[{ required: true, message: "请输入商品名称!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="SKU"
        name="sku"
        rules={[{ required: true, message: "请输入SKU!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="商品市场零售价(元)"
        name="productMarketPrice"
        rules={[{ required: true, message: "请输入商品市场零售价!" }]}
      >
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item
        label="商品换购价格(元)"
        name="productPrice"
        rules={[{ required: true, message: "请输入商品换购价格!" }]}
      >
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
