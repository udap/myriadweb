import React from "react";
import { Modal, Result, Typography, Button } from "antd";

const { Paragraph } = Typography;

const ModalResult = (props) => {
  return (
    <Modal
      width={720}
      visible={props.visible}
      onCancel={props.onCancel}
      destroyOnClose
      footer={null}
    >
      <Result status={props.resultData.status} title={props.resultData.title}>
        <Paragraph>{props.resultData.valid}</Paragraph>
        {props.resultData.merchantAuthCode ? (
          <Paragraph>机构注册码：{props.resultData.merchantAuthCode}</Paragraph>
        ) : null}
        {!props.resultData.orgUid ? (
          <div style={{ textAlign: "center" }}>
            <Button type="primary" onClick={props.handleRegistrar}>
              注册机构
            </Button>
          </div>
        ) : null}
      </Result>
    </Modal>
  );
};

export default ModalResult;
