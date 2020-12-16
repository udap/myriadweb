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
  Tag,
  message,
} from "antd";
import moment from "moment";
import { withRouter } from "react-router-dom";

import "./index.less";
import { MerchantSelect } from "../../rule/index";
import {
  reqPostConfig,
  reqPutConfig,
  reqAddCampaignRules,
  reqUpdateCampaignRules,
} from "@api";
import { ajaxError } from "@utils/constants";
import comEvents from "@utils/comEvents";

const layout = { labelCol: { span: 6 }, wrapperCol: { span: 12 } };

const tailFormItemLayout = {
  wrapperCol: { xs: { span: 4 }, sm: { span: 6 } },
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
  const [timeType, setTimeType] = React.useState("date");
  const [dateSelected, setDateSelected] = React.useState({
    effective: basicInfo.effective,
    end: basicInfo.end,
  });
  const [fields, setFields] = React.useState([]);

  React.useEffect(() => {
    let merchantArr = [];
    if (props.curInfo && props.curInfo.parties) {
      merchantArr = props.curInfo.parties.filter(
        (ele) => ele.type === "MERCHANT"
      );
    }
    if (merchantArr.length) {
      form.setFieldsValue({ orgList: [...merchantArr] });
    }

    if (props.curInfo && props.curInfo.voucherConfig) {
      const {
        effective,
        expiry,
        daysAfterDist,
        name,
        product,
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
          name: ["orgList"],
          value: merchantArr,
        },
        {
          name: ["productName"],
          value: product.name,
        },
        {
          name: ["productCode"],
          value: product.code,
        },
        {
          name: ["productMarketPrice"],
          value: product.marketPrice / 100,
        },
        {
          name: ["productExchangePrice"],
          value: product.exchangePrice / 100,
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
  }, [form, props.curInfo]);

  const onFinish = async (value) => {
    if (!props.id) {
      notification.warning({ message: "请先填写基本信息" });
      return;
    }

    // 所有价格精度为百分位
    let params = {
      name: value.giftName,
      type: "GIFT",
      product: {
        name: value.productName,
        code: value.productCode,
        marketPrice: comEvents.floatMul(value.productMarketPrice, 100),
        exchangePrice: comEvents.floatMul(value.productExchangePrice, 100),
      },
      // merchantId: orgList.partyId, // 机构id
    };
    if (timeType === "date") {
      params = {
        ...params,
        effective: dateSelected.effective,
        expiry: moment(dateSelected.end)
          .subtract(-1, "days")
          .format("YYYY-MM-DD"),
      };
    } else if (timeType === "day") {
      if (!value.daysAfterDist) {
        message.error({
          content: "请填写，有效期 => 相对时间 的有效期！",
          style: { marginTop: "20vh" },
        });
        return;
      }
      params = { ...params, daysAfterDist: value.daysAfterDist };
    }

    let result;
    setLoading(true);
    if (props.hasConfig) {
      result = await reqPutConfig(props.id, params);
    } else {
      result = await reqPostConfig(props.id, params);
    }

    let rulesParams = [];
    let partyIdArr = [];

    value.orgList.forEach((item) => {
      partyIdArr.push(item.partyId);
    });

    let obj = {
      namespace: "REDEMPTION",
      expression: "#SelectedMerchants",
      rules: [
        {
          name: "SelectedMerchants",
          option: partyIdArr.toString(),
        },
      ],
    };
    rulesParams.push(obj);

    let rulesRes;
    if (props.isNew) {
      rulesRes = await reqAddCampaignRules(props.id, rulesParams);
    } else {
      rulesRes = await reqUpdateCampaignRules(props.id, rulesParams);
    }

    setLoading(false);

    if (
      result.data.retcode !== ajaxError &&
      rulesRes.data.retcode !== ajaxError
    ) {
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
    const orgList = form.getFieldValue("orgList");
    let arr = [];
    val.forEach((ele) => {
      const isExist = orgList.some((item) => item.partyId === ele.partyId);
      if (!isExist) {
        arr.push(ele);
      }
    });
    form.setFieldsValue({ orgList: orgList.concat(arr) });
    setShowMerchantSelect(false);
  };

  const onRadioTimeChange = (e) => {
    setTimeType(e.target.value);
  };

  const changeSetDate = (date, dateString) => {
    let newDate = { effective: dateString[0], end: dateString[1] };
    setDateSelected(newDate);
  };

  const orgListChange = (item) => {
    const orgList = form.getFieldValue("orgList");
    const arr = orgList.filter((ele) => ele.partyId !== item.partyId);
    form.setFieldsValue({ orgList: [...arr] });
  };

  return (
    <>
      <Form
        {...layout}
        form={form}
        fields={fields}
        initialValues={{ timeType, orgList: [] }}
        onFinish={onFinish}
      >
        <Form.Item
          label="礼品券名称"
          name="giftName"
          rules={[{ required: true, message: "请输入礼品券名称!" }]}
        >
          <Input
            maxLength={10}
            placeholder="请输入最多10个字的礼品券名称"
            disabled={props.disabled}
          />
        </Form.Item>
        <Form.Item
          label="参与商户"
          name="orgList"
          rules={[{ required: true, message: "请选择参与商户!" }]}
        >
          {form.getFieldValue("orgList") &&
            form.getFieldValue("orgList").map((item) => (
              <Tag
                onClose={() => orgListChange(item)}
                color="blue"
                key={item.id ? item.id : item.partyId}
                closable={!props.disabled}
              >
                {item.fullName ? item.fullName : item.partyName}
              </Tag>
            ))}
          <Button type="link" onClick={onOrgClick} disabled={props.disabled}>
            选择参与商户
          </Button>
        </Form.Item>
        <Form.Item
          label="商品名称"
          name="productName"
          rules={[{ required: true, message: "请输入商品名称!" }]}
          {...tailFormItemLayout}
        >
          <Input
            maxLength={32}
            placeholder="请输入最多32个字的商品名称"
            disabled={props.disabled}
          />
        </Form.Item>
        <Form.Item
          label="SKU"
          name="productCode"
          rules={[{ required: true, message: "请输入SKU!" }]}
          {...tailFormItemLayout}
        >
          <Input
            maxLength={32}
            placeholder="参与商户需要使用相同的SKU码"
            disabled={props.disabled}
          />
        </Form.Item>
        <Form.Item
          label="商品市场零售价(元)"
          name="productMarketPrice"
          rules={[{ required: true, message: "请输入商品市场零售价!" }]}
        >
          <InputNumber min={0} disabled={props.disabled} />
        </Form.Item>
        <Form.Item
          label="商品换购价格(元)"
          name="productExchangePrice"
          rules={[{ required: true, message: "请输入商品换购价格!" }]}
        >
          <InputNumber min={0} disabled={props.disabled} />
        </Form.Item>
        <Form.Item label="有效期" name="timeType" rules={[{ required: true }]}>
          <Radio.Group
            className="timeRadio"
            onChange={onRadioTimeChange}
            value={timeType}
            disabled={props.disabled}
          >
            <Radio name="timeType" style={radioStyle} value="date">
              <span style={{ marginRight: "8px" }}>固定时间</span>
              <DatePicker.RangePicker
                value={[
                  moment(dateSelected.effective),
                  moment(dateSelected.end),
                ]}
                onChange={changeSetDate}
                disabled={props.disabled}
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
                    <InputNumber min={1} disabled={props.disabled} />
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
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={props.disabled}
          >
            提交
          </Button>
        </Form.Item>
      </Form>
      {showMerchantSelect ? (
        <MerchantSelect
          id={props.id}
          visible={showMerchantSelect}
          // selectionType="radio"
          handleCancel={handleCancel}
          handleSelection={handleMerchantSelection}
        />
      ) : null}
    </>
  );
});
