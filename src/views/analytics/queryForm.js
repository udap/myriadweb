import React from "react";
import { Form, Row, Col, DatePicker, Button, Select, Input } from "antd";
import moment from "moment";
import "moment/locale/zh-cn";

import "../../css/common.less";

const { Option } = Select;

const QueryForm = ({
  loading,
  initialData,
  onSelectBranch,
  onSelectSubBranch,
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
    employees,
    employeeUid,
    endDate,
  } = initialData;
  const onChangeBranch = (value) => {
    onSelectBranch(value);
    form.setFieldsValue({
      subBranchUid: "",
      employeeUid: "",
    });
  };
  const onChangeSubBranch = (value) => {
    onSelectSubBranch(value);
    form.setFieldsValue({
      employeeUid: "",
    });
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
        employeeUid: employeeUid,
        endDate: moment(endDate, "YYYY-MM-DD"),
      }}
    >
      <Row gutter={[16, 16]}>
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
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Form.Item name="branchUid" label="参与机构">
            <Select
              //              placeholder="请选择二级机构"
              onChange={(value) => onChangeBranch(value)}
            >
              <Option key="_bdk" value="">
                {"所有二级机构"}
              </Option>
              {branches.map((b) => (
                <Option key={b.uid}>{b.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="subBranchUid" label="下属机构">
            <Select onChange={(value) => onChangeSubBranch(value)}>
              <Option key="_sbdk" value="">
                {"所有三级机构"}
              </Option>
              {subBranches.map((s) => (
                <Option key={s.uid} value={s.uid}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="employeeUid" label="客户经理">
            <Select>
              <Option key="_edk" value="">
                所有员工
              </Option>
              {employees.map((e) => (
                <Option key={e.uid}>{e.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
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

export default QueryForm;
