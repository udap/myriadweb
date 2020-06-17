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
  reqPostCustomer,
  reqPutCustomer,
  reqGetCustomerRankings,
  reqVerify, //获取验证码
} from "../../api";
import storageUtils from "../../utils/storageUtils";

const { TextArea } = Input;
const { Option } = Select;
class CustomerEditForm extends Component {
  state = {
    isNew: true,
    iconLoading: false,
    unableClick: false, //不允许再次获取验证码
    number: 60,
    selectedCustomer: this.props.selectedCustomer,
    rankList: [],
  };

  componentDidMount() {
    this.setState({
      isNew: this.props.isNew,
    });
    this.reqGetCustomerRankingList();
  }

  reqGetCustomerRankingList = async () => {
    let uid = storageUtils.getUser().orgUid;
    let result = await reqGetCustomerRankings(uid);
    let cont = result.data && result.data.content ? result.data.content : [];
    this.setState({
      rankList: cont,
    });
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
      notification.error({ message: "请输入手机号码！" });
      return false;
    }
    const result = reqVerify(value).then((res) => {
      this.setState({
        iconLoading: true,
        smsCode: result,
        unableClick: true,
      });

      this.countdown();
    });
  };
  onFinish = async (values) => {
    this.setState({
      loading: true,
    });
    let params = {
      name: values.name,
      cellphone: values.cellphone,
      remarks: values.remarks,
      ranking: values.ranking,
    };

    if (this.state.isNew) {
      //验证码
      params.smsCode = values.smsCode;
      const result = await reqPostCustomer(params);
      this.setState({
        loading: false,
      });
      if (result.data.retcode === 0) {
        notification.success({ message: "添加成功" });
        this.backIndex();
      }
    } else {
      let uid = this.state.selectedCustomer.uid;
      const result = await reqPutCustomer(uid, params);
      this.setState({
        loading: false,
      });
      if (result.data.retcode === 0) {
        notification.success({ message: "更新成功" });
        this.backIndex();
      }
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
    const { name, cellphone, ranking, remarks } = this.state.selectedCustomer;
    let { isNew, visible } = this.props;
    return (
      <Drawer
        width={480}
        title={isNew ? "添加客户" : "修改客户"}
        visible={visible}
        onClose={this.props.onClose}
        footer={null}
      >
        <Form
          name="basic"
          layout="vertical"
          initialValues={{
            name: name,
            cellphone: cellphone,
            ranking: ranking,
            remarks: remarks,
          }}
          onFinish={this.onFinish}
          onValuesChange={this.onValuesChange}
          validateMessages={defaultValidateMessages.defaultValidateMessages}
        >
          <Form.Item
            label="客户姓名"
            name="name"
            rules={[{ required: true }, { max: 32 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="手机号码"
            name="cellphone"
            rules={[{ required: true }, { max: 11 }]}
          >
            <Input
              disabled={isNew ? false : true}
              value={this.state.cellphone}
            />
          </Form.Item>
          {isNew ? (
            <Form.Item
              name="smsCode"
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
          ) : null}

          <Form.Item name="ranking" label="客户等级">
            <Select
              placeholder="请选择客户等级"
              onChange={this.onGenderChange}
              allowClear
            >
              {this.state.rankList && this.state.rankList.length > 0
                ? this.state.rankList.map((item) => (
                    <Option value={item.uid}>{item.name}</Option>
                  ))
                : null}
            </Select>
          </Form.Item>
          <Form.Item label="备注" name="remarks">
            <TextArea rows={4} />
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

export default CustomerEditForm;
