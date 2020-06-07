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
  Cascader,
  Modal,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import "./index.less";
import { reqLogin, reqVerify, reqGetAccounts, reqAddOrg } from "../../api";
import { ChinaRegions } from "../../utils/china-regions";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import storageUtils from "../../utils/storageUtils";
import { Redirect } from "react-router-dom";
import linkBtn from "../../components/linkBtn";
import "../../css/common.less";
const { Text } = Typography;
const layout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
    lg: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
    lg: { span: 12 },
  },
};
const tailLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
    lg: {
      span: 12,
      offset: 6,
    },
  },
};
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
      //显示注册机构
      showRegOrg: false,
      fullName: "",
      name: "",
      phone: "",
      licenseNo: "",
      postalCode: "",
      street: "",
      province: "重庆市",
      city: "重庆市",
      district: "渝中区",
      parentOrgUid: "",
      upCode: "",
      orgVerifyCode: "",
    };
  }
  componentDidMount() {
    
  }
  /*获取用户信息*/
  getList = async () => {
    const result = await reqGetAccounts();
    //请求成功
    if (result && result.data.retcode === 0) {
      const data = result.data.content;
      storageUtils.saveUser(data); //保存到localStorage中
      //等录后要立即检测1/有没有机构 2/是不是机构的“在职”员工(Active），
      //如果状态是NEW，提示“您的员工账号尚未生效，请联系机构管理员激活账号”；
      //如果状态是SUSPENDED，显示“您的账号暂时被冻结，请联系您的机构管理员激活账号”；
      //如果账号没有关联机构或者状态为TERMINATED，就回到：”您尚未加入机构，请联系您的机构管理员或注册机构“页面
      //employmentStatus NEW, ACTIVE, SUSPENDED, TERMINATED;

      //没有机构-》您尚未加入任何机构。请联系您的机构管理员或注册您的机构。
      //有机构 机构状态是NEW=> 您新注册的机构正在等待审批，请耐心等候。预计审批时间1个工作日
      //有机构 并且机构状态是ACTIVE，员工状态NEW =》您的员工账号尚未生效，请联系您的机构管理员
      //有机构 并且机构状态是ACTIVE，员工状态SUSPENDED =》您的账号暂时被冻结，请联系您的机构管理员
      //有机构 其它状态 =》dashboard

      if (data && !data.orgUid) {
        notification.info({
          message: "您尚未加入任何机构。请联系您的机构管理员或注册您的机构。",
        });
        return false;
      }
      if (data && data.orgUid && data.orgStatus === "NEW") {
        notification.info({
          message:
            "您新注册的机构正在等待审批，请耐心等候。预计审批时间1个工作日",
        });
        return false;
      }
      if (data && data.employmentStatus) {
        if (data.employmentStatus === "NEW" && data.orgStatus === "ACTIVE") {
          notification.info({
            message: "您的员工账号尚未生效，请联系您的机构管理员",
          });
        } else if (
          data.employmentStatus === "SUSPENDED" &&
          data.orgStatus === "ACTIVE"
        ) {
          notification.info({
            message: "您的账号暂时被冻结，请联系您的机构管理员",
          });
        } else {
          this.props.history.replace("./admin/dashboard");
        }
      }
    }
  };
  //async await 以同步编码方式实现promise的异步流程
  onFinish = async (values) => {
    const result = await reqLogin(values);
    //登录成功
    if (result.data.retcode === 0) {
      //登录成功 保存用户信息到相应位置
      const user = result.data.content;
      const token =
        result.headers["x-access-token"] || result.headers["X-ACCESS-TOKEN"];
      //storageUtils.saveUser(user); //保存到localStorage中
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
  enterIconLoading = (value) => {
    if (!value) {
      message.error("请输入手机号码！");
      return false;
    }
    const result = reqVerify(value).then((res) => {
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
  renderLoginForm = () => {
    return (
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{
          cellphone: this.state.cellphone,
          verificationCode: this.state.verificationCode,
        }}
        onFinish={this.onFinish}
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
                onClick={this.enterIconLoading.bind(this, this.state.cellphone)}
                disabled={this.state.unableClick}
              >
                <span className="btnText">
                  {this.state.unableClick ? this.state.number + "秒" : "验证码"}
                </span>
              </Button>
            </Col>
          </Row>
        </Form.Item>

        {/* {this.state.showRegOrg ? this.regOrgForm() : null} */}
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
        </Form.Item>
        <div className="margin-top text-right">
          <a className="cursor" onClick={this.showRegOrg}>
            注册机构
          </a>
        </div>
      </Form>
    );
  };
  //登录表单
  loginForm = () => {
    return (
      <Card className="login">
        {this.state.showRegOrg ? this.regOrgForm() : this.renderLoginForm()}
      </Card>
    );
  };
  //显示注册机构
  showRegOrg = () => {
    this.setState({
      showRegOrg: true,
    });
  };
  hideRegOrg = () => {
    this.setState({
      showRegOrg: false,
    });
  };
  getLogin = async (values) => {
    //调用登录注册页面
    const result = await reqLogin({
      cellphone: values.cellphone,
      verificationCode: values.verificationCode,
    });
    if (result.data.retcode === 0) {
      const user = result.data.content;
      const token =
        result.headers["x-access-token"] || result.headers["X-ACCESS-TOKEN"];
      storageUtils.saveUser(user); //保存到localStorage中
      //保存token
      storageUtils.saveToken(token); //保存到localStorage中
      this.onOrgFinish(values);
    }
  };
  //注册机构表单
  onOrgFinish = async (values) => {
    this.setState({
      inited: false,
    });
    let that = this;
    let params = {
      fullName: values.fullName,
      name: values.name,
      phone: values.phone,
      licenseNo: values.licenseNo,
      postalCode: values.postalCode,
      street: values.street,
      province: values.residence[0],
      city: values.residence[1],
      district: values.residence[2],
      parentOrgUid: "",
      upCode: values.upCode,
      //verificationCode: this.state.verificationCode,
    };
    const result = await reqAddOrg(params);
    if (
      result &&
      result.data &&
      result.data.content &&
      result.data.content.status === "NEW"
    ) {
      notification.info({
        message: "您已成功提交机构注册，请耐心等待审批！",
      });
      this.hideRegOrg();
    }
    //返回登陆页
    //this.props.history.replace("./admin/dashboard");
    // this.props.onClose(true, uid);
  };

  onRegionChange = (value) => {
    console.log(value);
    this.setState({
      province: value[0],
      city: value[1],
      district: value[2],
    });
  };

  regOrgForm = () => {
    const {
      cellphone,
      verificationCode,
      province,
      city,
      district,
      fullName,
      name,
      licenseNo,
      phone,
      postalCode,
      street,
      address,
      upCode,
    } = this.state;
    return (
      <Form
        //{...layout}
        className="orgForm"
        layout="vertical"
        name="basic"
        initialValues={{
          cellphone: cellphone,
          verificationCode: verificationCode,
          residence: [province, city, district],
          fullName: fullName,
          name: name,
          licenseNo: licenseNo,
          phone: phone,
          postalCode: postalCode,
          street: street,
          address: address,
          upCode: upCode,
        }}
        onFinish={this.getLogin}
        onFieldsChange={this.onFieldsChange}
        //validateMessages={defaultValidateMessages.defaultValidateMessages}
      >
        <Form.Item
          className="marginBtm"
          name="cellphone"
          //label="手机号码"
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
        <Form.Item
          name="verificationCode"
          //label="验证码"
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
          <Row gutter={8}>
            <Col span={14}>
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
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
                icon={<PoweroffOutlined />}
                loading={this.state.iconLoading}
                onClick={this.enterIconLoading.bind(this, this.state.cellphone)}
                disabled={this.state.unableClick}
              >
                <span className="btnText">
                  {this.state.unableClick ? this.state.number + "秒" : "验证码"}
                </span>
              </Button>
            </Col>
          </Row>
        </Form.Item>
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
        {/* <Form.Item label="营业执照号码" name="licenseNo">
          <Input placeholder="请输入营业执照号码" />
        </Form.Item>
        <Form.Item label="银联商户码" name="upCode">
          <Input placeholder="请输入银联商户码" />
        </Form.Item> */}
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
            defaultValue={[province, city, district]}
            options={ChinaRegions}
            onChange={this.onRegionChange}
            //placeholder="请选择地区"
          />
        </Form.Item>
        <Form.Item
          className="marginBtm"
          label="详细地址"
          name="street"
          rules={[{ required: true, message: "请输入详细地址!" }, { max: 45 }]}
        >
          <Input placeholder="请输入详细地址" />
        </Form.Item>
        {/* <Form.Item
          className="marginBtm"
          label="邮政编码"
          name="postalCode"
          rules={[{ max: 6 }]}
        >
          <Input placeholder="请输入邮政编码" />
        </Form.Item> */}
        <Form.Item className="marginBtm">
          <Button
            block
            type="primary"
            htmlType="submit"
            className="login-form-button"
            // loading={this.state.loading}
          >
            注册
          </Button>
          <div className="margin-top text-right">
            <a className="cursor" onClick={this.hideRegOrg}>
              取消
            </a>
          </div>
        </Form.Item>
      </Form>
    );
  };

  render() {
    //自动登录
    // const user = storageUtils.getUser();
    // const token = storageUtils.getToken();
    // if (user && token) {
    //   return <Redirect to="/admin/dashboard" />;
    // }

    return <div className="loginContent">{this.loginForm()}</div>;
  }
}

export default Login;
