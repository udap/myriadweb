import React from "react";
import "./index.less";

/*
外形想链接的按钮
 */
export default function LinkBtn(props) {
const { color } = props;
   
  return (
    <button
      style={{
        color: color,
      }}
      {...props}
      className="link-button"
    ></button>
  );
}
