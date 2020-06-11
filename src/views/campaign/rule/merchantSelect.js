import React, { Component } from "react";
import { Button, Input, Col, Row, Table,Drawer } from "antd";
import {
  reqGetMerchants,
  reqPostParties
} from "../../../api";
import storageUtils from "../../../utils/storageUtils";
import { Loading } from "../../../components";
import "../../../css/common.less";
import "../index.less";

const MerchantColumns = [
  {
    title: "商户名称",
    dataIndex: "fullName",
    key: "fullName",
  },
  {
    title: "银联商户码",
    dataIndex: "upCode",
    key: "upCode",
  },
];

class MerchantSelect extends Component {
  state = {
    currentPage: 1,
    currentListPage: 1,
    listSize: 10,
    size: 10,
    total: 10,
    data: [],
    selectedRowKeys: [], // Check here to configure the default column
    loading: false,
    value: 1,
    list: [],
    isNew: true,
    id: null,
    parties: [],
    visible: false,
    inited: false,
  };
  componentDidMount() {
    let id = this.props.id;
    this.setState({
      id:id
    })
    this.getMerchants(1); //this.state.currentPage
  }

  getMerchants = async (currentPage, searchTxt) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      orgUid: storageUtils.getUser().orgUid,
      excludeCampaignId: this.state.id,
      searchTxt: searchTxt ? searchTxt : this.state.searchTxt,
    };
    const result = await reqGetMerchants(parmas);
    const cont = result && result.data ? result.data.content : [];
    let data = [];
    if (cont && cont.length !== 0) {
      for (let i = 0; i < cont.content.length; i++) {
        data.push({
          key: cont.content[i].merchant.id.toString(),
          partyId: cont.content[i].merchant.id,
          uid: cont.content[i].merchant.uid,
          name: cont.content[i].merchant.name,
          fullName: cont.content[i].merchant.fullName,
          upCode: cont.content[i].merchant.upCode,
        });
      }
    }
    this.totalPages =
      result && result.data && result.data.content ? cont.totalElements : 1;
    this.setState({
      merchants: data,
      total:
        result && result.data && result.data.content ? cont.totalElements : 1,
      loading: false,
      inited: true,
    });
  };

  onSelectChange = (selectedRowKeys) => {
    this.setState({
      selectedRowKeys,
    });
  };

  onPageChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getMerchants(page);
  };

  onSubmitSelection = () => {
    this.setState({ loading: true });
    let selectedRowKeys = this.state.selectedRowKeys || [];
    let merchants = this.state.merchants || [];
    let selections = [];
    for (var i = 0; i < selectedRowKeys.length; i++) {
      for (var j = 0; j < merchants.length; j++) {
        if (merchants[j].key === selectedRowKeys[i])
          selections.push(merchants[j]);
      }
    }

    this.setState({
      merchants: [],
      selectedRowKeys: [],
      loading: false,
    });
    
    if (selectedRowKeys.length !== 0) {
      for (var i = 0; i < selectedRowKeys.length; i++) {
        this.state.list.push({ partyId: selectedRowKeys[i], type: "MERCHANT" });
      }
//      this.addItem(this.state.list);
    }
    this.props.handleSelection(selections, selectedRowKeys);
  };
  addItem = async (newList) => {
    let params = {
      parts: newList,
    };
    const result = await reqPostParties(this.state.id, params);
    
  };

  render() {
    const {
      loading,
      selectedRowKeys,
      merchants,
      size,
      currentPage,
      searchTxt,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      hideDefaultSelections: true,
      //selections: [Table.SELECTION_ALL],
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <Drawer
        className="markrt"
        title="选择商户"
        visible={this.props.visible}
        onClose={this.props.handleCancel}
        footer={null}
        width={480}
      >
        {this.state.inited ? (
          <div>
            <Row style={{ marginBottom: "24px" }}>
              <Col span={14}>
                <Input
                  name="searchTxt"
                  value={searchTxt}
                  onChange={this.handleOrgChange}
                  placeholder="输入商户名称、标签、商户号搜索"
                  allowClear
                  onPressEnter={this.onSearch}
                />
              </Col>
              <Col span={6} offset={1}>
                <Button
                  type="primary"
                  className="cursor"
                  onClick={this.onSearch}
                >
                  查询
                </Button>
              </Col>
            </Row>

            <Table
              size="small"
              className="tableFont"
              columns={MerchantColumns}
              dataSource={merchants}
              pagination={{
                current: currentPage,
                pageSize: size,
                total: this.totalPages,
                onChange: this.onPageChange,
                showTotal: (total) => `总共 ${total} 条数据`,
              }}
              rowSelection={rowSelection}
            />
            <div>
              <Button
                type="primary"
                onClick={this.onSubmitSelection}
                disabled={!hasSelected}
                loading={loading}
              >
                提交
              </Button>
              <span style={{ marginLeft: 8 }}>
                {hasSelected ? `选择了 ${selectedRowKeys.length} 个商户` : ""}
              </span>
            </div>
          </div>
        ) : (
          <Loading />
        )}
      </Drawer>
    );
  }
}

export default MerchantSelect;