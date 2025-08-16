import { leftArrowIcon, slashIcon } from "@/assets/Icons";
import { useNavigate } from "react-router-dom";


const BreadCrumbs = ({ breadCrumbs, boldItem, backNavi }) => {
  const navigate = useNavigate();
  return (
    <div className="breadcrubs-main-container">
      <div className="breadcrubs-content ">
        <div className="d-h-center curser-pointer group text-[#747372] hover:text-blue-400" onClick={backNavi}>
          {leftArrowIcon({
            width: 14,
            height: 10,
            className: "text-[#747372] hover:text-blue-400",
          })}
        </div>
        {breadCrumbs?.length > 0 &&
          breadCrumbs?.map((item, index) => (
            <div key={index} className="bread-breadcrubs group">
              <div
                className="heading-400-14 d-h-center curser-pointer text-[#747372] hover:text-blue-400"
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </div>
              <div className="bread-arrow d-h-center">
                {slashIcon({ width: 13, height: 16 })}
              </div>
            </div>
          ))}
       <div className="cursor-pointer text-[#747372] hover:text-blue-400 text-[13px] leading-5">
  {boldItem}
</div>

      </div>
    </div>
  );
};

export default BreadCrumbs;
