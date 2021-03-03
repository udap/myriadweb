import React from "react";
import { Descriptions, Table, Tag } from "antd";
import NumberFormat from "react-number-format";

import "./RedemptionRules.less";
import comEvents from "@utils/comEvents";
import { rulesOfUse } from "@utils/constants";

const columns = [
  {
    title: "指定商户",
    dataIndex: "partyName",
    key: "partyName",
  },
  {
    title: "商户地址",
    dataIndex: "partyAddress",
    key: "partyAddress",
  },
];

const RedemptionRules = (props) => {
  const { parties, rulesArr } = props;
  let merchants = [];
  parties.forEach((p) => {
    if (p.type === "MERCHANT") merchants.push(p);
  });
  const redemptionObj = rulesArr.find(
    (item) => item.namespace === "REDEMPTION"
  );
  return (
    <>
      {redemptionObj && (
        <Descriptions size="small" bordered column={1}>
          {redemptionObj.rules &&
            redemptionObj.rules.map((item) => {
              return (
                <>
                  {item.name === "MinimumValue" && (
                    <Descriptions.Item label={rulesOfUse[item.name]}>
                      <NumberFormat
                        value={item.option / 100}
                        displayType={"text"}
                        thousandSeparator={true}
                        decimalScale={2}
                        fixedDecimalScale={true}
                        prefix={"最低消费金额 ¥"}
                      />
                    </Descriptions.Item>
                  )}
                  {item.name === "SelectedTags" && (
                    <Descriptions.Item label={rulesOfUse[item.name]}>
                      {item.option.split(",").map((item, index) => (
                        <Tag key={index} color="cyan">
                          {item}
                        </Tag>
                      ))}
                    </Descriptions.Item>
                  )}
                  {item.name === "SelectedRegions" && (
                    <Descriptions.Item label={rulesOfUse[item.name]}>
                      {comEvents
                        .flatRegions(JSON.parse(item.option))
                        .map((t, idx) => (
                          <Tag key={idx} color="blue">
                            {t}
                          </Tag>
                        ))}
                    </Descriptions.Item>
                  )}
                </>
              );
            })}
        </Descriptions>
      )}

      {merchants.length !== 0 && (
        <Table
          bordered
          size="small"
          className="step-marginTop tableFont"
          columns={columns}
          dataSource={merchants}
          pagination={{
            pageSize: 20,
            total: merchants.length,
            hideOnSinglePage: true,
            showSizeChanger: false,
          }}
        />
      )}
    </>
  );
};

export default RedemptionRules;
