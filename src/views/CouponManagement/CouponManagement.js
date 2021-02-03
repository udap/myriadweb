import React, { useState, useLayoutEffect, useRef } from "react";
import {
  Table,
  PageHeader,
  Tag,
  Divider,
  notification,
  Popover,
  Modal,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import NumberFormat from "react-number-format";
import moment from "moment";

import {
  queryCoupons,
  disableVouchers,
  reqIssueVouchers,
  reqGetNumber,
} from "@api";
import { campaignStatusObj, couponTypes } from "@utils/constants";
import comEvents from "@utils/comEvents";
import storageUtils from "@utils/storageUtils";
import {
  QueryForm,
  CustomerList,
  IssueForm,
  CSVModal,
  CouponDetails,
  ValueOffText,
} from "./components";
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

  const [customerVisible, setCustomerVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [additionalIssueVisible, setAdditionalIssueVisible] = useState(false);
  const [additionalIssueLoading, setAdditionalIssueLoading] = useState(false);

  const [voucherCount, setVoucherCount] = useState(0);
  const [voucherCountLoading, setVoucherCountLoading] = useState(false);
  const [csvVisible, setCSVVisible] = useState(false);
  const [action, setAction] = useState(false);

  const [detailsVisible, setDetailsVisible] = useState(false);

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
            daysAfterDist: item.daysAfterDist,
            periodTime:
              item.daysAfterDist ?? `${item.beginDate} 至 ${item.endDate}`,
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
            camAutoUpdate: item.campaign?.autoUpdate,
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

  const handleIssue = (elements) => {
    setCustomerVisible(true);
    setCurrentItem(elements);
  };

  const handleCustomerCancel = () => {
    setCustomerVisible(false);
  };

  // 注销
  const cancellation = async (elements) => {
    Modal.confirm({
      title: "确定注销此票券吗？",
      icon: <ExclamationCircleOutlined />,
      content: elements.name,
      async onOk() {
        try {
          const params = { campaignId: elements.camId };
          const result = await disableVouchers(params);
          if (result.data?.retcode === 0) {
            notification.success({ message: "注销成功！" });
            const params = {
              page: page - 1,
              size: pageSize,
              beginDate,
              endDate,
              searchTxt,
              type,
            };
            fetchData(params);
          }
        } catch (error) {}
      },
      onCancel() {},
    });
  };

  const additionalIssuance = (elements) => {
    setAdditionalIssueVisible(true);
    setCurrentItem(elements);
  };

  const onIssueFormCancel = () => {
    setAdditionalIssueVisible(false);
  };

  const onIssueVouchers = async (elements) => {
    setAdditionalIssueLoading(true);
    try {
      const params = {
        count: elements.amount,
        campaignId: currentItem.camId,
      };
      const result = await reqIssueVouchers(currentItem.camId, params);
      if (result && result.data && result.data?.content) {
        const str0 =
          "增发票券" + result.data?.content?.count + "张，后台正在处理中！";
        notification.success({ message: str0 });

        const obj = {
          page: page - 1,
          size: pageSize,
          beginDate,
          endDate,
          searchTxt,
          type,
        };
        fetchData(obj);
        onIssueFormCancel();
      }
    } catch (error) {}
    setAdditionalIssueLoading(false);
  };

  const getVoucherCount = async (campaignId, action) => {
    setVoucherCountLoading(true);
    try {
      const ownerId = storageUtils.getUser().id;
      const result = await reqGetNumber(campaignId, ownerId, action);
      if (result.data) setVoucherCount(result.data);
    } catch (error) {}
    setVoucherCountLoading(false);
  };

  const handleCSV = (_action, elements) => {
    getVoucherCount(elements.camId, _action);
    setCSVVisible(true);
    setCurrentItem(elements);
    setAction(_action);
  };

  const handleCSVCancel = () => {
    setCSVVisible(false);
  };

  const handleDetails = (elements) => {
    setDetailsVisible(true);
    setCurrentItem(elements);
  };

  const handleDetailsCancel = () => {
    setDetailsVisible(false);
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
        scroll={{ x: 2000 }}
      >
        <Column
          title="券名"
          dataIndex="name"
          key="name"
          fixed="left"
          width={250}
          render={(text) => <div className="couponName">{text}</div>}
        />
        <Column
          title="类型"
          dataIndex="type"
          key="type"
          width={100}
          render={(type) => <Tag color="green">{couponTypes[type]}</Tag>}
        />
        <Column
          title="发行机构"
          dataIndex="issuerName"
          key="issuerName"
          width={250}
        />
        <Column title="发行总数" dataIndex="totalSupply" key="totalSupply" />
        <Column
          title="剩余数量"
          dataIndex="remainingSupply"
          key="remainingSupply"
        />
        <Column title="活动名" dataIndex="camName" key="camName" width={300} />
        <Column
          title="标签"
          dataIndex="camTags"
          key="camTags"
          width={150}
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
        <Column
          title="有效期"
          dataIndex="periodTime"
          key="periodTime"
          width={250}
          render={(text, record) => {
            return (
              <div>
                {record.daysAfterDist
                  ? `发放/领取${record.daysAfterDist}天内有效`
                  : text}
              </div>
            );
          }}
        />
        <Column
          title="优惠金额"
          dataIndex="valueOff"
          key="valueOff"
          render={(text, record) => (
            <ValueOffText
              type={record.type}
              discountType={record.discountType}
              text={text}
            />
          )}
        />
        <Column
          title="创建人"
          dataIndex="camCreatedByName"
          key="camCreatedByName"
          width={150}
        />

        <Column
          title="状态"
          dataIndex="camStatus"
          key="camStatus"
          width={100}
          render={(status) => (
            <Tag color="green">{campaignStatusObj[status]}</Tag>
          )}
        />
        <Column
          title="操作"
          key="action"
          width={150}
          fixed="right"
          render={(text) => {
            return (
              <>
                <b
                  onClick={() => handleDetails(text)}
                  className="ant-green-link cursor"
                >
                  查看
                </b>
                {/* 机构发布的活动，只能查看 */}
                {type !== "OWNED_BY_ORG" && (
                  <>
                    <Divider type="vertical" />
                    <b
                      onClick={() => handleIssue(text)}
                      className="ant-blue-link cursor"
                    >
                      发放
                    </b>
                    <Divider type="vertical" />
                    <Popover
                      placement="topLeft"
                      content={
                        <>
                          <b
                            onClick={() => handleCSV("distribution", text)}
                            className="ant-blue-link cursor"
                          >
                            批量发放
                          </b>
                          <Divider type="vertical" />
                          <b
                            onClick={() => handleCSV("transfer", text)}
                            className="ant-blue-link cursor"
                          >
                            配券
                          </b>
                          {storageUtils.getUser().id ===
                            Number(text.camCreatedById) && (
                            <>
                              <Divider type="vertical" />
                              <b
                                onClick={() => additionalIssuance(text)}
                                className="ant-blue-link cursor"
                              >
                                增发
                              </b>
                              <Divider type="vertical" />
                              <b
                                onClick={() => cancellation(text)}
                                className="actionError"
                              >
                                注销
                              </b>
                            </>
                          )}
                        </>
                      }
                      trigger="hover"
                    >
                      <b className="ant-blue-link cursor">更多</b>
                    </Popover>
                  </>
                )}
              </>
            );
          }}
        />
      </Table>
      {customerVisible && (
        <CustomerList
          visible={customerVisible}
          campaignId={currentItem.camId}
          handleCancel={handleCustomerCancel}
        />
      )}
      {additionalIssueVisible && (
        <IssueForm
          loading={additionalIssueLoading}
          visible={additionalIssueVisible}
          onSubmit={onIssueVouchers}
          onClose={onIssueFormCancel}
          data={currentItem}
        />
      )}
      {csvVisible && (
        <CSVModal
          loading={voucherCountLoading}
          visible={csvVisible}
          number={voucherCount}
          data={currentItem}
          action={action}
          handleCancel={handleCSVCancel}
        />
      )}
      {detailsVisible && (
        <CouponDetails
          visible={detailsVisible}
          handleCancel={handleDetailsCancel}
          data={currentItem}
        />
      )}
    </>
  );
};

export default CouponManagement;
