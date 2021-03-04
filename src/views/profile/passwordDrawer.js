import React, { Component } from "react";
import { Drawer, Form, Input, Button, Row, Col, notification } from "antd";
import md5 from "blueimp-md5";

import defaultValidateMessages from "@utils/comFormErrorAlert";
import { reqGetVerificationCode, reqPutPassword } from "@api";
import { pwdReg } from "@utils/constants";

class PasswordDrawer extends Component {
  constructor() {
    super();
    this.state = {
      iconLoading: false,
      number: 60,
      password: "",
      loading: false,
    };
    this.enterIconLoading = this.enterIconLoading.bind(this);
  }

  //获取验证码 倒计时60s
  countdown = () => {
    const interval = setInterval(() => {
      const { number } = this.state;

      //倒计时结束，清空倒计时并恢复初始状态
      if (number === 0) {
        clearInterval(interval);
        this.setState({
          iconLoading: false,
          number: 60,
        });
      }

      this.setState({ number: number - 1 });
    }, 1000);
  };

  enterIconLoading = async () => {
    const result = await reqGetVerificationCode();
    if (result.data?.retcode === 0) {
      this.setState({ iconLoading: true });
      this.countdown();
    }
  };

  onFinish = async (values) => {
    const { iconLoading } = this.state;
    if (!iconLoading) {
      notification.error({
        message: "密码设置失败",
        description: "请先获取验证码！",
      });
      return;
    }

    this.setState({ loading: true });
    try {
      let params = {
        password: md5(values.password),
        verificationCode: values.verificationCode,
      };

      const result = await reqPutPassword(params);
      if (result.data.retcode === 0) {
        notification.success({ message: "更新成功" });
        this.backIndex();
      }
    } catch (error) {}
    this.setState({ loading: false });
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
      number,
      loading,
    } = this.state;
    const { visible, selectedAccount, onClose } = this.props;
    return (
      <Drawer
        width={480}
        title="密码设置"
        visible={visible}
        onClose={onClose}
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
            rules={[{ required: true }]}
          >
            <Row gutter={8}>
              <Col span={16}>
                <Input
                  placeholder="请输入验证码"
                  name="verificationCode"
                  value={verificationCode}
                  maxLength={6}
                  allowClear
                />
              </Col>
              <Col span={8}>
                <Button
                  className="getCodeBtn"
                  type="primary"
                  block
                  loading={iconLoading}
                  onClick={this.enterIconLoading}
                  disabled={iconLoading}
                >
                  <span>{iconLoading ? number + "秒" : "获取验证码"}</span>
                </Button>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: "请输入新的密码" },
              {
                validator(_, value) {
                  if (value) {
                    if (!pwdReg.test(value)) {
                      return Promise.reject(
                        new Error(
                          "密码必须是8-18位英文字母(包含大小写）、数字、字符的组合"
                        )
                      );
                    }
                  }

                  return Promise.resolve();
                },
              },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="请输入新的密码" allowClear />
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
