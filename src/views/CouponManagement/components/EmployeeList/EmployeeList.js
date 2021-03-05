import React, { useState, useEffect } from "react";
import { Modal, Table, Button, notification, InputNumber } from "antd";

import storageUtils from "@utils/storageUtils";
import { reqGetEmployees, batchTransfer } from "@/api";
import { EmployeeQueryFilter } from "@components";

const { Column } = Table;

const EmployeeList = (props) => {
  const defaultPage = 1;
  const defaultPageSize = 10;
  const defaultAmount = 1;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTxt, setSearchTxt] = useState("");

  const [rowKeys, setRowKeys] = useState([]);
  const [rows, setRows] = useState([]);
  const [distributeLading, setDistributeLading] = useState(false);

  const [includingSubsidiaries, setIncludingSubsidiaries] = useState(false);

  const fetchData = async (elements) => {
    setLoading(true);
    try {
      const result = await reqGetEmployees(elements);
      if (result.data?.retcode === 0) {
        let arr = [];
        result.data?.content?.content.forEach((item) => {
          const obj = {
            uid: item.uid,
            id: item.id,
            name: item.name,
            cellphone: item.cellphone,
            code: item.code,
            account: item.account ?? {},
            amount: defaultAmount,
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
      const arr = [];
      rows.forEach((item) => {
        const obj = {
          uid: item.uid,
          amount: item.amount,
        };
        arr.push(obj);
      });
      const params = {
        campaignId: props.campaignId,
        toEmployees: arr,
      };

      const result = await batchTransfer(params);
      if (!(result.data?.retcode && result.data?.retcode !== 0)) {
        notification.success({
          message: "操作成功",
          description: result.data?.msg,
        });
        props.handleCancel();
      }
    } catch (error) {}
    setDistributeLading(false);
  };

  const onPageChange = (_page, _pageSize) => {
    const params = {
      page: _page - 1,
      size: _pageSize ?? defaultPageSize,
      orgUid: storageUtils.getUser().orgUid,
      restricted: true,
      searchTxt,
      sort: ["org", "createTime,desc"],
      includingSubsidiaries,
      status: "ACTIVE",
    };
    fetchData(params);

    setPage(_page);
    setPageSize(_pageSize ?? defaultPageSize);
  };

  useEffect(() => {
    const params = {
      page: defaultPage - 1,
      size: defaultPageSize,
      orgUid: storageUtils.getUser().orgUid,
      restricted: true,
      searchTxt: "",
      sort: ["org", "createTime,desc"],
      includingSubsidiaries: false,
      status: "ACTIVE",
    };
    fetchData(params);
  }, []);

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setRowKeys(selectedRowKeys);
    setRows(selectedRows);
  };

  const rowSelection = {
    selectedRowKeys: rowKeys,
    onChange: onSelectChange,
  };

  const inputNumberChange = (obj) => {
    const arr = [];
    data.forEach((item) => {
      if (item.uid === obj.uid) {
        item.amount = obj.value;
      }
      arr.push(item);
    });
    setData(arr);
  };

  const onQueryFinish = (values) => {
    const params = {
      page: defaultPage - 1,
      size: defaultPageSize,
      orgUid: storageUtils.getUser().orgUid,
      restricted: true,
      searchTxt: values.searchTxt,
      sort: ["org", "createTime,desc"],
      status: "ACTIVE",
      includingSubsidiaries,
    };
    fetchData(params);

    setSearchTxt(values.searchTxt);
    setPage(defaultPage);
    setPageSize(defaultPageSize);
  };

  const onCheckboxChange = (element) => {
    const params = {
      page: page - 1,
      size: pageSize,
      orgUid: storageUtils.getUser().orgUid,
      restricted: true,
      searchTxt,
      sort: ["org", "createTime,desc"],
      includingSubsidiaries: element.target.value,
      status: "ACTIVE",
    };
    fetchData(params);

    setIncludingSubsidiaries(element.target.value);
  };

  return (
    <Modal
      title="票券配券"
      width={1000}
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
          配券
        </Button>,
      ]}
    >
      <EmployeeQueryFilter
        onFinish={onQueryFinish}
        includingSubsidiaries={includingSubsidiaries}
        onChange={onCheckboxChange}
        loading={loading}
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
        <Column title="姓名" dataIndex="name" key="name" />
        <Column title="手机号" dataIndex="cellphone" key="cellphone" />
        <Column title="编码" dataIndex="code" key="code" />
        <Column
          title="登录账号"
          dataIndex="account"
          key="account"
          render={(values) => values.name}
        />
        <Column
          title="配券数量"
          dataIndex="amount"
          key="amount"
          render={(text, record) => {
            return (
              <InputNumber
                defaultValue={text}
                onChange={(value) =>
                  inputNumberChange({ value, uid: record.uid })
                }
              />
            );
          }}
        />
      </Table>
    </Modal>
  );
};

export default EmployeeList;
