import React, { Component } from "react";
import { PageHeader, Row, Col, notification, Drawer, Divider } from "antd";
import storageUtils from "../../utils/storageUtils";
import { Loading } from "../../components";
import { regGetCurOrg, reqGetAuthCode } from "../../api";
import OrgFormDialog from "./orgFormDialog";
import './index.less'
//没有数据组件
class MyOrgs extends Component {
  state = {
    inited: false,
    campaigns: {},
    hasOrg: false,
    visible: false,
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
  /*
获取当前机构
*/
  regGetCurOrg = async (newOrg) => {
    let uid = newOrg ? newOrg : storageUtils.getUser().orgUid;
    const result = await regGetCurOrg(uid);
    const cont = result && result.data ? result.data.content : null;
    this.setState({
      inited: true,
      campaigns: cont,
    });
  };

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
  onClose=()=>{
    this.setState({
      visible: false,
    });
  };
  render() {
    return (
      <div style={{ height: "100%" }}>
        <PageHeader
          className="site-page-header-responsive cont"
          title={
            this.state.campaigns && this.state.hasOrg ? "我的机构" : "注册机构"
          }
        ></PageHeader>

        {this.state.hasOrg ? (
          <div>
            <Row className="action">
              <Col className="actionItems">
                {/* <b
                  onClick={() => {
                    //this.props.history.push("/admin/market/detail/" + id);
                  }}
                  className="ant-green-link cursor"
                >
                  编辑
                </b> */}
                <b
                  onClick={() => {
                    this.props.history.push("/admin/employees");
                  }}
                  className="ant-green-link cursor"
                >
                  员工管理
                </b>
                <Divider type="vertical" />
                <b
                  onClick={() => {
                    this.props.history.push("/admin/groups");
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
            {this.state.inited ? (
              <OrgFormDialog
                organize={this.state.campaigns}
                onClose={this.closeEditing}
                isNew={false}
              />
            ) : (
              <Loading />
            )}
          </div>
        ) : (
          <OrgFormDialog
            organize={this.state.campaigns}
            onClose={this.closeEditing}
            isNew={true}
          />
        )}

        <Drawer
          width={620}
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
              说明：如果某个营销机构希望邀请您的机构作为核销机构参与该营销机构发起的营销活动，您需要生成并提供一个限时有效的动态授权码给该营销机构。
            </small>
          </div>
        </Drawer>
      </div>
    );
  }
}
export default MyOrgs;
