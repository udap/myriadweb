import React, { useState } from "react";
import md5 from "blueimp-md5";
import { Row, Col, Form, Input, Button, Space, message, Card } from "antd";
import { UserOutlined, LockOutlined, KeyOutlined } from "@ant-design/icons";

import "./index.less";
import "@css/common.less";
import {
  reqVerify,
  reqLoginByPassword,
  reqLogin,
  reqGetAccounts,
  reqNewAddOrg,
} from "@api";
import storageUtils from "@utils/storageUtils";
import comEvents from "@utils/comEvents";
import { ModalResult, RegistrarOrg } from "./components";

const Login = (props) => {
  const timeInit = 60;
  const [isPwd, setIsPwd] = useState(true);
  const [cellphone, setCellphone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [unableClick, setUnableClick] = useState(false);
  const [time, setTime] = useState(timeInit);
  const [visible, setVisible] = useState(false);
  const [resultData, setResultData] = useState({});
  const [registrarVisible, setRegistrarVisible] = useState(false);
  const [registrarLoading, setRegistrarLoading] = useState(false);

  const enterIconLoading = async (value) => {
    if (!value) {
      message.error("请输入手机号码！");
      return false;
    }

    setLoading(true);
    const result = await reqVerify(value);
    if (result.data.retcode === 0) {
      setLoading(false);
      setUnableClick(true);
      // 倒计时
      const active = setInterval(() => {
        setTime((preSecond) => {
          if (preSecond <= 1) {
            setUnableClick(false);
            clearInterval(active);
            // 重置秒数
            return timeInit;
          }
          return preSecond - 1;
        });
      }, 1000);
    }
  };

  const showLoginByCellphone = () => {
    setIsPwd(!isPwd);
  };

  const onFieldsChange = (changedValues, allValues) => {
    if (changedValues.length !== 0) {
      const name = changedValues[0].name[0];
      const value = changedValues[0].value;
      switch (name) {
        case "cellphone":
          setCellphone(value);
          break;
        case "password":
          setPassword(value);
          break;
        case "verificationCode":
          setVerificationCode(value);
          break;

        default:
          break;
      }
    }
  };

  const validation = (elements = {}) => {
    let msg = "";
    if (!elements.orgUid) {
      msg = "您尚未加入任何机构。请联系您的机构管理员或注册您的机构。";
    }
    if (elements.orgUid && elements.orgStatus === "NEW") {
      msg = "您新注册的机构正在等待审批，请耐心等候。预计审批时间1个工作日";
    }
    if (elements.employmentStatus) {
      if (
        elements.employmentStatus === "NEW" &&
        elements.orgStatus === "ACTIVE"
      ) {
        msg = "您的员工账号尚未生效，请联系您的机构管理员";
      } else if (
        elements.employmentStatus === "SUSPENDED" &&
        elements.orgStatus === "ACTIVE"
      ) {
        msg = "您的账号暂时被冻结，请联系您的机构管理员";
      }
    }
    return msg;
  };

  // 获取用户信息
  const getList = async () => {
    const result = await reqGetAccounts();
    setLoginLoading(false);
    //请求成功
    if (result && result.data.retcode === 0) {
      const data = { ...result.data.content, guid: comEvents.guid() };
      storageUtils.saveUser(data); //保存到localStorage中

      /**
       * 等录后要立即检测1/有没有机构 2/是不是机构的“在职”员工(Active）
       * 如果状态是NEW，提示“您的员工账号尚未生效，请联系机构管理员激活账号”；
       * 如果状态是SUSPENDED，显示“您的账号暂时被冻结，请联系您的机构管理员激活账号”；
       * 如果账号没有关联机构或者状态为TERMINATED，就回到：”您尚未加入机构，请联系您的机构管理员或注册机构“页面
       * employmentStatus NEW, ACTIVE, SUSPENDED, TERMINATED;
       *
       * 没有机构 => 您尚未加入任何机构。请联系您的机构管理员或注册您的机构。
       * 有机构 机构状态是NEW => 您新注册的机构正在等待审批，请耐心等候。预计审批时间1个工作日
       * 有机构 并且机构状态是ACTIVE，员工状态NEW => 您的员工账号尚未生效，请联系您的机构管理员
       * 有机构 并且机构状态是ACTIVE，员工状态SUSPENDED => 您的账号暂时被冻结，请联系您的机构管理员
       *
       * 有机构 其它状态 => dashboard
       */

      if (
        data &&
        data.orgUid &&
        data.orgStatus === "ACTIVE" &&
        data.employmentStatus === "ACTIVE"
      ) {
        props.history.replace("./admin/dashboard");
      } else {
        setVisible(true);
        const valid = await validation(data);
        setResultData({
          ...data,
          valid,
          status: "success",
          title: "",
        });
      }
    }
  };

  const onFinish = async (values) => {
    if (!unableClick && !isPwd) {
      message.error("请先获取验证码！");
      return;
    }

    let result;
    setLoginLoading(true);
    if (isPwd) {
      let params = {
        username: values.cellphone,
        password: md5(values.password),
      };
      result = await reqLoginByPassword(params);
    } else {
      result = await reqLogin(values);
    }
    //登录成功
    if (result.data && result.data.retcode === 0) {
      const token =
        result.headers["x-access-token"] || result.headers["X-ACCESS-TOKEN"];
      //保存token
      storageUtils.saveToken(token); //保存到localStorage中
      //获取用户信息
      getList();
    } else {
      setLoginLoading(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    window.location.reload();
  };

  const handleRegistrar = () => {
    setRegistrarVisible(true);
    setVisible(false);
  };

  const onClose = () => {
    setRegistrarVisible(false);
    window.location.reload();
  };

  const getRegistrar = async (values) => {
    const {
      fullName,
      name,
      phone,
      street,
      residence,
      upCode,
      licenseNo,
    } = values;
    let params = {
      fullName,
      name,
      phone,
      street,
      province: residence[0],
      city: residence[1],
      district: residence[2],
      upCode,
      licenseNo,
    };
    const paramsEdit = comEvents.removeProperty({ ...params });
    setRegistrarLoading(true);
    const result = await reqNewAddOrg(paramsEdit);
    setRegistrarLoading(false);
    if (
      result &&
      result.data &&
      result.data.content &&
      result.data.content.status === "NEW"
    ) {
      setResultData({
        status: "success",
        title: "机构注册成功",
        valid: "您已成功提交机构注册，请耐心等待审批！",
        merchantAuthCode: result.data.content.merchantAuthCode,
        // 注册机构时，后端未返回，兼容Result
        orgUid: result.data.content.merchantAuthCode,
      });
      setRegistrarVisible(false);
      setVisible(true);
    }
  };

  return (
    <>
      <div className="loginContent">
        <Card className="login">
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{
              cellphone,
              verificationCode,
            }}
            onFinish={onFinish}
            onFieldsChange={onFieldsChange}
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
                value={cellphone}
                allowClear
                disabled={unableClick}
              />
            </Form.Item>
            {isPwd ? (
              <Form.Item
                type="password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "请输入密码!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<KeyOutlined className="site-form-item-icon" />}
                  placeholder="请输入密码"
                  name="password"
                  value={password}
                />
              </Form.Item>
            ) : (
              <Form.Item>
                <Row gutter={8} wrap={false}>
                  <Col flex="auto">
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
                        prefix={
                          <LockOutlined className="site-form-item-icon" />
                        }
                        placeholder="请输入验证码"
                        name="verificationCode"
                        value={verificationCode}
                      />
                    </Form.Item>
                  </Col>
                  <Col flex="none">
                    <Button
                      className="getCodeBtn"
                      type="primary"
                      block
                      loading={loading}
                      onClick={() => enterIconLoading(cellphone)}
                      disabled={unableClick}
                    >
                      {unableClick ? time + "秒后重新获取" : "获取验证码"}
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            )}

            <Form.Item>
              <Button
                block
                type="primary"
                htmlType="submit"
                className="login-form-button"
                loading={loginLoading}
              >
                登录
              </Button>
            </Form.Item>
            <Space className="margin-top right">
              <span
                className="primary-color cursor"
                onClick={showLoginByCellphone}
              >
                {isPwd ? "手机登录" : "密码登录"}
              </span>
            </Space>
          </Form>
        </Card>
      </div>
      {visible ? (
        <ModalResult
          visible={visible}
          onCancel={handleCancel}
          resultData={resultData}
          handleRegistrar={handleRegistrar}
        />
      ) : null}
      {registrarVisible ? (
        <RegistrarOrg
          onClose={onClose}
          visible={registrarVisible}
          onFinish={getRegistrar}
          loading={registrarLoading}
        />
      ) : null}
    </>
  );
};

export default Login;
