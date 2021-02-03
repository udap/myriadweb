import React, { useState, useEffect } from "react";
import { Modal, Input, Table, Button, notification } from "antd";

import storageUtils from "@utils/storageUtils";
import { reqGetClients, batchDistribute } from "@/api";

const { Column } = Table;

const CustomerList = (props) => {
  const defaultPage = 1;
  const defaultPageSize = 10;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTxt, setSearchTxt] = useState("");

  const [rowKeys, setRowKeys] = useState([]);
  const [distributeLading, setDistributeLading] = useState(false);

  const fetchData = async (elements) => {
    setLoading(true);
    try {
      const result = await reqGetClients(elements);
      if (result.data?.retcode === 0) {
        let arr = [];
        result.data?.content?.content.forEach((item) => {
          const obj = {
            uid: item.uid,
            id: item.id,
            name: item.name,
            cellphone: item.cellphone,
          };
          arr.push(obj);
        });
        setData(arr);
        setTotalElements(result.data?.content?.totalElements);
      }
    } catch (error) {}
    setLoading(false);
  };

  const publishItem = async () => {
    setDistributeLading(true);
    try {
      const params = {
        all: false,
        campaignId: props.campaignId,
        customers: rowKeys,
      };
      const result = await batchDistribute(params);
      if (!(result.data?.retcode && result.data?.retcode !== 0)) {
        notification.success({ message: result.data?.msg });
        props.handleCancel();
      }
    } catch (error) {}
    setDistributeLading(false);
  };

  const searchValue = (e) => {
    setSearchTxt(e);
  };

  const onPageChange = (_page, _pageSize) => {
    setPage(_page);
    setPageSize(_pageSize ?? defaultPageSize);
  };

  useEffect(() => {
    const params = {
      page: page - 1,
      size: pageSize,
      orgUid: storageUtils.getUser().orgUid,
      restricted: true,
      searchTxt,
    };
    fetchData(params);
  }, [page, pageSize, searchTxt]);

  const onSelectChange = (selectedRowKeys) => {
    setRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: rowKeys,
    onChange: onSelectChange,
  };

  return (
    <Modal
      title="票券发放"
      visible={props.visible}
      onCancel={props.handleCancel}
      footer={[
        <Button
          key="submit"
          type="primary"
          loading={distributeLading}
          onClick={publishItem}
          disabled={rowKeys.length === 0}
        >
          发放
        </Button>,
      ]}
    >
      <Input.Search
        placeholder="请输入姓名、手机号或客户标签搜索"
        onSearch={searchValue}
        enterButton
        loading={loading}
        allowClear
        style={{ paddingBottom: 24 }}
      />
      <Table
        rowKey={(record) => record.id}
        rowSelection={rowSelection}
        size="small"
        dataSource={data}
        responsive={true}
        pagination={{
          current: page,
          pageSize,
          total: totalElements,
          onChange: onPageChange,
          showTotal: (total) => `总共 ${total} 条数据`,
          disabled: loading,
        }}
      >
        <Column title="客户名称" dataIndex="name" key="name" />
        <Column title="手机号码" dataIndex="cellphone" key="cellphone" />
      </Table>
    </Modal>
  );
};

export default CustomerList;
