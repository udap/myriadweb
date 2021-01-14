import React from "react";
import { Form, Row, Col, Radio, Button, Input } from "antd";

import "@css/common.less";

const SearchForm = (props) => {
  const onFinish = (values) => {
    props.searchValue(values);
  };

  const onChangeType = (e) => {
    props.refresh(e.target.value);
  };

  const onValuesChange = ({ searchTxt }) => {
    if (searchTxt !== undefined) {
      props.refreshSearchTxt(searchTxt);
    }
  };

  return (
    <Form
      onFinish={onFinish}
      layout="horizontal"
      name="advanced_search"
      className="ant-advanced-search-form"
      initialValues={{
        searchTxt: props.searchTxt,
        group: props.restricted,
      }}
      onValuesChange={onValuesChange}
    >
      <Row gutter={[16, 16]}>
        <Col>
          <Form.Item name="group" label="查询条件">
            <Radio.Group
              onChange={onChangeType}
              buttonStyle="solid"
              disabled={props.loading}
            >
              {props.texts.map((item, index) => (
                <Radio.Button key={index} value={item.value}>
                  {item.name}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="searchTxt">
            <Input
              placeholder={props.placeholder}
              allowClear
              disabled={props.loading}
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button
              type="primary"
              className="cursor searchBtn"
              htmlType="submit"
              loading={props.loading}
            >
              搜索
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchForm;
