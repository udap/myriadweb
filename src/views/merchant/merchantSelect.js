import React, { Component } from "react";
import { Input, Table } from "antd";
import { reqGetMerchants } from "../../api";
import storageUtils from "../../utils/storageUtils";
import { Loading } from "../../components";
import "../../css/common.less";
import "./index.less";

const { Search } = Input;

const MerchantColumns = [
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "地址",
    dataIndex: "address",
    key: "address",
    ellipsis: true,
  },
];

class MerchantSelect extends Component {
  state = {
    inited: false,
    currentPage: 1,
    size: 16,
    total: 1,
    searchTxt: "",
    merchants: [],
  };

  componentDidMount() {
    this.getMerchants(1); //this.state.currentPage
  }

  // obtain authorized merchants of current org
  getMerchants = async (currentPage, searchTxt) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      orgUid: storageUtils.getUser().orgUid,
      ancestorOnly: true,
      enabled: true,
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
          address: cont.content[i].merchant.address,
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
    this.setState({
      currentPage: page,
    });
    this.getMerchants(page);
  };

  queryMerchants = (value) => {
    this.setState({
      currentPage: 1,
      searchTxt: value,
    });
    // get merchants
    this.getMerchants(1, value);
  };

  render() {
    const { merchants, size, currentPage, loading } = this.state;
    return (
      <div>
        <p className="description">
          请从当前机构的所有上级机构的入驻商户中选择商户入驻当前机构
        </p>
        {/* --搜索栏-- */}
        <Search
          placeholder="输入商户名、电话、地址或商户号搜索"
          onSearch={this.queryMerchants}
          enterButton
          loading={loading}
          allowClear
        />
        {this.state.inited ? (
          <Table
            size="small"
            className="table-small"
            rowSelection={{
              type: "radio",
              onChange: (selectedRowKeys, selectedRows) => {
                this.props.onSelectMerchant(selectedRows);
              },
            }}
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
        ) : (
          <Loading />
        )}
      </div>
    );
  }
}

export default MerchantSelect;
