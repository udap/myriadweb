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
  TagOutlined,
  SolutionOutlined,
  SwapOutlined,
  InfoCircleOutlined,
  FundOutlined,
} from "@ant-design/icons";

// 自定义 SVG 图标
import Icon from "@ant-design/icons";
import { ReactComponent as CampaignSvg } from "@assets/images/campaign.svg";
import { ReactComponent as DistributionSvg } from "@assets/images/distribution.svg";

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
      case "InteractionOutlined":
        return <InteractionOutlined />;
      case "TransactionOutlined":
        return <TransactionOutlined />;
      case "TagOutlined":
        return <TagOutlined />;
      case "SolutionOutlined":
        return <SolutionOutlined />;
      case "SwapOutlined":
        return <SwapOutlined />;
      case "FundOutlined":
        return <FundOutlined />;
      case "CampaignSvg":
        return <Icon component={CampaignSvg} />;
      case "DistributionSvg":
        return <Icon component={DistributionSvg} />;
      default:
        return <InfoCircleOutlined />;
    }
  };
  render() {
    let { name } = this.props;
    return <span>{this.showIcon(name)}</span>;
  }
}
export default AntdIcon;
