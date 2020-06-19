import React, { Component } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  notification,
} from "antd";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import {
  reqGetVerificationCode, //获取验证码
  reqPutPassword,
} from "../../api";
import storageUtils from "../../utils/storageUtils";
import md5 from 'blueimp-md5';

const { TextArea } = Input;
const { Option } = Select;
class PasswordDrawer extends Component {
  state = {
    isNew: true,
    iconLoading: false,
    unableClick: false, //不允许再次获取验证码
    number: 60,
    selectedAccount: this.props.selectedAccount,
    cellphone: "",
    password: "",
  };

  componentDidMount() {
    this.setState({
      isNew: this.props.isNew,
      cellphone: this.props.selectedAccount.loginId,
    });
  }
  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  //获取验证码 倒计时60s
  countdown = () => {
    const intetval = setInterval(() => {
      //倒计时结束，清空倒计时并恢复初始状态
      if (this.state.number === 0) {
        clearInterval(intetval);
        this.setState({
          unableClick: false,
          iconLoading: false,
          number: 60,
        });
      }
      this.setState({
        number: this.state.number - 1,
      });
    }, 1000);
  };
  enterIconLoading = async (value) => {
    if (!value) {
      notification.error({ message: "请输入手机号码！" });
      return false;
    }
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
    this.setState({
      loading: true,
    });
    let params = {
      password: md5(values.password),
      verificationCode: values.verificationCode,
    };

    const result = await reqPutPassword(params);
    this.setState({
      loading: false,
    });
    if (result.data.retcode === 0) {
      notification.success({ message: "更新成功" });
      this.backIndex();
    }
  };
  //返回上一页
  backIndex = () => {
    this.props.onClose();
  };
  onValuesChange = (changedValues, allValues) => {
    for (let key in changedValues) {
      if (key === "cellphone") {
        this.setState({
          cellphone: changedValues[key],
        });
      }
    }
  };
  render() {
    const { cellphone, password } = this.state;
    let { isNew, visible } = this.props;
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
            cellphone: cellphone,
          }}
          onFinish={this.onFinish}
          onValuesChange={this.onValuesChange}
          validateMessages={defaultValidateMessages.defaultValidateMessages}
        >
          <Form.Item
            label="手机号码"
            name="cellphone"
            rules={[{ required: true }, { max: 11 }]}
          >
            <Input disabled={true} value={this.state.cellphone} />
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
                  value={this.state.verificationCode}
                />
              </Col>
              <Col span={10}>
                <Button
                  className="getCodeBtn"
                  type="primary"
                  block
                  loading={this.state.iconLoading}
                  onClick={this.enterIconLoading.bind(
                    this,
                    this.state.cellphone
                  )}
                  disabled={this.state.unableClick}
                >
                  <span className="btnText">
                    {this.state.unableClick
                      ? this.state.number + "秒"
                      : "验证码"}
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
            <Button
              type="primary"
              htmlType="submit"
              loading={this.state.loading}
            >
              提交
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    );
  }
}

export default PasswordDrawer;
