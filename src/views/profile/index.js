import React, { Component } from "react";
import {
  PageHeader,
  Row,
  Col,
  notification,
  Drawer,
  Card,
  Descriptions,
  //注册账户
  Form,
  Input,
  Button,
  Modal,
} from "antd";
import { Loading } from "../../components";
import { withRouter } from "react-router-dom";
import storageUtils from "../../utils/storageUtils";
import {
  reqGetAccountProfile,
  reqPutAccountProfile,
  reqGetWeChatState,
} from "../../api";
import { EyeOutlined, PictureOutlined, EditOutlined } from "@ant-design/icons";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import { employeeStatuses, roleTypes } from "../../utils/constants";
import { host } from "../../utils/config";
import "./index.less";
import "../../css/common.less";
import PasswordDrawer from "./passwordDrawer";

const { Meta } = Card;

@withRouter
class Profile extends Component {
  state = {
    inited: false,
    account: {},
    //账户详情
    showView: false,
    //账户编辑
    showEdit: false,
    //wechat
    wxstate: null,
    url: null,
    showwx: false,
    currenturl: "",
    showPassword: false,
  };

  componentDidMount() {
    //let redurl = "https://www.baidu.com";
    let redurl = "https://myriad-test.xinongtech.com/#/admin/profile";
    //document.location.href;
    //let redurl = "http://localhost:3000/#/admin/profile"//document.location.href;
    console.log("Profile -> componentDidMount -> redurl", redurl);
    this.setState({
      currenturl: encodeURIComponent(redurl),
    });
    this.reqGetWeChatState();
    this.reqGetAccounts();
  }
  //获取微信state
  reqGetWeChatState = async () => {
    const result = await reqGetWeChatState();
    console.log("Profile -> reqGetWeChatState -> result", result);
    this.setState({
      wxstate: result.data.content,
    });
  };

  //获取当前账户信息
  reqGetAccounts = async (newOrg) => {
    const result = await reqGetAccountProfile();
    const cont = result && result.data ? result.data.content : null;
    this.setState({
      inited: true,
      account: cont,
    });
  };

