import React, { Component } from "react";
import { withRouter } from "react-router-dom";
//加载中
import { Button, Form, Input, Cascader, Modal, Card } from "antd";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import { regAddOrg } from "../../api";
import province from "../../utils/province";
import storageUtils from "../../utils/storageUtils";
import { EyeOutlined, PictureOutlined, EditOutlined } from "@ant-design/icons";
import { Loading } from "../../components";
import "../../css/common.less";
import "./index.less";
const { Meta } = Card;
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

const options = [province];

@withRouter
class OrgFormDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isNew: props.isNew,
      licenseNo: props.organize ? props.organize.licenseNo : "",
      fullName: props.organize ? props.organize.fullName : "",
      name: props.organize ? props.organize.name : "",
      phone: props.organize
        ? props.organize.phone
        : storageUtils.getUser().cellphone,
      postalCode: props.organize ? props.organize.postalCode : "",
      address: props.organize ? props.organize.address : "",
      street: props.street ? props.organize.street : "",
      province: props.organize ? props.organize.province : "重庆市",
      city: props.organize ? props.organize.city : "重庆市",
      district: props.organize ? props.organize.district : "渝北区",
      inited: true,
      code: props.organize.upCode ? props.organize.upCode : "",
    };
  }
  componentDidMount() {}
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
    const result = await regAddOrg(params);
    if (
      result &&
      result.data &&
      result.data.content &&
      result.data.content.status === "NEW"
    ) {
      let uid = result.data.content.uid;
      //保存用户信息
      let Data = {
        orgUid: uid,
      };
      storageUtils.saveUser(Data); //保存到localStorage中
      Modal.success({
        content: (
          <div className="authCode">
            您新注册的机构正在等待审批，预计审批时间
            <span>1个工作日</span>
          </div>
        ),
        okText: "完成注册",
        onOk() {
          //清空缓存localStorage
          storageUtils.removeUser();
          storageUtils.removeOrg();
          storageUtils.removeToken();
          //user = {};
          //返回登陆页
          that.props.history.replace("/login");
        },
      });
    } else {
      this.setState({
        inited: true,
      });
    }

    // this.props.onClose(true, uid);
  };

  onChange = (value) => {
    console.log(value);
    this.setState({
      province: value[0],
      city: value[1],
      district: value[2],
    });
  };

  _renderCont = () => {
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
    } = this.state;
    return (
      <div className="OrgFormDialog">
        <Form
          {...layout}
          name="basic"
          initialValues={{
            residence: ["重庆市", "重庆市", "渝北区"],
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
          <Form.Item
            label="机构名称"
            name="fullName"
            rules={[{ required: true }, { max: 45 }]}
          >
            <Input disabled={this.state.isNew ? false : true} />
          </Form.Item>
          <Form.Item
            label="机构简称"
            name="name"
            rules={[{ required: true }, { max: 20 }]}
          >
            <Input disabled={this.state.isNew ? false : true} />
          </Form.Item>
          <Form.Item label="营业执照号码" name="licenseNo">
            <Input disabled={this.state.isNew ? false : true} />
          </Form.Item>
          <Form.Item label="银联商户码" name="code">
            <Input disabled={this.state.isNew ? false : true} />
          </Form.Item>
          <Form.Item label="联系电话" name="phone" rules={[{ required: true }]}>
            <Input disabled={this.state.isNew ? false : true} />
          </Form.Item>
          {this.state.isNew ? (
            <div>
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
                  onChange={this.onChange}
                  disabled={this.state.isNew ? false : true}
                />
              </Form.Item>
              <Form.Item
                label="详细地址"
                name="street"
                rules={[{ required: true }, { max: 45 }]}
              >
                <Input disabled={this.state.isNew ? false : true} />
              </Form.Item>
            </div>
          ) : (
            <div>
              <Form.Item
                label="详细地址"
                name="address"
                rules={[{ required: true }, { max: 45 }]}
              >
                <Input disabled={this.state.isNew ? false : true} />
              </Form.Item>
            </div>
          )}
          <Form.Item label="邮政编码" name="postalCode" rules={[{ max: 6 }]}>
            <Input disabled={this.state.isNew ? false : true} />
          </Form.Item>
          {this.state.isNew ? (
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </Form.Item>
          ) : null}
        </Form>
      </div>
    );
  };
  
  render() {
    return (
      <div style={{ height: "100%" }}>
        {this.state.inited ? this._renderCont() : <Loading />}
      </div>
    );
  }
}
export default OrgFormDialog;
