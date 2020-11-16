import React from "react";
import { Drawer, Card } from "antd";

import "./DrawerView.less";

export default (props) => {
  const { visible, onClose } = props;
  return (
    <Drawer width={400} title="通知" onClose={onClose} visible={visible}>
      <Card size="small" title="Default size card" extra={<a href="#">More</a>}>
        <p>Card content</p>
        <p>Card content</p>
      </Card>
    </Drawer>
  );
};
