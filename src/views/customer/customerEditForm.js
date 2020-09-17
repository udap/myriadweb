import React, { Component } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Select,
  Spin,
  notification,
} from "antd";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import {
  reqPostCustomer,
  reqPutCustomer,
  reqGetCustomerRankings,
  reqGetEmployees,
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
    fetching: false,
    employees: [],
    selectedEmployee: null,
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
    // const result = reqVerifyCustomer(value).then((res) => {
    //   this.setState({
    //     iconLoading: true,
    //     unableClick: true,
    //   });

    //   this.countdown();
    // });
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
      mgrUid: values.csr.key,
    };
    console.log("form values: ", params);
    if (this.state.isNew) {
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

  handleChange = (selectedEmployee) => {
    this.setState({
      selectedEmployee,
      employees: [],
      fetching: false,
    });
  };

  fetchEmployees = async (searchTxt) => {
    this.setState({ 
      employees: [], 
      fetching: true 
    });
    const params = {
      sort: ["name"],
      size: 100,
      orgUid: storageUtils.getUser().orgUid,
      searchTxt: searchTxt,
      status: "ACTIVE",
    };
    const result = await reqGetEmployees(params);
    const data = result && result.data ? result.data.content : [];
    const employees = data.content.map(e=>({
      uid: e.uid,
      name: e.name,
      code: e.code,
      cellphone: e.cellphone,
    }));
    this.setState({
      employees,
      fetching: false
    });
  };

  render() {
    const {fetching, employees} = this.state;
    const { isNew, visible } = this.props;
    const { name, cellphone, ranking, remarks, employee } = this.state.selectedCustomer;
    const selectedEmployee = {
      key: isNew?"":employee.uid,
      label: isNew?"":employee.name,
      value: isNew?"":employee.uid,
    }
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
            csr: selectedEmployee,
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
          <Form.Item name="csr" label="客户经理">
            <Select showSearch labelInValue
              placeholder="请输入姓名、员工号或手机号"
              value={selectedEmployee}
              filterOption={false}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              onSearch={this.fetchEmployees}
              onChange={this.handleChange}
              disabled={isNew?true:false} 
              allowClear
            >
              {employees.map(e => (
                <Option key={e.uid}>{e.name}</Option>
              ))}     
            </Select>
          </Form.Item>
          <Form.Item name="ranking" label="客户等级">
            <Select
              placeholder="请选择客户等级"
              onChange={this.onGenderChange}
              allowClear
            >
              {this.state.rankList && this.state.rankList.length > 0
                ? this.state.rankList.map((item) => (
                    <Option value={item.name}>{item.name}</Option>
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
