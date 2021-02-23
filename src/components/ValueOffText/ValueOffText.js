import React from "react";
import NumberFormat from "react-number-format";

const ValueOffText = (props) => {
  return (
    <>
      {props.type === "GIFT" && (
        <NumberFormat
          value={props.text / 100}
          thousandSeparator={true}
          decimalScale={2}
          fixedDecimalScale={true}
          displayType={"text"}
          prefix={"(¥"}
          suffix={")"}
        />
      )}
      {props.type === "COUPON" && props.discountType === "AMOUNT" && (
        <NumberFormat
          value={props.text / 100}
          displayType={"text"}
          thousandSeparator={true}
          decimalScale={2}
          fixedDecimalScale={true}
          prefix={"¥"}
        />
      )}
      {props.type === "COUPON" && props.discountType === "PERCENT" && (
        <NumberFormat
          value={props.text}
          displayType={"text"}
          prefix={"优惠 "}
          suffix={"%"}
        />
      )}
    </>
  );
};

export default ValueOffText;
