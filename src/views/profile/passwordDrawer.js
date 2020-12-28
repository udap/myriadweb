import React, { Component } from "react";
import { Drawer, Form, Input, Button, Row, Col, notification } from "antd";
import md5 from "blueimp-md5";

import defaultValidateMessages from "@utils/comFormErrorAlert";
import { reqGetVerificationCode, reqPutPassword } from "@api";

class PasswordDrawer extends Component {
  constructor() {
    super();
    this.state = {
      iconLoading: false,
      unableClick: false, //不允许再次获取验证码
      number: 60,
      password: "",
      loading: false,
    };
    this.enterIconLoading = this.enterIconLoading.bind(this);
  }

  //获取验证码 倒计时60s
  countdown = () => {
    const { number } = this.state;
    const interval = setInterval(() => {
      //倒计时结束，清空倒计时并恢复初始状态
      if (number === 0) {
        clearInterval(interval);
        this.setState({
          unableClick: false,
          iconLoading: false,
          number: 60,
        });
      }
      this.setState({
        number: number - 1,
      });
    }, 1000);
  };

  enterIconLoading = async () => {
    const result = await reqGetVerificationCode();
    if (result.data.retcode === 0) {
      this.setState({
        iconLoading: true,
        unableClick: true,
      });
      this.countdown();
    }
  };

  onFinish = async (values) => {
    this.setState({ loading: true });
    let params = {
      password: md5(values.password),
      verificationCode: values.verificationCode,
    };

    const result = await reqPutPassword(params);
    this.setState({ loading: false });
    if (result.data.retcode === 0) {
      notification.success({ message: "更新成功" });
      this.backIndex();
    }
  };

  //返回上一页
  backIndex = () => {
    this.props.onClose();
  };

  render() {
    const {
      password,
      verificationCode,
      iconLoading,
      unableClick,
      number,
      loading,
    } = this.state;
    let { visible, selectedAccount } = this.props;
    return (
      <Drawer
        width={480}
        title="密码设置"
        visible={visible}
        onClose={this.props.onClose}
        footer={null}
      >
        <Form
          name="basic"
          layout="vertical"
          initialValues={{
            password: password,
            cellphone: selectedAccount.cellphone,
          }}
          onFinish={this.onFinish}
          validateMessages={defaultValidateMessages.defaultValidateMessages}
        >
          <Form.Item
            label="手机号码"
            name="cellphone"
            rules={[{ required: true }, { max: 11 }]}
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            name="verificationCode"
            label="验证码"
            type="number"
            rules={[
              {
                required: true,
              },
              {
                len: 6,
              },
            ]}
          >
            <Row gutter={8}>
              <Col span={14}>
                <Input
                  placeholder="请输入验证码"
                  name="verificationCode"
                  value={verificationCode}
                />
              </Col>
              <Col span={10}>
                <Button
                  className="getCodeBtn"
                  type="primary"
                  block
                  loading={iconLoading}
                  onClick={this.enterIconLoading}
                  disabled={unableClick}
                >
                  <span className="btnText">
                    {unableClick ? number + "秒" : "验证码"}
                  </span>
                </Button>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true }, { max: 32 }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    );
  }
}

export default PasswordDrawer;
