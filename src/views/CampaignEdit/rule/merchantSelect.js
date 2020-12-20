import React, { useEffect, useState } from "react";
import { Button, Input, Col, Row, Table, Drawer, Switch } from "antd";

import { reqGetMerchants } from "@api";
import storageUtils from "@utils/storageUtils";
import { Loading } from "@components";
import "@css/common.less";
import comEvents from "@utils/comEvents";

/**
 *
 * @param {visible} props Boolean
 * @param {handleCancel} props Function
 * @param {handleMerchantSelection} props Function
 * @param {selectOrgList} props Array Must
 */
const MerchantSelect = (props) => {
  const { selectOrgList = [] } = props;
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
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowKeys, setRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchants, setSelectedMerchants] = useState([]);
  const [initd, setInitd] = useState(false);
  const [searchTxt, setSearchTxt] = useState("");
  const [checked, setChecked] = useState(false);

  const getMerchants = async (elements) => {
    const result = await reqGetMerchants(elements);
    const cont = result && result.data ? result.data.content : [];
    let data = [];
    if (cont && cont.length !== 0) {
      for (let i = 0; i < cont.content.length; i++) {
        data.push({
          key: cont.content[i].merchant.id.toString(),
          partyId: cont.content[i].merchant.id.toString(),
          uid: cont.content[i].merchant.uid,
          name: cont.content[i].merchant.name,
          fullName: cont.content[i].merchant.fullName,
          upCode: cont.content[i].merchant.upCode,
        });
      }
    }

    setTotalPages(cont.totalElements);
    setMerchants(data);
    setPageIndex(elements.page);
    setPageSize(elements.size);
    setLoading(false);
    setInitd(true);
  };

  useEffect(() => {
    const params = {
      page: 1,
      size: 10,
      orgUid: storageUtils.getUser().orgUid,
      searchTxt: "",
      includingSubsidiaries: false,
    };
    getMerchants(params);

    let arr = [];
    selectOrgList.forEach((item) => arr.push(item.partyId));
    setRowKeys(arr);
    setSelectedMerchants(selectOrgList);
  }, [selectOrgList]);

  const onPageChange = (page, pageSize) => {
    const params = {
      page: page,
      size: pageSize,
      orgUid: storageUtils.getUser().orgUid,
      searchTxt,
      includingSubsidiaries: checked,
    };
    getMerchants(params);
  };

  const onSubmitSelection = () => {
    props.handleSelection(selectedMerchants);
  };

  const handleSearchChange = (e) => {
    if (!e.target.value) {
      const params = {
        page: 1,
        size: pageSize,
        orgUid: storageUtils.getUser().orgUid,
        searchTxt: "",
        includingSubsidiaries: checked,
      };
      getMerchants(params);
    }
    setSearchTxt(e.target.value);
  };

  const onSearch = async () => {
    const params = {
      page: 1,
      size: pageSize,
      orgUid: storageUtils.getUser().orgUid,
      searchTxt,
      includingSubsidiaries: checked,
    };

    await getMerchants(params);
  };

  const onSelect = (record, selected, selectedRows) => {
    let tempRowKeys = [...rowKeys];
    let tempSelectedMerchants = [...selectedMerchants];

    switch (selected) {
      case true:
        tempRowKeys.push(record.key);
        tempSelectedMerchants.push(record);
        break;
      case false:
        tempRowKeys.splice(
          tempRowKeys.findIndex((item) => item === record.key),
          1
        );
        tempSelectedMerchants.splice(
          tempSelectedMerchants.findIndex((item) => item.key === record.key),
          1
        );
        break;

      default:
        break;
    }
    setRowKeys(tempRowKeys);
    setSelectedMerchants(tempSelectedMerchants);
  };

  const onSelectAll = (selected, selectedRows, changeRows) => {
    let tempRowKeys = [...rowKeys];
    let tempSelectedMerchants = [...selectedMerchants];

    switch (selected) {
      case true:
        let arr = [];
        changeRows.forEach((item) => arr.push(item.key));
        tempRowKeys = comEvents.mergeArrays(rowKeys, arr);
        tempSelectedMerchants = comEvents.mergeArrays(
          selectedMerchants,
          changeRows
        );
        break;
      case false:
        changeRows.forEach((changeRowsItem) => {
          tempRowKeys.splice(
            tempRowKeys.findIndex((item) => item === changeRowsItem.key),
            1
          );
          tempSelectedMerchants.splice(
            tempSelectedMerchants.findIndex(
              (item) => item.key === changeRowsItem.key
            ),
            1
          );
        });
        break;

      default:
        break;
    }
    setRowKeys(tempRowKeys);
    setSelectedMerchants(tempSelectedMerchants);
  };

  const onSwitchChange = async (isChecked) => {
    const params = {
      page: 1,
      size: pageSize,
      orgUid: storageUtils.getUser().orgUid,
      searchTxt,
      includingSubsidiaries: isChecked,
    };

    await getMerchants(params);
    setChecked(isChecked);
  };

  const rowSelection = {
    selectedRowKeys: rowKeys,
    onSelect,
    onSelectAll,
  };

  return (
    <Drawer
      title="选择商户"
      visible={props.visible}
      onClose={props.handleCancel}
      footer={null}
      width={580}
    >
      {initd ? (
        <div>
          <Row style={{ marginBottom: "24px" }}>
            <Col span={14}>包括下属机构的入驻商户：</Col>
            <Col offset={1}>
              <Switch
                checkedChildren="包括"
                unCheckedChildren="不包括"
                defaultChecked={false}
                onChange={onSwitchChange}
              />
            </Col>
          </Row>
          <Row style={{ marginBottom: "24px" }}>
            <Col span={14}>
              <Input
                name="searchTxt"
                value={searchTxt}
                onChange={handleSearchChange}
                placeholder="输入商户名称、标签、商户号搜索"
                allowClear
                onPressEnter={onSearch}
              />
            </Col>
            <Col offset={1}>
              <Button type="primary" className="cursor" onClick={onSearch}>
                查询
              </Button>
            </Col>
          </Row>

          <Table
            size="small"
            className="tableFont"
            rowSelection={{
              type: props.selectionType,
              ...rowSelection,
            }}
            columns={MerchantColumns}
            dataSource={merchants}
            pagination={{
              current: pageIndex,
              pageSize: pageSize,
              total: totalPages,
              onChange: onPageChange,
              showTotal: (total) => `总共 ${total} 条数据`,
            }}
          />
          <div>
            <Button
              type="primary"
              onClick={onSubmitSelection}
              loading={loading}
            >
              提交
            </Button>
            <span style={{ marginLeft: 8 }}>
              {`选择了 ${rowKeys.length} 个商户`}
            </span>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </Drawer>
  );
};

export default MerchantSelect;
