import React, { useState } from "react";
import {
  Modal,
  Descriptions,
  Popover,
  Button,
  Space,
  notification,
  Divider,
} from "antd";
import ReactFileReader from "react-file-reader";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import FileSaver from "file-saver";

import {
  reqDownloadTemplate,
  reqBatchTransfer,
  reqBatchDistribution,
} from "@/api";

import "./CSVModal.less";

const typeName = {
  transfer: "配券文件",
  distribution: "批量发放文件",
};

const typeTitle = {
  transfer: "配券",
  distribution: "批量发放",
};

const CSVModal = (props) => {
  const [isUpload, setIsUpload] = useState(false);

  const handleDownload = (type = "") => {
    const filename = `${props.action}Template${type}.csv`;
    reqDownloadTemplate(filename)
      .then((response) => {
        FileSaver.saveAs(response.data, filename);
      })
      .catch(() => {
        notification.warning({
          message: "下载失败，请稍后再试",
        });
      });
  };

  /**
   * 1，分配票券，当前可分配数量为0时，不能分配
   * 2，分发票券，当前可发放数量为0，且不允许增发时，不能分发 */
  const isAction =
    props.action === "transfer"
      ? props.number === 0
      : props.number === 0 && !props.data.camAutoUpdate;

  const handleFiles = async (files) => {
    if (files[0].size > 10 * 1000000) {
      notification.error({
        message: "上传文件大小限制10M！",
      });
      return;
    }

    let reader = new FileReader();
    reader.onload = function (e) {};
    reader.readAsText(files[0]);

    let formData = new FormData();
    formData.append("csvFile", files[0]);
    formData.append("campaignId", props.data?.camId);

    let result;
    /**
     * transfer 配券
     * distributions 批量发放
     */
    switch (props.action) {
      case "transfer":
        setIsUpload(true);
        try {
          result = await reqBatchTransfer(formData);
          if (!(result.data?.retcode && result.data?.retcode !== 0)) {
            notification.success({
              message: "配券成功！",
              description: result.data?.msg,
              duration: 6,
            });
            props.handleCancel();
          }
        } catch (error) {}
        setIsUpload(false);
        break;

      case "distribution":
        setIsUpload(true);
        try {
          result = await reqBatchDistribution(formData);
          if (!(result.data?.retcode && result.data?.retcode !== 0)) {
            notification.success({
              message: "批量发放成功！",
              description: result.data?.msg,
              duration: 6,
            });
            props.handleCancel();
          }
        } catch (error) {}
        setIsUpload(false);
        break;

      default:
        break;
    }
  };

  return (
    <Modal
      title={typeTitle[props.action]}
      visible={props.visible}
      onCancel={props.handleCancel}
      footer={null}
      destroyOnClose
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div className="market-number">
          {props.action === "transfer" ? (
            <span>当前可分配数量：{props.number}</span>
          ) : (
            <span>
              当前可发放数量：
              {props.loading ? (
                <LoadingOutlined />
              ) : (
                <span>
                  {props.number}（{props.data?.camAutoUpdate ? "" : "不"}
                  允许增发）
                </span>
              )}
            </span>
          )}
        </div>
        <Descriptions
          title={`请上传${typeName[props.action]}`}
          column={2}
          bordered
        >
          <Descriptions.Item label="格式">.csv</Descriptions.Item>
          {props.action === "transfer" && (
            <Descriptions.Item label="最大许可">100个 员工</Descriptions.Item>
          )}
          <Descriptions.Item label="模板示例">
            {props.action === "transfer" ? (
              <Button block type="link" onClick={() => handleDownload()}>
                点击下载
              </Button>
            ) : (
              <Popover
                content={
                  <>
                    <Button
                      className="ant-blue-link"
                      type="link"
                      onClick={() => handleDownload()}
                    >
                      模版一
                    </Button>
                    <Divider type="vertical" />
                    <Button
                      className="ant-blue-link"
                      type="link"
                      onClick={() => handleDownload(2)}
                    >
                      模版二
                    </Button>
                  </>
                }
                trigger="hover"
              >
                <Button block type="link">
                  点击下载
                </Button>
              </Popover>
            )}
          </Descriptions.Item>
        </Descriptions>
        {!props.loading && (
          <Space size="middle">
            <ReactFileReader handleFiles={handleFiles} fileTypes={".csv"}>
              <Button type="primary" disabled={isAction || isUpload}>
                {isUpload ? <LoadingOutlined /> : <UploadOutlined />}
                选择文件并上传
              </Button>
            </ReactFileReader>
            {isAction && (
              <Button type="primary" onClick={props.handleCancel}>
                关闭
              </Button>
            )}
          </Space>
        )}
        {!props.loading && <div className="tips">上传文件大小限制10M</div>}
      </Space>
    </Modal>
  );
};

export default CSVModal;
