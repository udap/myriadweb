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
import comEvents from "../../../utils/comEvents";

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
    isNew: true,
    id: null,
    merchants: [], // current page merchants
    selectedMerchants: [],
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
  // obtain authorized merchants of current org
  getMerchants = async (currentPage, searchTxt) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      orgUid: storageUtils.getUser().orgUid,
//      excludeCampaignId: this.state.id,
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
      currentPage: currentPage,
      total:
        result && result.data && result.data.content ? cont.totalElements : 1,
      loading: false,
      inited: true,
    });
  };
  onPageChange = (page) => {
    // this.setState({
    //   currentPage: page,
    // });
    this.getMerchants(page);
  };

  onSubmitSelection = () => {
    this.setState({ loading: true });
    let selectedMerchants = this.state.selectedMerchants;
    this.setState({
      merchants: [],
      selectedRowKeys: [],
      selectedMerchants: [],
      loading: false,
    });
    this.props.handleSelection(selectedMerchants);
  };
  handleOrgChange = (e) => {
    this.setState({
      searchTxt: e.target.value,
    });
    // this.getMerchants(1);
  };
  onSearch = (value) => {
    this.setState({
      currentPage: 1,
      selectedRowKeys: [],
    });
    this.getMerchants(1, this.state.searchTxt);
  };
  onSelectChange = (selectedRowKeys, selectedRows) => {
    // let merchants = this.state.merchants || [];
    // let selectedMerchants = [];
    // for (var i = 0; i < selectedRowKeys.length; i++) {
    //   for (var j = 0; j < merchants.length; j++) {
    //     if (merchants[j].key === selectedRowKeys[i])
    //       selectedMerchants.push(merchants[j]);
    //   }
    // }
    // merge previous selections
    let selectedMerchants = comEvents.mergeArrays(this.state.selectedMerchants,selectedRows);
    let rowKeys = comEvents.mergeArrays(this.state.selectedRowKeys,selectedRowKeys);
    this.setState({
      selectedRowKeys: rowKeys,
      selectedMerchants: selectedMerchants,
    });
  };
  onSelect = (record, selected, selectedRows) => {
    if (!selected) {
      let {selectedRowKeys} = this.state;
      selectedRowKeys.splice(selectedRowKeys.findIndex(item => item === record.key), 1);
      this.setState({
        selectedRowKeys: selectedRowKeys,
      });
    }
  }
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
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.onSelect,
//      hideDefaultSelections: true,
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
              rowSelection={rowSelection}
              columns={MerchantColumns}
              dataSource={merchants}
              pagination={{
                current: currentPage,
                pageSize: size,
                total: this.totalPages,
                onChange: this.onPageChange,
                showTotal: (total) => `总共 ${total} 条数据`,
                showSizeChanger: false,
              }}
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