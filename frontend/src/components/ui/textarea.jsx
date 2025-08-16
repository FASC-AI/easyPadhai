import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

const Textarea = React.forwardRef(
  (
    { className, formik, name, type, label = "", required = false, ...props },
    ref
  ) => {
    return (
      <>
        <Label>
          {label}{" "}
          {required === true ? <span className="text-red-500">*</span> : ""}
        </Label>
        <div className="relative">
          <textarea
            className={cn(
              "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {formik?.touched[name] && formik?.errors[name] && (
          <p className=" -mt-1 text-xs text-red-500">{formik?.errors[name]}</p>
        )}
      </>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
