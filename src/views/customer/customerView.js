import React, { Component } from "react";
import { Row, Col, Drawer, Descriptions } from "antd";

class CustomerView extends Component {
  render() {
    let { selectedCustomer } = this.props;
    return (
      <div>
        <Drawer
          title="客户详情"
          onClose={this.props.onClose}
          visible={this.props.visible}
          width={480}
        >
          <Row>
            <Col span={24}>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="姓名">
                  {selectedCustomer.name}
                </Descriptions.Item>
                <Descriptions.Item label="手机号">
                  {selectedCustomer.cellphone}
                </Descriptions.Item>
                <Descriptions.Item label="员工编码">
                  {selectedCustomer.code ? selectedCustomer.code : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="客户经理">
                  {selectedCustomer.employee
                    ? selectedCustomer.employee.name
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="员工所在机构">
                  {selectedCustomer.organization
                    ? selectedCustomer.organization.name
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="客户等级">
                  {selectedCustomer.ranking?selectedCustomer.ranking:'-'}
                </Descriptions.Item>
                <Descriptions.Item label="备注">
                  {selectedCustomer.remarks?selectedCustomer.remarks:'-'}
                </Descriptions.Item>
                <Descriptions.Item label="添加时间">
                  {selectedCustomer.createTime}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Drawer>
      </div>
    );
  }
}

export default CustomerView;
