import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";

function PasswordInput({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-wider text-brand font-display mb-1.5"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full bg-canvas border border-border rounded-md pl-3.5 pr-10 py-2.5 text-text text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3.5 text-text-muted hover:text-text focus:outline-none transition-colors cursor-pointer"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <EyeSlash className="w-4 h-4" weight="bold" />
          ) : (
            <Eye className="w-4 h-4" weight="bold" />
          )}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;
