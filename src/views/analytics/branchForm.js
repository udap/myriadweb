import React, { useState } from "react";
import { Form, Row, Col, DatePicker, Button, Select, Input } from "antd";
import moment from "moment";
import "moment/locale/zh-cn";

import "../../css/common.less";

const { Option } = Select;

const BranchForm = ({
  loading,
  initialData,
  onSelectSummaryLevel,
  onSelectBranch,
  onLoading,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const {
    campaignOrgs,
    campaignOrgUid,
    campaignName,
    campaignTag,
    branches,
    branchUid,
    subBranches,
    subBranchUid,
    summaryLevel,
    endDate,
  } = initialData;
  const [disabled, setDisabled] = useState(summaryLevel === "L2");
  const onChangeBranch = (value) => {
    onSelectBranch(value);
    form.setFieldsValue({
      subBranchUid: "",
    });
  };
  const onChangeLevel = (value) => {
    onSelectSummaryLevel(value);
    if (value === "L2") setDisabled(true);
    else setDisabled(false);
  };
  return (
    <Form
      form={form}
      onFinish={onSubmit}
      layout="horizontal"
      name="advanced_search"
      className="ant-advanced-search-form"
      initialValues={{
        campaignOrgUid: campaignOrgUid,
        campaignName: campaignName,
        campaignTag: campaignTag,
        branchUid: branchUid,
        subBranchUid: subBranchUid,
        summaryLevel: summaryLevel,
        endDate: moment(endDate, "YYYY-MM-DD"),
      }}
    >
      <Row gutter={[8, 8]}>
        <Col span={6}>
          <Form.Item name="campaignOrgUid" label="活动机构">
            <Select placeholder="请选择活动发起机构">
              {campaignOrgs.map((org) => (
                <Option key={org.uid}>{org.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="campaignName" label="活动名称">
            <Input placeholder="允许模糊匹配" allowClear />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="campaignTag" label="活动标签">
            <Input placeholder="允许模糊匹配" allowClear />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col span={6}>
          <Form.Item name="summaryLevel" label="汇总层级">
            <Select onChange={(value) => onChangeLevel(value)}>
              <Option key="level2" value="L2">
                按二级机构汇总
              </Option>
              <Option key="level3" value="L3">
                按三级机构汇总
              </Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="branchUid" label="参与机构">
            <Select onChange={(value) => onChangeBranch(value)}>
              <Option key={"_bdk"} value={""}>
                {"所有二级机构"}
              </Option>
              {branches.map((b) => (
                <Option key={b.uid} value={b.uid}>
                  {b.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="subBranchUid" label="下属机构">
            <Select disabled={disabled}>
              <Option key="_sbdk" value="">
                {"所有下属机构"}
              </Option>
              {subBranches.map((s) => (
                <Option key={s.uid} value={s.uid}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col span={8}>
          <Form.Item name="endDate" label="截止时间">
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button
              type="primary"
              className="cursor searchBtn"
              htmlType="submit"
              loading={loading}
              onClick={onLoading}
            >
              查询
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default BranchForm;
