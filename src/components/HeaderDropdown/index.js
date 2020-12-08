import { Dropdown } from "antd";
import React from "react";
import "./index.less";

const HeaderDropdown = ({ overlayClassName: cls, ...restProps }) => {
  return (
    <Dropdown overlayClassName={`container ${cls || ""}`} {...restProps} />
  );
};

export default HeaderDropdown;
