import React, { Component } from "react";
import {
  PageHeader,
  Row,
  Col,
  notification,
  Drawer,
  Divider,
  Card,
  Descriptions,
  //注册账户
  Form,
  Input,
  Button,
  Modal,
  Cascader,
} from "antd";
import { Loading } from "../../components";
import { withRouter } from "react-router-dom";
import storageUtils from "../../utils/storageUtils";
import { reqPermit, reqGetAccountProfile, reqPutAccount } from "../../api";
import { EyeOutlined, PictureOutlined, EditOutlined } from "@ant-design/icons";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import {
  employeeStatuses,
  orgStatusesList,
  roleTypes,
  Operations,
} from "../../utils/constants";
import "./index.less";
import "../../css/common.less";
const { Meta } = Card;
//const [AOperations] = Operations;

@withRouter
class MyAccount extends Component {
  state = {
    inited: false,
    account: {},
    //账户详情
    showView: false,
    //账户编辑
    showEdit: false,
  };

  componentDidMount() {
    this.reqGetAccounts();
  }

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
  renderOrgDetailDrawer = () => {
    const DescriptionItem = ({ title, content }) => (
      <div className="site-description-item-profile-wrapper">
        <p className="site-description-item-profile-p-label">{title}:</p>
        {content ? content : "-"}
      </div>
    );
    const {
      orgName,
      name,
      admin,
      cellphone,
      code,
      organization,
      groups,
      role,
      status,
      desc,
      operations,
    } = this.state.account;

    return (
      <div>
        <Drawer
          width={640}
          title="账户详情"
          onClose={this.onClose}
          visible={this.state.showView}
        >
          <Row>
            <Col span={24}>
              <Descriptions bordered column={1}>
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
                {/* <Descriptions.Item label="角色">
                  {roleTypes.map((item, index) => (
                    <span key={index}>{item[role]}</span>
                  ))}
                </Descriptions.Item> */}
                {/* <Descriptions.Item label="权限">
                  {AOperations.map((item, index) => (
                    <span key={index}>{item[operations]}</span>
                  ))}
                </Descriptions.Item> */}
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
        width={720}
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
    const result = await reqPutAccount(params);
    console.log("MyAccount -> onFinish -> result", result);
    if (result.data.retcode === 0) {
      notification.success({
        message: "更新成功！",
      });
    }
    //刷新一下新的账户信息
    this.reqGetAccounts();
    this.onClose();
  };
  render() {
    let { showView, inited, showEdit } = this.state;
    return (
      <div style={{ height: "100%" }}>
        <PageHeader
          className="site-page-header-responsive cont"
          title={"我的账户"}
        ></PageHeader>
        {inited ? this.renderAccountCard() : <Loading />}
        {showEdit ? this.renderAccountEditDrawer() : null}
        {showView ? this.renderOrgDetailDrawer() : null}
      </div>
    );
  }
}
export default MyAccount;
