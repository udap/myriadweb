import React, { Component } from "react";
import storageUtils from "../../utils/storageUtils";
import { reqGetAccounts, regGetCurOrg } from "../../api";
import { message, Modal, Result } from "antd";
import { ExclamationCircleOutlined, SmileOutlined } from "@ant-design/icons";
import { LinkBtn } from "../../components";
import { Loading } from "../../components";
const { confirm } = Modal;

class Dashboard extends Component {
  state = {
    account: {},
    showContent: true,
    inited: false,
  };
  componentDidMount() {
    this.getList();
  }
  /*
获取当前机构
*/
  regGetCurOrg = async (newOrg) => {
    let that = this;

    let uid = newOrg ? newOrg : storageUtils.getUser().orgUid;
    const result = await regGetCurOrg(uid);

    if (
      result &&
      result.data &&
      result.data.content &&
      result.data.content.status === "NEW"
    ) {
      Modal.success({
        content: <div className="authCode">您已提交机构注册，请耐心等待！</div>,
        okText: "退出",
        onOk() {
          //清空缓存localStorage
          storageUtils.removeUser();
          storageUtils.removeToken();
          //user = {};
          //返回登陆页
          that.props.history.replace("/login");
        },
      });
      this.setState({
        inited: false,
      });
    } else {
      this.setState({
        inited: true,
        showContent: true,
      });
    }
  };
  /*获取用户信息*/
  getList = async () => {
    const result = await reqGetAccounts();
    //请求成功
    if (result && result.data.retcode === 0) {
      const data = result.data.content;
      storageUtils.saveUser(data); //保存到localStorage中
      this.setState({
        account: data,
        //inited: true,
      });
      //user
      let hasOrg = data && data.orgUid;
      if (hasOrg) {
        this.regGetCurOrg();
      } else {
        this.setState({
          inited: true,
          showContent: false,
        });
      }
    }
  };
  //退出登录
  logout = () => {
    confirm({
      title: "确认退出登录吗？",
      icon: <ExclamationCircleOutlined />,
      onOk: () => {
        //清空缓存localStorage
        storageUtils.removeUser();
        storageUtils.removeToken();
        //user = {};
        //返回登陆页
        this.props.history.replace("/login");
      },
    });
  };
  address = (route) => {
    if (route === "exit") {
      this.logout();
    } else {
      this.props.history.replace("/admin/myOrgs");
    }
  };
  _renderRegOrg = () => {
    return (
      <Result
        status="warning"
        title="您尚未加入任何结构！请注册新机构或者退出"
        extra={
          <div>
            <LinkBtn color="#1890ff" onClick={this.address.bind(this, "exit")}>
              退出
            </LinkBtn>
            <LinkBtn color="#1890ff" onClick={this.address.bind(this, "reg")}>
              注册机构
            </LinkBtn>
          </div>
        }
      />
    );
  };
  _renderTable = () => {
    const { accout } = this.state;
    return (
      <div>
        <Result icon={<SmileOutlined />} title="欢迎访问江渝礼享！" />
      </div>
    );
  };
  renderContent = () => {
    return (
      <div>
        {this.state.showContent ? this._renderTable() : this._renderRegOrg()}
      </div>
    );
  };

  render() {
    return (
      <div style={{ height: "100%" }}>
        {this.state.inited ? this.renderContent() : <Loading />}
      </div>
    );
  }
}

export default Dashboard;
