import React, { useState } from "react";
import { Drawer, Form, Input, Cascader, Button } from "antd";

import { ChinaRegions } from "@utils/china-regions";

const RegistrarOrg = (props) => {
  const [province, setProvince] = useState("重庆市");
  const [city, setCity] = useState("重庆市");
  const [district, setDistrict] = useState("渝中区");

  const onRegionChange = (value) => {
    setProvince(value[0]);
    setCity(value[1]);
    setDistrict(value[2]);
  };

  return (
    <Drawer
      className="camDetail"
      width={480}
      title="注册机构"
      onClose={props.onClose}
      visible={props.visible}
    >
      <Form
        className="orgForm"
        layout="vertical"
        name="basic"
        initialValues={{
          fullName: "",
          name: "",
          residence: [province, city, district],
          phone: "",
          street: "",
          licenseNo: "",
          upCode: "",
        }}
        onFinish={props.onFinish}
      >
        <Form.Item
          label="机构名称"
          name="fullName"
          rules={[{ required: true, message: "请输入机构名称!" }, { max: 45 }]}
        >
          <Input placeholder="请输入机构名称" />
        </Form.Item>
        <Form.Item
          label="机构简称"
          name="name"
          rules={[{ required: true, message: "请输入机构简称!" }, { max: 20 }]}
        >
          <Input placeholder="请输入机构简称" />
        </Form.Item>
        <Form.Item
          label="联系电话"
          name="phone"
          rules={[
            {
              required: true,
              message: "请输入联系电话!",
            },
            {
              len: 11,
              message: "请输入11位手机号码!",
            },
          ]}
        >
          <Input placeholder="请输入联系电话" />
        </Form.Item>
        <Form.Item
          name="residence"
          label="地区"
          rules={[
            {
              type: "array",
              required: true,
              message: "请选择地区!",
            },
          ]}
        >
          <Cascader
            initialvalues={[province, city, district]}
            options={ChinaRegions}
            onChange={onRegionChange}
          />
        </Form.Item>
        <Form.Item
          className="marginBtm"
          label="详细地址"
          name="street"
          rules={[{ required: true, message: "请输入详细地址!" }, { max: 45 }]}
        >
          <Input placeholder="请输入详细地址（例如：**街**号**）" />
        </Form.Item>
        <Form.Item label="营业执照号码" name="licenseNo">
          <Input placeholder="请输入营业执照号码" />
        </Form.Item>
        <Form.Item label="银联商户码" name="upCode">
          <Input placeholder="请输入银联商户码" />
        </Form.Item>
        <Form.Item className="marginBtm">
          <Button
            block
            type="primary"
            htmlType="submit"
            className="login-form-button"
            loading={props.loading}
          >
            注册
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default RegistrarOrg;
