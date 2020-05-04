import React, { Component } from "react";
//加载中
import { Button, Form, Input, message, Menu, Select, PageHeader } from "antd";
import { DownOutlined, RollbackOutlined } from "@ant-design/icons";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import { reqAddEmployees, reqGetGroup, reqGetEmployee } from "../../api";
import storageUtils from "../../utils/storageUtils";
import { Loading } from "../../components";
import { withRouter } from "react-router-dom";

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

const options = [
  {
    value: "zhejiang",
    label: "重庆",
    children: [
      {
        value: "hangzhou",
        label: "涪陵",
        children: [
          {
            value: "xihu",
            label: "镇安镇",
          },
        ],
      },
    ],
  },
];
const { Option } = Select;
const style = {
  fontSize: "20px",
  color: "#1890ff",
  marginLeft: "10px",
};
@withRouter
class FormDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inited: false,
      isNew: true,
      name: "",
      cellphone: "",
      admin: "",
      desc: "",
      groupId: "",
      orgUid: "",
      code: "",
      groups: [],
      curInfo: {},
    };
  }
  componentDidMount() {
    console.log(
      "componentDidMount",
      this.props,
      this.props.form,
      this.state.isNew
    );
    let id = this.props.match.params.id;
    console.log("FormDialog -> render -> id", id);
    this.setState({
      isNew: id === "new" ? true : false,
    });
    if (id !== "new") {
      this.getEmployee(id);
    } else {
      this.getGroups();
    }
  }
  //获取当前员工详情
  getEmployee = async (id) => {
    let curInfo = await reqGetEmployee(id);
    let cont = curInfo.data.content ? curInfo.data.content : [];
    console.log("FormDialog -> getEmployee -> cont", cont);
    this.setState({
      inited: true,
      curInfo: cont,
    });
  };
  //获取员工所在组
  getGroups = async () => {
    let orgUid = storageUtils.getUser().orgUid;
    let groups = await reqGetGroup(orgUid);
    let cont = groups.data.content ? groups.data.content.content : [];
    this.setState({
      inited: true,
      groups: cont,
      orgUid: orgUid,
    });
  };
  onFinish = async (values) => {
    let params = {
      name: values.name,
      cellphone: values.cellphone,
      admin: values.admin,
      desc: values.desc,
      groupId: values.groupId,
      //orgUid: storageUtils.getUser().orgUid,
    };

    const result = await reqAddEmployees(this.state.orgUid, params);
    if (result) {
      //this.props.onClose(true);
      this.backIndex();
    }
  };
  backIndex = () => {
    this.props.history.push("/admin/employees");
  };
  onFinishFailed = (errorInfo) => {};
  renderContent = () => {
    const {
      name,
      cellphone,
      admin,
      desc,
      groupId,
      orgUid,
      code,
      groups,
    } = this.state.curInfo;
    const onGenderChange = (value) => {
      console.log("FormDialog -> onGenderChange -> value", value);
    };

    return (
      <Form
        {...layout}
        name="basic"
        initialValues={{
          name: name,
          cellphone: cellphone,
          admin: admin,
          desc: desc,
          groupId: this.state.isNew ? groupId : groups[0].name,
          code: code,
        }}
        onFinish={this.onFinish}
        onFinishFailed={this.onFinishFailed}
        validateMessages={defaultValidateMessages.defaultValidateMessages}
      >
        <Form.Item
          label="员工姓名"
          name="name"
          rules={[{ required: true }, { max: 32 }]}
        >
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item>
        <Form.Item
          label="手机号码"
          name="cellphone"
          rules={[{ required: true }, { max: 13 }]}
        >
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item>
        <Form.Item label="员工编号" name="code" rules={[{ len: 20 }]}>
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item>
        <Form.Item
          label={this.state.isNew ? "请选择组" : "员工所在组"}
          name="groupId"
        >
          {this.state.isNew ? (
            <Select placeholder="请选择组" onChange={onGenderChange} allowClear>
              {this.state.groups.map((item, index) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          ) : (
            <Input disabled={this.state.isNew ? false : true} />
          )}
        </Form.Item>
        <Form.Item label="备注" name="desc" rules={[{ max: 6 }]}>
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item>

        {this.state.isNew ? (
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        ) : null}
      </Form>
    );
  };
  render() {
    const onClick = ({ key }) => {
      message.info(`Click on item ${key}`);
    };

    return (
      <div className="FormDialog">
        <PageHeader
          className="site-page-header-responsive"
          title={this.state.isNew ? "添加员工" : "员工详情"}
          extra={[<RollbackOutlined style={style} onClick={this.backIndex} />]}
        ></PageHeader>
        {this.state.inited ? this.renderContent() : <Loading />}
      </div>
    );
  }
}
export default FormDialog;
