import { useField, useFormikContext } from "formik";

const FormikTimeTextField = ({ label, name, ...props }) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  const handleChange = (e) => {
    let val = e.target.value.toLowerCase();

    // Prevent typing after " min"
    if (
      field.value?.includes(" min") &&
      e.target.selectionStart > field.value.indexOf(" min") + 4
    ) {
      return;
    }

    // Clean input: allow only digits, h, r, m, i, n, :, and space
    val = val.replace(/[^0-9hrmin: ]/g, "");

    // Prevent multiple colons
    if ((val.match(/:/g) || []).length > 1) {
      val = val.replace(/:/g, "").replace(/(\d{1,2})(\d*)/, "$1:$2");
    }

    let newValue = "";
    if (val.length > 0) {
      // Extract digits
      const digits = val.replace(/[^0-9]/g, "");

      if (digits.length === 0) {
        // Handle manual "hr" typing
        if (val.includes("h") || val.includes("r")) {
          newValue = " hr";
        }
      } else {
        // Determine hours (up to 2 digits)
        let hours = digits.slice(0, 2); // Take first 1-2 digits for hours
        let minutesDigits = digits.slice(2); // Remaining digits for minutes

        if (!field.value.includes(" min")) {
          // No minutes yet
          if (!field.value.includes(" hr")) {
            // Initial input: just hours
            newValue = hours + " hr";
          } else if (minutesDigits) {
            // Adding minutes
            newValue = hours + " hr : " + minutesDigits.padStart(1, "0");
          } else {
            // Updating hours only
            newValue = hours + " hr";
          }
        } else {
          // Updating minutes
          newValue = hours + " hr : " + minutesDigits.padStart(1, "0") + " min";
        }

        // Auto-add " min" after two minute digits
        if (
          newValue.includes(" hr : ") &&
          newValue.match(/ hr : \d{2}$/) &&
          !newValue.includes(" min")
        ) {
          newValue = newValue + " min";
        }
      }
    }

    // Limit total length
    if (newValue.length > 15) return;

    setFieldValue(name, newValue);
  };

  const handleKeyDown = (e) => {
    const cursorPos = e.target.selectionStart;
    const value = field.value || "";

    // Prevent typing after " min"
    if (value.includes(" min") && cursorPos > field.value.indexOf(" min") + 4) {
      e.preventDefault();
      return;
    }

    // Prevent selection shortcuts (Ctrl+A, Shift+Arrow)
    if (e.ctrlKey && e.key === "a") {
      e.preventDefault();
      return;
    }
    if (e.shiftKey && ["ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      return;
    }

    if (e.key === "Backspace") {
      if (value.includes(" min")) {
        // First backspace: remove minutes
        const hoursPart = value.split(" hr : ")[0].trim();
        setFieldValue(name, hoursPart + " hr");
        e.preventDefault();
      } else if (value.includes(" hr") && cursorPos >= value.indexOf(" hr")) {
        // Second backspace: clear all
        setFieldValue(name, "");
        e.preventDefault();
      }
    }
  };

  const handlePaste = (e) => {
    // Prevent pasting
    e.preventDefault();
  };

  const handleSelect = (e) => {
    // Prevent text selection by collapsing the selection range
    e.target.setSelectionRange(
      e.target.selectionStart,
      e.target.selectionStart
    );
  };

  const isValidTime = (time) => {
    if (!time) return true; // Allow empty input

    // Match formats: X hr or X hr : Y min
    const pattern = /^(\d{1,2})\shr\s?(?::\s?(\d{1,2})\smin)?$/;
    if (!pattern.test(time)) return false;

    const [, hoursStr, minutesStr] = time.match(pattern) || [];
    const hours = parseInt(hoursStr, 10);
    const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;

    return (
      !isNaN(hours) &&
      hours >= 0 &&
      hours <= 99 &&
      (!minutesStr || (minutes >= 0 && minutes < 60))
    );
  };

  return (
    <div className="custom-time-wrapper">
      <label className="block mb-3 font-medium c-black text-[14px]">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={field.value || ""}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onSelect={handleSelect}
        placeholder="hh:mm"
        style={{ userSelect: "none" }} // Prevent text selection visually
        className={`block mb-2 font-medium c-black text-[14px] ${
          meta.touched && meta.error ? "input-error" : ""
        }`}
        {...props}
      />
      {meta.touched && meta.error && (
        <div className="error-text text-red-500 text-[12px]">{meta.error}</div>
      )}
    </div>
  );
};

export default FormikTimeTextField;
