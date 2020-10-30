import React from "react";
import PropTypes from "prop-types";

import { Form, Row, Col, Radio, Button, Input } from "antd";
import "../../css/common.less";

const VoucherQueryForm = (props) => {
  return (
    <Form
      onFinish={props.onFinish}
      layout="horizontal"
      name="advanced_search"
      className="ant-advanced-search-form"
      initialValues={{
        searchTxt: "",
        typeSelection: "owner",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col>
          <Form.Item name="typeSelection" label="查询条件">
            <Radio.Group
              onChange={props.onChangeType}
              buttonStyle="solid"
              defaultValue="owner"
              disabled={props.loading}
            >
              <Radio.Button value="owner">我的</Radio.Button>
              <Radio.Button value="publisherId">我的机构的</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="searchTxt">
            <Input placeholder="输入券号、券名、活动名或标签查询" allowClear />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button
              type="primary"
              className="cursor searchBtn"
              htmlType="submit"
              loading={props.loading}
              onClick={props.enableLoading}
            >
              搜索
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

VoucherQueryForm.propTypes = {
  loading: PropTypes.bool,
  enableLoading: PropTypes.func,
  onChangeType: PropTypes.func,
  onFinish: PropTypes.func,
};

export default VoucherQueryForm;
