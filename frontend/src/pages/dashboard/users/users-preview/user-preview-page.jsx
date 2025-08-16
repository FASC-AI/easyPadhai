import { useState, useEffect } from "react";
import CardDetail from "@/components/ui/card-detail";
import HeaderPreviewPage from "@/components/ui/header-preview-page";
import apiService from "@/lib/apiService";
import { USERS_APIS } from "../config";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { format_dd_mmm_yyyy } from "@/components/functions/date-format";
const UserPreviewInfo = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [details1, setDetails1] = useState([]);
  const [details2, setDetails2] = useState([]);
  const [details3, setDetails3] = useState([]);
  const [details4, setDetails4] = useState([]);
  const [details5, setDetails5] = useState([]);
  const [details6, setDetails6] = useState([]);
  const [details7, setDetails7] = useState([]);
  const [details8, setDetails8] = useState([]);
  const [details9, setDetails9] = useState([]);
  const location = useLocation();
  useEffect(() => {
    const breadcrumbData = [
      { label: "Users", href: "#" },
      { label: "User", href: "/users" },

      { label: "User Preview", href: "#" },
    ];
    updateBreadcrumb(breadcrumbData);
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await apiService.get(
          `${USERS_APIS.USER}/${location.state.id}`
        );
        if (response?.code === 200 && response?.status === true) {
          const userData = response.data.user;

          setDetails1([
            { label: "Employee ID", value: userData?.employeeId || "" },
            {
              label: "Name",
              value:
                userData?.name?.english +
                  (userData?.name?.hindi
                    ? " (" + userData?.name?.hindi + " )"
                    : "") || "",
            },
            { label: "Email ", value: userData?.email || "" },
            { label: "Mobile No. ", value: userData?.mobile || "" },
            { label: "State ", value: userData?.state || "" },
            { label: "District ", value: userData?.district || "" },
            { label: "Role ", value: userData?.role || "" },
            { label: "Qualification ", value: userData?.qualification || "" },
            {
              label: "Registration Type ",
              value: userData?.registrationType || "",
            },
            { label: "Contractor ", value: userData?.contractor || "" },
            {
              label: "Contract Validity ",
              value: userData?.contractValidity
                ? format_dd_mmm_yyyy(userData?.contractValidity)
                : "",
            },
            { label: "Gender ", value: userData?.gender || "" },
            { label: "Marital Status ", value: userData?.maritalStatus || "" },
            { label: "Caste Category ", value: userData?.casteCategory || "" },
            { label: "Category ", value: userData?.category || "" },
          ]);
          setDetails2([
            {
              label: "Emergency Number",
              value: userData?.emergencyContact?.mobileNo || "",
            },
            {
              label: "Contact Person",
              value: userData?.emergencyContact?.contactPerson || "",
            },
            {
              label: "DOB (Date of Birth)",
              value: userData?.dob ? format_dd_mmm_yyyy(userData?.dob) : "",
            },
            { label: "Blood Group", value: userData?.bloodGroup || "" },
            {
              label: "Father's Name",
              value: userData?.fatherName?.en
                ? userData?.fatherName?.en
                : "" +
                    (userData?.fatherName?.hn
                      ? " ( " + userData?.fatherName?.hn + " )"
                      : "") || "",
            },
            {
              label: "Mother's Name",
              value: userData?.motherName?.en
                ? userData?.motherName?.en
                : "" +
                    (userData?.motherName?.hn
                      ? " (" + userData?.motherName?.hn + " )"
                      : "") || "",
            },
            { label: "Spouse", value: userData?.spouse || "" },
            {
              label: "Husband/Wife's Name",
              value: userData?.spouseName?.en
                ? userData?.spouseName?.en
                : "" +
                    (userData?.spouseName?.hn
                      ? " ( " + userData?.spouseName?.hn + " ) "
                      : "") || "",
            },
          ]);
          setDetails3([
            {
              label: "Aadhar Card",
              value: userData?.documents?.aadharCardNo || "",
            },
            { label: "PAN Card", value: userData?.documents?.panCardNo || "" },
            {
              label: "Govt. Issued Card",
              value: userData?.documents?.govtIssuedCardNo || "",
            },

            {
              label: "Aadhar Card Document",
              value: userData?.documents?.aadharCardNoDoc || "",
            },
            {
              label: "PAN Card Document",
              value: userData?.documents?.panCardNoDoc || "",
            },
            {
              label: "Govt. Issued Card Document",
              value: userData?.documents?.govtIssuedCardNoDoc || "",
            },
          ]);
          setDetails4([
            {
              label: "Batch Number",
              value: userData?.training[0]?.batchNumber || "",
            },
            {
              label: "DOC (Date of Commencement)",
              value: userData?.training[0]?.dateOfCommencement
                ? format_dd_mmm_yyyy(userData?.training.dateOfCommencement)
                : "",
            },
            {
              label: "Date of Completion",
              value: userData?.training[0]?.dateOfCompletion
                ? format_dd_mmm_yyyy(userData?.training.dateOfCompletion)
                : "",
            },
            {
              label: "Institute",
              value: userData?.training[0]?.institute || "",
            },
            { label: "Module", value: userData?.training[0]?.module || "" },
            {
              label: "ICard",
              value: userData?.training[0]?.iCardReceived || "",
            },
            {
              label: "Certificate Received",
              value:
                (userData?.training[0]?.certificateReceived ? "Yes" : "No") ||
                "--",
            },
            {
              label: "Emergency Responder Kit Received",
              value:
                (userData?.training[0]?.emergencyResponderKitReceived
                  ? "Yes"
                  : "No") || "",
            },
          ]);
          setDetails5([
            {
              label: "Relationship Type",
              value: userData?.nominee?.relationshipType || "",
            },
            { label: "Nominee Name", value: userData?.nominee?.name || "" },
            {
              label: "Mobile Number",
              value: userData?.nominee?.mobileNumber || "",
            },

            { label: "Email", value: userData?.nominee?.email || "" },
            {
              label: "Relation with Nominee",
              value: userData?.nominee?.relationWithNominee || "",
            },
            {
              label: "Share Percentage",
              value: userData?.nominee?.sharePercentage || "",
            },
          ]);
          setDetails6([
            {
              label: "Designation",
              value: userData?.employment?.designation || "",
            },
            {
              label: "DOJ (Date of Joining)",
              value: userData?.employment?.dateOfJoining
                ? format_dd_mmm_yyyy(userData?.employment.dateOfJoining)
                : "",
            },
            {
              label: "DOR (Date of Retirement)",
              value: userData?.employment?.dateOfRetirement
                ? format_dd_mmm_yyyy(userData?.employment.dateOfRetirement)
                : "",
            },
            {
              label: "Payroll ID",
              value: userData?.employment?.payrollId || "",
            },
          ]);

          setDetails7([
            {
              label: "Bank Name",
              value: userData?.bankDetails?.bankName || "",
            },
            {
              label: "Account Number",
              value: userData?.bankDetails?.accountNumber || "",
            },
            {
              label: "RTGS Code",
              value: userData?.bankDetails?.rtgsCode || "",
            },
            { label: "EPF Code", value: userData?.bankDetails?.epfCode || "" },
            {
              label: "Universal A/c Number",
              value: userData?.bankDetails?.universalAccountNumber || "",
            },
          ]);

          setDetails8([
            {
              label: "Pin Code",
              value: userData?.postalAddress?.pinCode || "",
            },
            { label: "Country", value: userData?.postalAddress?.country || "" },
            { label: "State", value: userData?.postalAddress?.state || "" },
            {
              label: "District",
              value: userData?.postalAddress?.district || "",
            },
            {
              label: "Address 1",
              value: userData?.postalAddress?.address1 || "",
            },
            {
              label: "Address 2",
              value: userData?.postalAddress?.address2 || "",
            },
          ]);
          setDetails9([
            {
              label: "Pin Code",
              value: userData?.permanentAddress?.pinCode || "",
            },
            {
              label: "Country",
              value: userData?.permanentAddress?.country || "",
            },
            { label: "State", value: userData?.permanentAddress?.state || "" },
            {
              label: "District",
              value: userData?.permanentAddress?.district || "",
            },
            {
              label: "Address 1",
              value: userData?.permanentAddress?.address1 || "",
            },
            {
              label: "Address 2",
              value: userData?.permanentAddress?.address2 || "",
            },
          ]);
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message);
      }
    };
    fetchDetails();
  }, []);

  return (
    <div className=" mx-4  mb-4 h-[calc(100vh-80px)] ">
      <div className="relative pb-5 bg-white">
        <HeaderPreviewPage
          name={location?.state?.name}
          email={location?.state?.email}
          mobile={location?.state?.mobile}
          image={location?.state?.image}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 px-4 gap-4">
          <div className="flex flex-col gap-4">
            <CardDetail title="Basic Information" content={details1} />
            <CardDetail title="Personal Information" content={details2} />
            <CardDetail title="Nominee Information" content={details5} />
          </div>
          <div className="flex flex-col  gap-4">
            <CardDetail title="Identity Information" content={details3} />
            <CardDetail title="Service Information" content={details6} />
            <CardDetail title="Bank Information" content={details7} />
            <CardDetail title="Postal Address" content={details8} />
            <CardDetail title="Permanent Address" content={details9} />
          </div>
          <CardDetail title="Training Information1" content={details4} />
        </div>
      </div>
    </div>
  );
};

export default UserPreviewInfo;
