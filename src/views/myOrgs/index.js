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
  //注册机构
  Form,
  Input,
  Button,
  Modal,
  Cascader,
} from "antd";
import { withRouter } from "react-router-dom";
import storageUtils from "../../utils/storageUtils";
import { Loading } from "../../components";
import {
  regGetCurOrg,
  reqGetAuthCode,
  regAddOrg,
  regPutCurOrg,
} from "../../api";
import OrgFormDialog from "./orgFormDialog";
import { EyeOutlined, PictureOutlined, EditOutlined } from "@ant-design/icons";
//注册机构
import province from "../../utils/province";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import "./index.less";
import "../../css/common.less";
const { Meta } = Card;
const options = [province];
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

@withRouter
class MyOrgs extends Component {
  state = {
    inited: false,
    organization: {},
    hasOrg: false,
    //机构动态授权码
    visible: false,
    //机构详情
    showView: false,
    //机构编辑
    showEdit: false,
  };

  componentDidMount() {
    if (storageUtils.getUser().orgUid) {
      this.regGetCurOrg();
      this.setState({
        hasOrg: true,
      });
    } else {
      this.setState({
        hasOrg: false,
      });
    }
  }
  //获取当前机构信息
  regGetCurOrg = async (newOrg) => {
    let uid = newOrg ? newOrg : storageUtils.getUser().orgUid;
    const result = await regGetCurOrg(uid);
    const cont = result && result.data ? result.data.content : null;
    this.setState({
      inited: true,
      organization: cont,
    });
  };
  //切换机构卡片和注册机构表单
  //新用户展示注册机构表单
  closeEditing = (changed, uid) => {
    this.setState({
      isNew: false,
      inited: false,
      hasOrg: true,
    });
    if (changed) this.regGetCurOrg(uid);
  };
  //获取授权码;
  getAuthCode = async () => {
    let orgUid = storageUtils.getUser().orgUid;
    let isAdmin = storageUtils.getUser().admin;
    if (!isAdmin) {
      notification.info({ message: "对不起，您没有权限！" });
      return false;
    }
    let curInfo = await reqGetAuthCode(orgUid);
    if (curInfo) {
      let cont = curInfo.data.content ? curInfo.data.content : [];
      this.setState({
        authCode: cont,
        visible: true,
      });
    }
  };
  //关闭抽屉
  onClose = () => {
    this.setState({
      visible: false,
      showEdit: false,
      showView: false,
    });
  };
  //机构卡片信息
  renderOrgCard = () => {
    const { fullName, phone, address } = this.state.organization;
    return (
      <div>
        <Row className="action">
          <Col className="actionItems">
            {/* <b
                  onClick={() => {
                    //this.props.history.push("/admin/campaign/detail/" + id);
                  }}
                  className="ant-green-link cursor"
                >
                  编辑
                </b> */}
            <b
              onClick={() => {
                this.props.history.push("/admin/employee");
              }}
              className="ant-green-link cursor"
            >
              员工管理
            </b>
            <Divider type="vertical" />
            <b
              onClick={() => {
                this.props.history.push("/admin/group");
              }}
              className="ant-green-link cursor"
            >
              权限与分组
            </b>
            <Divider type="vertical" />
            <b onClick={this.getAuthCode} className="ant-green-link cursor">
              动态授权码
            </b>
          </Col>
        </Row>
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
                this.setState({
                  showEdit: true,
                });
              }}
            />,
          ]}
        >
          <Meta className="orgTitle" title={fullName} />
          <p>{address}</p>
          <p style={{ marginBottom: 0 }}>{phone}</p>
        </Card>
      </div>
    );
  };
  //机构详情
  renderOrgDetailDrawer = () => {
    const DescriptionItem = ({ title, content }) => (
      <div className="site-description-item-profile-wrapper">
        <p className="site-description-item-profile-p-label">{title}:</p>
        {content ? content : "-"}
      </div>
    );
    const {
      fullName,
      name,
      licenseNo,
      phone,
      address,
      code,
      postalCode,
      parent,
    } = this.state.organization;
    return (
      <div>
        <Drawer
          width={640}
          title="机构详情"
          onClose={this.onClose}
          visible={this.state.showView}
        >
          <p className="site-description-item-profile-p">机构信息</p>
          <Row>
            <Col span={12}>
              <DescriptionItem title="机构名称" content={fullName} />
            </Col>
            <Col span={12}>
              <DescriptionItem title="机构简称" content={name} />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <DescriptionItem title="营业执照号码" content={licenseNo} />
            </Col>
            <Col span={12}>
              <DescriptionItem title="银联商户码" content={code} />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <DescriptionItem title="联系电话" content={phone} />
            </Col>
            <Col span={12}>
              <DescriptionItem title="邮政编码" content={postalCode} />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <DescriptionItem title="详细地址" content={address} />
            </Col>
          </Row>
          {parent.name ? (
            <div>
              <Divider />
              <p className="site-description-item-profile-p">父机构信息</p>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="机构名称" content={parent.name} />
                </Col>
              </Row>
            </div>
          ) : null}
        </Drawer>
      </div>
    );
  };
  //动态授权码
  renderAuthCodeDrawer = () => {
    return (
      <Drawer
        width={410}
        title="动态授权码"
        onClose={this.onClose}
        visible={this.state.visible}
      >
        <div className="authCode">
          <p>
            当前授权码是<span>{this.state.authCode}</span>
            ,请尽快和相关机构分享授权码。该授权码在 30 分钟后失效。
          </p>
          <small className="description">
            如果某个营销机构希望邀请您的机构作为核销机构参与该营销机构发起的营销活动，您需要生成并提供一个限时有效的动态授权码给该营销机构。
          </small>
         
        </div>
      </Drawer>
    );
  };
  //编辑机构表单
  renderOrgEditDrawer = () => {
    return (
      <Drawer
        width={720}
        title="编辑机构"
        onClose={this.onClose}
        visible={this.state.showEdit}
      >
        {this._renderFormCont()}
      </Drawer>
    );
  };
  //机构编辑表单
  _renderFormCont = () => {
    const {
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
      code,
    } = this.state.organization;
    return (
      <div className="OrgFormDialog">
        <Form
          layout="vertical"
          //{...layout}
          name="basic"
          initialValues={{
            residence: [province, city, district],
            fullName: fullName,
            name: name,
            licenseNo: licenseNo,
            phone: phone,
            postalCode: postalCode,
            street: street,
            address: address,
            code: code,
          }}
          onFinish={this.onFinish}
          onFinishFailed={this.onFinishFailed}
          validateMessages={defaultValidateMessages.defaultValidateMessages}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="机构简称"
                name="name"
                rules={[{ required: true }, { max: 20 }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="营业执照号码" name="licenseNo">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="银联商户码" name="code">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="联系电话"
                name="phone"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="residence"
                label="地区"
                rules={[
                  {
                    type: "array",
                    required: true,
                  },
                ]}
              >
                <Cascader
                  defaultValue={["重庆市", "重庆市", "渝北区"]}
                  options={options}
                  //onChange={this.onChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="邮政编码"
                name="postalCode"
                rules={[{ max: 6 }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="详细地址"
                name="street"
                rules={[{ required: true }, { max: 45 }]}
              >
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
    let that = this;
    let params = {
      fullName: values.fullName,
      name: values.name,
      phone: values.phone ? values.phone : storageUtils.getUser().cellphone,
      licenseNo: values.licenseNo,
      postalCode: values.postalCode,
      street: values.street,
      province: values.residence[0],
      city: values.residence[1],
      district: values.residence[2],
      parentOrgUid: "",
      upCode: values.code,
    };
    const result = await regPutCurOrg(this.state.organization.uid, params);
    console.log("MyOrgs -> onFinish -> result", result);
    if (result.data.retcode === 0) {
      notification.success({
        message: "更新成功！",
      });
    }
    //刷新一下新的机构信息
    this.regGetCurOrg();
    this.onClose();
  };
  render() {
    let { organization, hasOrg, showView, visible, showEdit } = this.state;
    return (
      <div style={{ height: "100%" }}>
        <PageHeader
          className="site-page-header-responsive cont"
          title={organization && hasOrg ? "我的机构" : "注册机构"}
        ></PageHeader>
        {organization && hasOrg ? (
          this.renderOrgCard()
        ) : (
          <OrgFormDialog
            organize={organization}
            onClose={this.closeEditing}
            isNew={true}
          />
        )}
        {showEdit ? this.renderOrgEditDrawer() : null}
        {showView ? this.renderOrgDetailDrawer() : null}
        {visible ? this.renderAuthCodeDrawer() : null}
      </div>
    );
  }
}
export default MyOrgs;
