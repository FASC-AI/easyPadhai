import React from "react";


const CommonLayout = (props) => (
  <React.Fragment>
    <div className="layout-body layoutContent !pb-0 h-[calc(100vh-59px)]">{props.children}</div>
  </React.Fragment>
);
export default CommonLayout;
