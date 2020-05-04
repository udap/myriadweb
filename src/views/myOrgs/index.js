import React, { Component } from "react";
import { PageHeader } from "antd";
import storageUtils from "../../utils/storageUtils";
import { Loading } from "../../components";
import { regGetCurOrg } from "../../api";
import OrgFormDialog from "./orgFormDialog";

//没有数据组件
class MyOrgs extends Component {
  state = {
    inited: false,
    campaigns: {},
    hasOrg: false,
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

  closeEditing = (changed,uid) => {
    this.setState({
      isNew: false,
      inited: false,
      hasOrg: true,
    });
    if (changed) this.regGetCurOrg(uid);
  };

  render() {
    return (
      <div style={{ height: "100%" }}>
        <PageHeader
          className="site-page-header-responsive"
          //onBack={() => window.history.back()}
          title={
            this.state.campaigns && this.state.hasOrg ? "我的机构" : "注册机构"
          }
        ></PageHeader>
        {this.state.hasOrg ? (
          <div>
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
      </div>
    );
  }
}
export default MyOrgs;
