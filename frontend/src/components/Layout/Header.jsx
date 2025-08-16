import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/route.constant";
import useStore from "@/store/userStore";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CounterContext } from "./commonLayout/TitleOfPageProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { PencilIcon, Trash } from "lucide-react";
import { formatDateToDDMMYYYY, formatDate } from "@/utils/dateHelper";
export const BaseUrl = `${import.meta.env.VITE_APP_BASE_URL_V1}`;

const Header = ({ isShowSidebar }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, setUser, setPermissions } = useStore();
  const { setIsAuthenticated } = useStore();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = user._id;
  const userName = user.name.english;
  const handleLogout = async () => {
    await axios.post(`${BaseUrl}/v1/auth/logout`).then(() => {
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
      navigate("/", { replace: true });
    });
  };

  const navigateToView = (id) => {
    navigate(`${ROUTES.USER_PROFILE}`, {
      state: { id: id },
    });
  };
  const handleBlur = () => {
    setTimeout(() => {
      setDropdownOpen((prev) => !prev);
    }, 100);
  };
  const { count } = useContext(CounterContext);
  useEffect(() => {
    const fetchCheckInStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_APP_BASE_URL
          }/attendance/status?userId=${userId}`
        );
        setIsCheckedIn(response.data.isCheckedIn.action === "checkin");
      } catch (error) {
        console.error("Error fetching check-in status:", error);
        //  toast.error('Failed to fetch check-in status.');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckInStatus();
  }, [userId]);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          (error) => reject("Unable to retrieve location: " + error.message),
          { timeout: 5000 }
        );
      } else {
        reject("Geolocation is not supported by this browser.");
      }
    });
  };

  const getIpAddress = async () => {
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      return response.data.ip;
    } catch (error) {
      console.error("Error fetching IP address:", error);
      return null;
    }
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    let deviceType = "Unknown Device";

    if (/Mobi|Android/i.test(userAgent)) {
      deviceType = "Mobile";
    } else if (/Win|Mac|Linux/i.test(userAgent)) {
      deviceType = "Desktop";
    }
    return deviceType;
  };
  const getAddressFromLatLong = async (latitude, longitude) => {
    const apiKey = "AIzaSyA1z_xpK6WAp1z6L_YjgmQBj5kOWBBbvJc";
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await axios.get(geocodeUrl);
      if (response.data.status === "OK") {
        const address = response.data.results[0].formatted_address;
        return address;
      } else {
        throw new Error("Unable to get address");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };
  const handleCheckInOut = async () => {
    const action = isCheckedIn ? "checkout" : "checkin";
    try {
      const location = await getLocation();
      const latitude = location.latitude;
      const longitude = location.longitude;
      const address = await getAddressFromLatLong(latitude, longitude);

      const date = formatDate(new Date(), "date");

      const ipAddress = await getIpAddress();

      const deviceType = getDeviceType();
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/attendance`,
        {
          userId,
          action,
          userName,
          location: address,
          ipAddress,
          deviceType,
          date,
        }
      );
      toast.success(response.data.message);

      setIsCheckedIn(action === "checkin");
    } catch (error) {
      console.error("Error performing check-in/out:", error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };
  return (
    <div className="biHeader">
      <div
        className={
          isShowSidebar === false
            ? "text-2xl font-semibold text-[#002850]"
            : "pl-2 ml-5 text-2xl font-semibold text-[#002850]"
        }
      >
        {count}
      </div>

      <ul className="biHeaderNav">
        <div>
          <Button onClick={handleCheckInOut}>
            {isCheckedIn ? "Check-Out" : "Check-In"}
          </Button>
        </div>
        <li className="biUser relative">
          <div
            className="biUserWrap flex items-center cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onBlur={handleBlur}
          >
            <button
              className="biUserNameWrap ml-2 v-center"
              style={{ gap: "10px" }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onBlur={handleBlur}
            >
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex gap-2">
                    <img
                      src={
                        user?.profileImage[0]?.url || "/assets/images/user.png"
                      }
                      alt="Easy padhai"
                      className="w-8 h-8 rounded-full aspect-square object-contain border border-border-primary bg-white"
                    />
                    <div>
                      <div className="biUserName text-sm font-semibold text-left">
                        {user?.name?.english}
                      </div>
                      <div className="biUserRole text-xs text-gray-500 text-left">
                        {user?.designation}
                      </div>
                    </div>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigateToView(user?._id)}>
                    <PencilIcon className="size-4 mr-2" />
                    <span>User Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <Trash className="size-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </button>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Header;
