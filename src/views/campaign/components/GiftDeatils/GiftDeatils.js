import React from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Col,
  DatePicker,
  notification,
} from "antd";
import moment from "moment";
import { withRouter } from "react-router-dom";

import "../../index.less";
import storageUtils from "../../../../utils/storageUtils";
import { MerchantSelect } from "../../rule/index";
import { reqPostConfig, reqPutConfig } from "../../../../api/index";
import { ajaxError } from "../../../../utils/constants";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};
//垂直的单选
const radioStyle = {
  display: "block",
  height: "30px",
  lineHeight: "30px",
  marginBottom: "15px",
};

export default withRouter((props) => {
  const { basicInfo } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [showMerchantSelect, setShowMerchantSelect] = React.useState(false);
  const [orgList, setOrgList] = React.useState({});
  const [timeType, setTimeType] = React.useState("date");
  const [dateSelected, setDateSelected] = React.useState({
    effective: basicInfo.effective,
    end: basicInfo.end,
  });
  const [fields, setFields] = React.useState([]);

  React.useEffect(() => {
    const user = storageUtils.getUser();
    let orgObj = { partyId: user.id, fullName: user.orgName };
    if (props.curInfo && props.curInfo.parties) {
      let merchantObj = props.curInfo.parties.find(
        (ele) => ele.type === "MERCHANT"
      );
      orgObj = {
        partyId: merchantObj.partyId,
        fullName: merchantObj.partyName,
      };
    }
    setOrgList({ ...orgObj });

    if (props.curInfo && props.curInfo.voucherConfig) {
      const {
        effective,
        expiry,
        daysAfterDist,
        name,
        productName,
        productCode,
        productMarketPrice,
        productExchangePrice,
      } = props.curInfo.voucherConfig;

      let tempTimeType = "date";
      if (!daysAfterDist) {
        const dateObj = { effective, end: expiry };
        setDateSelected({ ...dateObj });
      } else {
        tempTimeType = "day";
      }

      const arr = [
        {
          name: ["giftName"],
          value: name,
        },
        {
          name: ["productName"],
          value: productName,
        },
        {
          name: ["productCode"],
          value: productCode,
        },
        {
          name: ["productMarketPrice"],
          value: productMarketPrice / 100,
        },
        {
          name: ["productExchangePrice"],
          value: productExchangePrice / 100,
        },
        {
          name: ["daysAfterDist"],
          value: daysAfterDist,
        },
        {
          name: ["timeType"],
          value: tempTimeType,
        },
      ];
      setFields(arr);
    }
  }, [props.curInfo]);

  const onFinish = async (value) => {
    if (!props.id) {
      notification.warning({ message: "请先填写基本信息" });
      return;
    }

    setLoading(true);

    // 所有价格精度为百分位
    let params = {
      name: value.giftName,
      type: "GIFT",
      productName: value.productName,
      productCode: value.productCode,
      productMarketPrice: value.productMarketPrice * 100,
      productExchangePrice: value.productExchangePrice * 100,
      merchantId: orgList.partyId, // 机构id
    };
    if (timeType === "date") {
      params = {
        ...params,
        effective: dateSelected.effective,
        expiry: dateSelected.end,
      };
    } else if (timeType === "day") {
      params = { ...params, daysAfterDist: value.daysAfterDist };
    }

    let result;
    if (props.hasConfig) {
      result = await reqPutConfig(props.id, params);
    } else {
      result = await reqPostConfig(props.id, params);
    }

    setLoading(false);

    if (result.data.retcode !== ajaxError) {
      props.history.replace("/admin/campaign");
    }
  };

  const onOrgClick = () => {
    setShowMerchantSelect(true);
  };

  const handleCancel = () => {
    setShowMerchantSelect(false);
  };

  const handleMerchantSelection = (val) => {
    setOrgList({ ...val[0] });
    setShowMerchantSelect(false);
  };

  const onRadioTimeChange = (e) => {
    setTimeType(e.target.value);
  };

  const changeSetDate = (date, dateString) => {
    let newDate = { effective: dateString[0], end: dateString[1] };
    setDateSelected(newDate);
  };

  return (
    <>
      <Form
        {...layout}
        form={form}
        fields={fields}
        initialValues={{ timeType }}
        onFinish={onFinish}
      >
        <Form.Item
          label="礼品券名称"
          name="giftName"
          rules={[{ required: true, message: "请输入礼品券名称!" }]}
        >
          <Input maxLength={10} placeholder="请输入最多10个字的礼品券名称" />
        </Form.Item>
        <Form.Item label="参与商户">
          <span>{orgList.fullName}</span>
          <Button type="link" onClick={onOrgClick}>
            选择参与商户
          </Button>
        </Form.Item>
        <Form.Item
          label="商品名称"
          name="productName"
          rules={[{ required: true, message: "请输入商品名称!" }]}
        >
          <Input maxLength={32} placeholder="请输入最多32个字的商品名称" />
        </Form.Item>
        <Form.Item
          label="SKU"
          name="productCode"
          rules={[{ required: true, message: "请输入SKU!" }]}
        >
          <Input maxLength={32} placeholder="请输入最多32个字的SKU" />
        </Form.Item>
        <Form.Item
          label="商品市场零售价(元)"
          name="productMarketPrice"
          rules={[{ required: true, message: "请输入商品市场零售价!" }]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          label="商品换购价格(元)"
          name="productExchangePrice"
          rules={[{ required: true, message: "请输入商品换购价格!" }]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item label="有效期" name="timeType">
          <Radio.Group
            className="timeRadio"
            onChange={onRadioTimeChange}
            value={timeType}
          >
            <Radio name="timeType" style={radioStyle} value="date">
              <span style={{ marginRight: "8px" }}>固定时间</span>
              <DatePicker.RangePicker
                value={[
                  moment(dateSelected.effective),
                  moment(dateSelected.end),
                ]}
                onChange={changeSetDate}
              />
            </Radio>
            <Radio style={radioStyle} name="timeType" value="day">
              <Row style={{ display: "inline-flex" }}>
                <Col>
                  <span>相对时间</span>
                </Col>
                <Col>
                  <span className="radioSpan">发放/领取后</span>
                </Col>
                <Col>
                  <Form.Item name="daysAfterDist">
                    <InputNumber min={1} />
                  </Form.Item>
                </Col>
                <Col>
                  <span className="radioSpan">天内有效</span>
                </Col>
              </Row>
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            提交
          </Button>
        </Form.Item>
      </Form>
      {showMerchantSelect ? (
        <MerchantSelect
          id={props.id}
          visible={showMerchantSelect}
          selectionType="radio"
          handleCancel={handleCancel}
          handleSelection={handleMerchantSelection}
        />
      ) : null}
    </>
  );
});