  //关闭抽屉
  onClose = () => {
    this.setState({
      visible: false,
      showEdit: false,
      showView: false,
      showwx: false,
      showPassword: false,
    });
  };
  showEditHandle = () => {
    this.setState({
      showEdit: true,
    });
  };
  //账户卡片信息
  renderAccountCard = () => {
    const { name, cellphone, organization } = this.state.account;
    return (
      <div>
        <Card
          style={{ width: 300 }}
          cover={<PictureOutlined className="defaultGraph" />}
          actions={[
            <EyeOutlined
              key="view"
              className="ant-green-link"
              onClick={() => {
                this.setState({
                  showView: true,
                });
              }}
            />,
            <EditOutlined
              key="edit"
              className="ant-green-link"
              onClick={() => {
                this.showEditHandle();
              }}
            />,
          ]}
        >
          <Meta className="orgTitle" title={name} />
          <p>{organization.name}</p>
          <p style={{ marginBottom: 0 }}>{cellphone}</p>
        </Card>
      </div>
    );
  };
  //账户详情
  renderProfileDetailDrawer = () => {
    const {
      name,
      admin,
      cellphone,
      code,
      organization,
      groups,
      role,
      status,
      desc,
    } = this.state.account;

    return (
      <div>
        <Drawer
          width={400}
          title="账户详情"
          onClose={this.onClose}
          visible={this.state.showView}
        >
          <Row>
            <Col span={24}>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="姓名">{name}</Descriptions.Item>
                <Descriptions.Item label="手机号">
                  {cellphone}
                </Descriptions.Item>
                <Descriptions.Item label="员工编码">{code}</Descriptions.Item>
                <Descriptions.Item label="是否管理员">
                  {admin ? "是" : "否"}
                </Descriptions.Item>
                <Descriptions.Item label="部门">
                  {organization && organization.name ? organization.name : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="分组">
                  {groups && groups.length !== 0
                    ? groups.map((item, index) => (
                        <span key={index}>{item["name"]}</span>
                      ))
                    : null}
                </Descriptions.Item>
                <Descriptions.Item label="角色">
                  {roleTypes.map((item, index) => (
                    <span key={index}>{item[role]}</span>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  {employeeStatuses.map((item, index) => (
                    <span key={index}>{item[status]}</span>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="备注">{desc}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Drawer>
      </div>
    );
  };

  //编辑账户表单
  renderAccountEditDrawer = () => {
    return (
      <Drawer
        width={400}
        title="编辑账户"
        onClose={this.onClose}
        visible={this.state.showEdit}
      >
        {this._renderFormCont()}
      </Drawer>
    );
  };
  displayRender = (label) => {
    return label[label.length - 1];
  };
  //账户编辑表单
  _renderFormCont = () => {
    const { realName } = this.state.account;
    return (
      <div className="OrgFormDialog">
        <Form
          layout="vertical"
          name="basic"
          initialValues={{
            realName: realName,
          }}
          onFinish={this.onFinish}
          onFinishFailed={this.onFinishFailed}
          validateMessages={defaultValidateMessages.defaultValidateMessages}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="真实姓名" name="realName" rules={[{ max: 16 }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item>
                <Button type="default" onClick={this.onClose}>
                  取消
                </Button>
                <Button
                  className="margin-left"
                  type="primary"
                  htmlType="submit"
                >
                  提交
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };
  //提交更新请求
  onFinish = async (values) => {
    this.setState({
      inited: false,
    });
    let params = {
      realName: values.realName,
    };
    const result = await reqPutAccountProfile(params);
    if (result.data.retcode === 0) {
      notification.success({
        message: "更新成功！",
      });
    }
    //刷新一下新的账户信息
    this.reqGetAccounts();
    this.onClose();
  };
  settingPassword = () => {
    this.setState({
      showPassword: true,
    });
  };

  //绑定微信
  bindWechat = () => {
    console.log("Profile -> bindWechat -> bindWechat");
    //wechat
    let { wxstate, currenturl } = this.state;

    let accountUid = storageUtils.getUser().uid;
    const appid = "wxe6f169c3efb14dce";
    console.log("Profile -> bindWechat -> currenturl", currenturl);
    let address =
      "https://myriad-test.xinongtech.com/myriadapi/public/wxAccounts/web/bind?&accountUid=" +
      accountUid +
      "&appid=" +
      appid +
      "&redirect=" +
      currenturl;
    let redirect_uri = encodeURIComponent(address);
    let code = "code";
    let scope = "snsapi_login";
    let state = wxstate;
    let url =
      "https://open.weixin.qq.com/connect/qrconnect?appid=" +
      appid +
      "&redirect_uri=" +
      redirect_uri +
      "&response_type=" +
      code +
      "&scope=" +
      scope +
      "&state=" +
      wxstate +
      "#wechat_redirect";
    window.location.href = url;
    //window.open(url)
    // this.setState({
    //   url: url,
    //   showwx:true
    // })
  };
  renderWeChat = () => {
    let { url, showwx } = this.state;
    return (
      <Modal
        className="markrt"
        title="绑定微信"
        onCancel={this.onClose}
        footer={[]}
        width="60%"
        visible={showwx}
      >
        <iframe src={url} width="100%" height="500px">
          url
        </iframe>
      </Modal>
    );
  };

  renderPasswordDrawer = () => {
    let { showPassword, account } = this.state;
    return (
      <PasswordDrawer
        onClose={this.onClose}
        visible={showPassword}
        selectedAccount={account}
      />
    );
  };
  render() {
    let { showView, inited, showEdit, showwx, showPassword } = this.state;

    return (
      <div style={{ height: "100%" }}>
        <PageHeader
          className="site-page-header-responsive cont"
          title={"我的账户"}
        ></PageHeader>
        <div className="profile-action">
          <b className="actionItems" onClick={this.bindWechat}>
            微信绑定
          </b>
          <b onClick={this.settingPassword} className="ant-green-link cursor">
            密码设置
          </b>
        </div>
        {inited ? this.renderAccountCard() : <Loading />}
        {showEdit ? this.renderAccountEditDrawer() : null}
        {showView ? this.renderProfileDetailDrawer() : null}
        {showwx ? this.renderWeChat() : null}
        {showPassword ? this.renderPasswordDrawer() : null}
      </div>
    );
  }
}
export default Profile;
