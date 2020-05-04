import React, { Component } from "react";
import {
  Modal,
  Button,
  Input,
  Row,
  Col,
  Pagination,
  Table,
} from "antd";
//加载中

//没有数据组件
class ModalTable extends Component {
  
    render() {
       const {
         /*客户 */
         current,
         listSize,
         listTotal,
         listData,
         searchClientTxt,
       } = this.state;
    return (
      <div>
        <Modal
          title="选择营销机构"
          visible={this.state.visible}
          onCancel={this.props.handleCancel}
          footer={[]}
        >
          <div>
            <Row style={{ marginBottom: "24px" }}>
              <Col span={14}>
                <Input
                  name="searchClientTxt"
                  value={searchClientTxt}
                  onChange={this.handleClientChange}
                  placeholder="请输入客户姓名、手机号搜索"
                  allowClear
                />
              </Col>
              <Col span={6}>
                <Button
                  type="primary"
                  className="cursor"
                  onClick={this.searchValue}
                >
                  查询
                </Button>
              </Col>
            </Row>
            <Table
              size="small"
              columns={this.listColumns}
              dataSource={listData}
              pagination={false}
              responsive={true}
              // scroll={{
              //   y: 300,
              // }}
            />

            <div className="pagination">
              <Pagination
                pageSize={listSize}
                current={current}
                onChange={this.handleListTableChange}
                total={this.totalListPages}
                showTotal={(listTotal) => `总共 ${listTotal} 条数据`}
                showSizeChanger={false}
                size="small"
                //onShowSizeChange={this.onShowSizeChange}
              />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
export default ModalTable;
