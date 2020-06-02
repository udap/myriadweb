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
  Cascader,
} from "antd";
import { withRouter } from "react-router-dom";
import storageUtils from "../../utils/storageUtils";
import { Loading } from "../../components";
import {
  reqPermit,
  regGetCurOrg,
  reqGetAuthCode,
  regPutCurOrg,
} from "../../api";
import OrgFormDialog from "./orgFormDialog";
import { orgStatusesList } from "../../utils/constants";
import { EyeOutlined, PictureOutlined, EditOutlined } from "@ant-design/icons";
//注册机构ChinaRegions
import { ChinaRegions } from "../../utils/china-regions";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import comEvents from "../../utils/comEvents";
import "./index.less";
import "../../css/common.less";
const { Meta } = Card;

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
    // let isAdmin = storageUtils.getUser().admin;
    // if (!isAdmin) {
    //   notification.info({ message: "对不起，您没有权限！" });
    //   return false;
    // }
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
  showEdit = () => {
    this.setState({
      showEdit: true,
    });
  };
  //机构卡片信息
  renderOrgCard = () => {
    const { fullName, phone, address } = this.state.organization;
    const { manageOrg } = this.state;

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
                this.props.history.push("/admin/myChildOrg");
              }}
              className="ant-green-link cursor"
            >
              下属机构管理
            </b>
            <Divider type="vertical" />
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
            <b
              onClick={() => {
                this.props.history.push("/admin/tag");
              }}
              className="ant-green-link cursor"
            >
              公共标签
            </b>
            <span>
              <Divider type="vertical" />
              <b
                onClick={() => {
                  let self = this;
                  comEvents.hasPower(
                    self,
                    reqPermit,
                    "MANAGE_ORGANIZATION",
                    "getAuthCode"
                  );
                }}
                className="ant-green-link cursor"
              >
                动态授权码
              </b>
            </span>
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
                let self = this;
                comEvents.hasPower(
                  self,
                  reqPermit,
                  "MANAGE_ORGANIZATION",
                  "showEdit"
                );
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
      upCode,
      postalCode,
      parent,
      status,
    } = this.state.organization;
    return (
      <div>
        <Drawer
          width={480}
          title="机构详情"
          onClose={this.onClose}
          visible={this.state.showView}
        >
          <Row>
            <Col span={24}>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="名称">{fullName}</Descriptions.Item>
                <Descriptions.Item label="简称">{name}</Descriptions.Item>
                <Descriptions.Item label="机构编码">{code}</Descriptions.Item>
                <Descriptions.Item label="营业执照号码">
                  {licenseNo}
                </Descriptions.Item>
                <Descriptions.Item label="银联商户码">
                  {upCode}
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">{phone}</Descriptions.Item>
                <Descriptions.Item label="地址">{address}</Descriptions.Item>
                <Descriptions.Item label="邮政编码">
                  {postalCode}
                </Descriptions.Item>
                {parent.name ? (
                  <Descriptions.Item label="上级机构">
                    {parent.name}
                  </Descriptions.Item>
                ) : null}
                <Descriptions.Item label="机构状态">
                  {orgStatusesList.map((item, index) => (
                    <span key={index}>{item[status]}</span>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Drawer>
      </div>
    );
  };
  //动态授权码
  renderAuthCodeDrawer = () => {
    return (
      <Drawer
        width={400}
        title="动态授权码"
        onClose={this.onClose}
        visible={this.state.visible}
      >
        <div className="authCode">
          <small className="description">
            如果某个营销机构希望邀请您的机构作为核销机构参与该营销机构发起的营销活动，您需要生成并提供一个限时有效的动态授权码给该营销机构。
          </small>
        </div>
        <div className="authCode">
          <p>
            当前授权码是<span>{this.state.authCode}</span>
            ,请尽快和相关机构分享授权码。该授权码在 30 分钟后失效。
          </p>
        </div>
      </Drawer>
    );
  };
  //编辑机构表单
  renderOrgEditDrawer = () => {
    return (
      <Drawer
        width={480}
        title="编辑机构"
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
      upCode,
    } = this.state.organization;
    return (
      <div className="OrgFormDialog">
        <Form
          layout="vertical"
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
            upCode: upCode,
          }}
          onFinish={this.onFinish}
          onFinishFailed={this.onFinishFailed}
          validateMessages={defaultValidateMessages.defaultValidateMessages}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="名称"
                name="fullName"
                rules={[{ required: true }, { max: 45 }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="简称"
                name="name"
                rules={[{ required: true }, { max: 20 }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="联系电话"
                name="phone"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="机构编码" name="code">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="营业执照号码" name="licenseNo">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="银联商户码" name="upCode">
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
                <Cascader options={ChinaRegions} onChange={this.onChange} />
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
                <Input.TextArea allowClear/>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item>
                <Button
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
      upCode: values.upCode,
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
    let {
      organization,
      hasOrg,
      showView,
      visible,
      showEdit,
      inited,
    } = this.state;
    return (
      <div style={{ height: "100%" }}>
        <PageHeader
          className="site-page-header-responsive cont"
          title={organization && hasOrg ? "我的机构" : "注册机构"}
        ></PageHeader>
        {organization && hasOrg ? (
          <div> {inited ? this.renderOrgCard() : <Loading />}</div>
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
