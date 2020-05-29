import React, { Component } from "react";
import {
  DashboardOutlined,
  CheckCircleOutlined,
  BankOutlined,
  GiftOutlined,
  MoneyCollectOutlined,
  BarChartOutlined,
  LoginOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  UserOutlined,
  DollarCircleOutlined,
  PlusCircleOutlined,
  ApartmentOutlined,
  InteractionOutlined,
  TransactionOutlined,
  createFromIconfontCN,
  TagOutlined,
} from "@ant-design/icons";

const IconFont = createFromIconfontCN({
  scriptUrl: "//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js",
});

//显示antd图标组件
class AntdIcon extends Component {
  showIcon = (name) => {
    switch (name) {
      case "DashboardOutlined":
        return <DashboardOutlined />;
      case "CheckCircleOutlined":
        return <CheckCircleOutlined />;
      case "GiftOutlined":
        return <GiftOutlined />;
      case "MoneyCollectOutlined":
        return <MoneyCollectOutlined />;
      case "BarChartOutlined":
        return <BarChartOutlined />;
      case "BankOutlined":
        return <BankOutlined />;
      case "LoginOutlined":
        return <LoginOutlined />;
      case "SettingOutlined":
        return <SettingOutlined />;
      case "UnorderedListOutlined":
        return <UnorderedListOutlined />;
      case "UserOutlined":
        return <UserOutlined />;
      case "DollarCircleOutlined":
        return <DollarCircleOutlined />;
      case "PlusCircleOutlined":
        return <PlusCircleOutlined />;
      case "ApartmentOutlined":
        return <ApartmentOutlined />;
      case "MoneyCollectOutlined":
        return <MoneyCollectOutlined />;
      case "InteractionOutlined":
        return <InteractionOutlined />;
      case "TransactionOutlined":
        return <TransactionOutlined />;
      case "TagOutlined":
        return <TagOutlined />;
      default:
        return <DashboardOutlined />;
    }
  };
  render() {
    let { name } = this.props;
    return <span>{this.showIcon(name)}</span>;
  }
}
export default AntdIcon;
