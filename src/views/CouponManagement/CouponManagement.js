import React, { useState, useLayoutEffect, useRef } from "react";
import { Table, PageHeader, Tag, Divider, notification, Popover } from "antd";
import NumberFormat from "react-number-format";
import moment from "moment";

import { queryCoupons } from "@api";
import { campaignStatusObj, couponTypes } from "@utils/constants";
import comEvents from "@utils/comEvents";
import { QueryForm } from "./components";
import "@css/common.less";
import "./CouponManagement.less";

const { Column } = Table;

const CouponManagement = () => {
  const defaultPageIndex = 1;
  const defaultPageSize = 20;
  const defaultBeginDate = comEvents.firstDayOfMonth();
  const defaultEndDate = moment(new Date(), "YYYY-MM-DD").locale("zh-cn");
  const defaultType = "OWNED";

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(defaultType);
  const [searchTxt, setSearchTxt] = useState("");
  const [page, setPage] = useState(defaultPageIndex);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [beginDate, setBeginDate] = useState(defaultBeginDate);

  const fetchData = async (elements) => {
    setLoading(true);
    try {
      const result = await queryCoupons(elements);
      if (result.data?.retcode === 0) {
        let arr = [];
        result.data?.content?.content.forEach((item, index) => {
          let valueOff = 0;
          switch (item.type) {
            case "GIFT":
              valueOff = item.product?.exchangePrice;
              break;
            case "COUPON":
              valueOff = item.discount?.valueOff;
              break;

            default:
              break;
          }
          const obj = {
            periodTime: `${item.beginDate} 至 ${item.endDate}`,
            name: item.name,
            remainingSupply: item.remainingSupply,
            totalSupply: item.totalSupply,
            type: item.type,
            camActivationTime: item.campaign?.activationTime,
            camCreatedById: item.campaign?.createdBy?.id,
            camCreatedByName: item.campaign?.createdBy?.name,
            camTags: item.campaign?.tags,
            camId: item.campaign?.id,
            camName: item.campaign?.name,
            camStatus: item.campaign?.status,
            issuerId: item.issuer?.id,
            issuerName: item.issuer?.name,
            valueOff,
            discountType: item.discount?.type,
          };
          arr.push(obj);
        });
        setData(arr);
        setTotalElements(result.data?.content?.totalElements);
      }
    } catch (error) {
      if (error.type !== "HttpError") {
        notification.error({
          message: "系统内部错误，请联系管理员！",
          description: error.ReferenceError,
        });
      }
    }
    setLoading(false);
  };

  const firstUpdate = useRef(true);
  useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    const params = {
      page: page - 1,
      size: pageSize,
      beginDate,
      endDate,
      searchTxt,
      type,
    };
    fetchData(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const onQueryClick = (elements) => {
    const [_beginDate, _endDate] = [
      elements["dateRange"][0].format("YYYY-MM-DD"),
      elements["dateRange"][1].format("YYYY-MM-DD"),
    ];
    const params = {
      page: defaultPageIndex - 1,
      size: defaultPageSize,
      beginDate: _beginDate,
      endDate: _endDate,
      searchTxt: elements.searchTxt,
      type: elements.typeSelection,
    };
    fetchData(params);

    setPage(defaultPageIndex);
    setPageSize(defaultPageSize);
    setType(elements.typeSelection);
    setSearchTxt(elements.searchTxt);
    setBeginDate(_beginDate);
    setEndDate(_endDate);
  };

  const onPageChange = (_page, _pageSize) => {
    setPage(_page);
    setPageSize(_pageSize ?? defaultPageSize);
  };

  return (
    <>
      <PageHeader
        className="site-page-header-responsive cont"
        title="票券管理"
      />
      <QueryForm
        loading={loading}
        onFinish={onQueryClick}
        type={type}
        searchTxt={searchTxt}
      />
      <Table
        rowKey={(record) => record.camId}
        size="small"
        bordered
        dataSource={data}
        pagination={{
          showSizeChanger: true,
          current: page,
          pageSize,
          total: totalElements,
          onChange: onPageChange,
          showTotal: (total) => `总共 ${total} 条数据`,
          disabled: loading,
        }}
        loading={loading}
      >
        <Column
          title="券名"
          dataIndex="name"
          key="name"
          render={(text) => <div className="couponName">{text}</div>}
        />
        <Column
          title="类型"
          dataIndex="type"
          key="type"
          width={80}
          render={(type) => <Tag color="green">{couponTypes[type]}</Tag>}
        />
        <Column title="发行机构" dataIndex="issuerName" key="issuerName" />
        <Column title="发行总数" dataIndex="totalSupply" key="totalSupply" />
        <Column
          title="剩余数量"
          dataIndex="remainingSupply"
          key="remainingSupply"
        />
        <Column title="活动名" dataIndex="camName" key="camName" />
        <Column
          title="标签"
          dataIndex="camTags"
          key="camTags"
          width={120}
          render={(tag) => {
            return (
              <>
                {tag &&
                  tag.split(",").map((item, index) => (
                    <Tag color="cyan" key={index}>
                      {item}
                    </Tag>
                  ))}
              </>
            );
          }}
        />
        <Column title="有效期" dataIndex="periodTime" key="periodTime" />
        <Column
          title="优惠金额"
          dataIndex="valueOff"
          key="valueOff"
          render={(text, record) => {
            if (record.type === "GIFT") {
              return (
                <NumberFormat
                  value={text / 100}
                  thousandSeparator={true}
                  decimalScale={2}
                  fixedDecimalScale={true}
                  displayType={"text"}
                  prefix={"(¥"}
                  suffix={")"}
                />
              );
            } else if (record.type === "COUPON") {
              if (record.discountType === "AMOUNT") {
                return (
                  <NumberFormat
                    value={text / 100}
                    displayType={"text"}
                    thousandSeparator={true}
                    decimalScale={2}
                    fixedDecimalScale={true}
                    prefix={"¥"}
                  />
                );
              } else if (record.discountType === "AMOUNT") {
                return (
                  <NumberFormat
                    value={text}
                    displayType={"text"}
                    prefix={"优惠 "}
                    suffix={"%"}
                  />
                );
              }
            }
          }}
        />
        <Column
          title="创建人"
          dataIndex="camCreatedByName"
          key="camCreatedByName"
        />

        <Column
          title="状态"
          dataIndex="camStatus"
          key="camStatus"
          render={(status) => (
            <Tag color="green">{campaignStatusObj[status]}</Tag>
          )}
        />
        <Column
          title="操作"
          key="action"
          width={150}
          render={(text) => {
            return (
              <>
                <b onClick={() => {}} className="ant-green-link cursor">
                  查看
                </b>
                <>
                  <Divider type="vertical" />
                  <b onClick={() => {}} className="ant-blue-link cursor">
                    发放
                  </b>
                </>
                <Divider type="vertical" />
                <Popover
                  placement="topLeft"
                  content={
                    <>
                      <b className="ant-blue-link cursor">批量发放</b>
                      <Divider type="vertical" />
                      <b className="ant-blue-link cursor">配券</b>
                      <Divider type="vertical" />
                      <b className="ant-blue-link cursor">增发</b>
                      <Divider type="vertical" />
                      <b className="actionError">注销</b>
                    </>
                  }
                  trigger="hover"
                >
                  <b className="ant-blue-link cursor">更多</b>
                </Popover>
              </>
            );
          }}
        />
      </Table>
    </>
  );
};

export default CouponManagement;
