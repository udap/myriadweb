import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
  Tag,
  Divider,
  Modal,
  notification,
  Row,
  Col,
  Pagination,
  Popover,
} from "antd";
import NumberFormat from "react-number-format";

import storageUtils from "@utils/storageUtils";
import {
  reqGetCoupons,
  reqGetVoucherById,
  reqPublishDis,
  reqGetClients,
  queryCoupons,
} from "@api";
import { Loading } from "@components";
import { couponStatuses, couponSubTypes } from "@utils/constants";
import comEvents from "@utils/comEvents";
import { CouponDetails, QueryForm } from "./components";
import "@css/common.less";
import "./CouponManagement.less";

const { Column } = Table;

const CouponManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("OWNED");

  const fetchData = async (_type, elements) => {
    setLoading(true);
    try {
      const result = await queryCoupons(_type, elements);
      console.log(result);
      // if (data.entries && data.entries.length !== 0) {
      //   const cont = data.entries;
      //   let arr = [];
      //   if (cont && cont.length !== 0) {
      //     for (let i = 0; i < cont.length; i++) {
      //       let type = cont[i].config.discount
      //         ? cont[i].config.discount.type
      //         : "";
      //       arr.push({
      //         key: i,
      //         id: cont[i].id,
      //         owner: cont[i].owner,
      //         code: cont[i].code,
      //         type,
      //         subType: cont[i].config.type,
      //         tags: cont[i].category,
      //         name: cont[i].config.name,
      //         valueOff:
      //           cont[i].config.type === "COUPON" && cont[i].config.discount
      //             ? cont[i].config.discount.valueOff
      //             : cont[i].config.type === "GIFT" && cont[i].config.product
      //             ? cont[i].config.product.exchangePrice
      //             : null,
      //         during: [
      //           cont[i].effective,
      //           comEvents.formatExpiry(cont[i].expiry),
      //         ],
      //         status: cont[i].status,
      //         campaign: cont[i].campaign,
      //       });
      //     }
      //   }
      //   setData(arr);
      // }
    } catch (error) {}
    setLoading(false);
  };

  const firstUpdate = useRef(true);
  useLayoutEffect(() => {
    // 页面首次加载不执行
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    const params = {
      page: 0,
      size: 10,
      beginDate: "2021-01-01",
      endDate: "2021-01-25",
      searchTxt: "",
    };
    fetchData(type, params);
  }, [type]);

  const onQueryClick = (elements) => {
    console.log("onQueryClick", elements);
    const [beginDate, endDate] = [
      elements["dateRange"][0].format("YYYY-MM-DD"),
      elements["dateRange"][1].format("YYYY-MM-DD"),
    ];
    console.log(beginDate, endDate);
  };

  return (
    <>
      <PageHeader
        className="site-page-header-responsive cont"
        title="票券管理"
      />
      <QueryForm loading={loading} onFinish={onQueryClick} type={type} />
      <Table
        rowKey="key"
        size="small"
        bordered
        dataSource={data}
        // pagination={{
        //   current: currentPage,
        //   pageSize: size,
        //   total: this.totalPages,
        //   onChange: this.handleTableChange,
        //   showTotal: (total) => `总共 ${total} 条数据`,
        //   disabled: loading,
        // }}
        loading={loading}
      >
        <Column
          title="券名"
          dataIndex="name"
          key="name"
          render={(text) => <div className="couponName">{text}</div>}
        />
        <Column title="类型" dataIndex="subType" key="subType" />
        <Column title="发行机构" dataIndex="code" key="code" />
        <Column title="发行总数" dataIndex="name" key="name" />
        <Column title="剩余数量" dataIndex="name" key="name" />
        <Column title="活动名" dataIndex="name" key="name" />
        <Column title="标签" dataIndex="name" key="name" />
        <Column title="有效期" dataIndex="name" key="name" />
        <Column title="优惠金额" dataIndex="name" key="name" />
        <Column title="创建人" dataIndex="name" key="name" />
        <Column title="状态" dataIndex="name" key="name" />
        <Column
          title="操作"
          dataIndex="action"
          key="action"
          render={() => {
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
