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
} from "antd";
import moment from "moment";

import "../../index.less";
import storageUtils from "../../../../utils/storageUtils";
import { MerchantSelect } from "../../rule/index";

const dateFormat = "YYYY-MM-DD";
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

export default (props) => {
  console.log(props);
  const { basicInfo } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [showMerchantSelect, setShowMerchantSelect] = React.useState(false);
  const [orgList, setOrgList] = React.useState({});
  const [timeType, setTimeType] = React.useState("date");
  const [dateSelected, setDateSelected] = React.useState({
    effective: null,
    end: null,
  });
  const [daysAfterDist, setDaysAfterDist] = React.useState(null);

  React.useEffect(() => {
    const user = storageUtils.getUser();
    const obj = { partyId: user.id, fullName: user.orgName };
    setOrgList({ ...obj });
  }, []);

  const onFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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
    let newDate = Object.assign(
      {},
      { effective: dateString[0], end: dateString[1] }
    );
    setDateSelected({ ...newDate });
  };

  return (
    <>
      <Form
        {...layout}
        form={form}
        initialValues={{
          productPrice: 0,
          timeType: timeType,
          daysAfterDist: daysAfterDist,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          label="礼品券名称"
          name="giftName"
          rules={[{ required: true, message: "请输入礼品券名称!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="供应商名称">
          <span>{orgList.fullName}</span>
          <Button type="link" onClick={onOrgClick}>
            选择供应商
          </Button>
        </Form.Item>
        <Form.Item
          label="商品名称"
          name="productName"
          rules={[{ required: true, message: "请输入商品名称!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="SKU"
          name="sku"
          rules={[{ required: true, message: "请输入SKU!" }]}
        >
          <Input />
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
          name="productPrice"
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
                defaultValue={[
                  moment(basicInfo.effective, dateFormat),
                  moment(dateSelected.end || basicInfo.end, dateFormat),
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
};
