import { PencilIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import Typography from "./typography";
import { Button } from "./button";
import { getInitials } from "../functions/getInitials";

const HeaderPreviewPage = ({ name, email, mobile, image, onClickFunction }) => {
  return (
    <div className="flex flex-row justify-between w-full px-4 py-3 border-b border-[#DCDCDC] sticky top-0 z-50 bg-white">
      <div className="flex flex-row  gap-3 mt-1">
        <div>
          <Avatar className="w-20 h-20 rounded-full aspect-square object-contain border border-border-primary bg-white">
            <AvatarImage src={image} alt="User Avatar" />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col">
          <div>
            {" "}
            <Typography
              variant="h3"
              affects="large"
              className="text-3xl font-semibold"
            >
              {" "}
              {name}
            </Typography>
          </div>
          <div>
            <Typography variant="p" affects="muted">
              {email}
            </Typography>
          </div>
          <div>{mobile}</div>
        </div>
      </div>
      <div className="">
        <Button className="w-full cursor-pointer" onClick={onClickFunction}>
          <PencilIcon /> Edit
        </Button>
      </div>
    </div>
  );
};

export default HeaderPreviewPage;
