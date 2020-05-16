import React, { Component } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  message,
  notification,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import "./index.less";
import { reqLogin, reqVerify, reqGetAccounts } from "../../api";
import storageUtils from "../../utils/storageUtils";
import { Redirect } from "react-router-dom";

const { Text } = Typography;

//登录的路由组件
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cellphone: "",
      verificationCode: "",
      veryCode: "",
      loading: false,
      iconLoading: false,
      unableClick: false, //不允许再次获取验证码
      number: 60,
    };
  }
  componentDidMount() {
    // ctrl + alt + l 选中变量之后，使用这个快捷键生成 console.log
    // alt + shift + c 注释所有 console.log
    // alt + shift + u 启用所有 console.log
    // alt + shift + d 删除所有 console.reqLogin
  }
  /*获取用户信息*/
  getList = async () => {
    const result = await reqGetAccounts();
    console.log("Login -> getList -> result", result);
    //请求成功
    if (result && result.data.retcode === 0) {
      const data = result.data.content;
      storageUtils.saveUser(data); //保存到localStorage中
      //等录后要立即检测1/有没有机构 2/是不是机构的“在职”员工(Active），
      //如果状态是NEW，提示“您的员工账号尚未生效，请联系机构管理员激活账号”；
      //如果状态是SUSPENDED，显示“您的账号暂时被冻结，请联系您的机构管理员激活账号”；
      //如果账号没有关联机构或者状态为TERMINATED，就回到：”您尚未加入机构，请联系您的机构管理员或注册机构“页面
      //employmentStatus NEW, ACTIVE, SUSPENDED, TERMINATED;
      if (data && !data.orgUid) {
        this.props.history.replace("./admin/dashboard");
        return false;
      }
      if (data && data.employmentStatus) {
        if (data.employmentStatus === "NEW") {
          notification.info({
            message: "您的员工账号尚未生效，请联系机构管理员激活账号",
          });
        } else if (data.employmentStatus === "SUSPENDED") {
          notification.info({
            message: "您的账号暂时被冻结，请联系您的机构管理员激活账号",
          });
        }else {
          this.props.history.replace("./admin/dashboard");
        }
      }
    }
  };
  //async await 以同步编码方式实现promise的异步流程
  onFinish = async (values) => {
    const result = await reqLogin(values);
    //登录失败
    if (result.data.retcode === 0) {
      //登录成功 保存用户信息到相应位置
      const user = result.data.content;
      const token =
        result.headers["x-access-token"] || result.headers["X-ACCESS-TOKEN"];
      storageUtils.saveUser(user); //保存到localStorage中
      //保存token
      storageUtils.saveToken(token); //保存到localStorage中
      //获取用户信息
      this.getList();
      return false;
      //跳转到仪表盘页面 不需要回退 用replace  （goback||push[可回退到当前页面]）
      // this.props.history.replace("./admin/dashboard");
      // notification.success({
      //   message: "登录成功！",
      // });
    }
  };

  onFinishFailed = (errorInfo) => {
    //message.error(errorInfo)
  };

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
  enterIconLoading = () => {
    if (!this.state.cellphone) {
      message.error("请输入手机号码！");
      return false;
    }
    const result = reqVerify(this.state.cellphone).then((res) => {
      this.setState({
        iconLoading: true,
        veryCode: result,
        unableClick: true,
      });

      this.countdown();
    });
  };

  //更新表单数据
  onFieldsChange = (changedValues, allValues) => {
    if (changedValues.length !== 0) {
      let name = changedValues[0]["name"][0];
      let value = changedValues[0].value;
      this.setState({
        [name]: value,
      });
    }
  };

  render() {
    //自动登录
    // const user = storageUtils.getUser();
    // const token = storageUtils.getToken();
    // if (user && token) {
    //   return <Redirect to="/admin/dashboard" />;
    // }

    return (
      <div className="loginContent">
        <Card className="login">
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{
              cellphone: this.state.cellphone,
              verificationCode: this.state.verificationCode,
            }}
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            onFieldsChange={this.onFieldsChange}
          >
            <Form.Item
              name="cellphone"
              rules={[
                {
                  required: true,
                  message: "请输入手机号码!",
                },
                {
                  len: 11,
                  message: "请输入11位手机号码!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="请输入手机号"
                name="cellphone"
                value={this.state.cellphone}
              />
            </Form.Item>
            <Form.Item>
              <Row gutter={8}>
                <Col span={14}>
                  <Form.Item
                    name="verificationCode"
                    noStyle
                    type="number"
                    rules={[
                      {
                        required: true,
                        message: "请输入验证码!",
                      },
                      {
                        len: 6,
                        message: "验证码只能是6位数字!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      placeholder="请输入验证码"
                      name="verificationCode"
                      value={this.state.verificationCode}
                    />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Button
                    className="getCodeBtn"
                    type="primary"
                    block
                    icon={<PoweroffOutlined />}
                    loading={this.state.iconLoading}
                    onClick={this.enterIconLoading}
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
            <Form.Item>
              <Button
                block
                type="primary"
                htmlType="submit"
                className="login-form-button"
                // loading={this.state.loading}
                onClick={this.enterLoading}
              >
                登录
              </Button>
              <Text type="secondary">
                若您输入的手机号未注册, 将为您直接注册!
              </Text>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }
}

export default Login;
