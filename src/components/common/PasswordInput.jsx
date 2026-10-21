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
    <div className="flex flex-col gap-stack">
      <label
        htmlFor={id}
        className="text-xs uppercase tracking-widest text-text-muted font-medium"
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
          className="w-full bg-canvas-bg border border-border-muted rounded-md pl-3 pr-10 py-2 text-text text-xs focus:outline-none focus:border-border transition"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 text-text-muted hover:text-text focus:outline-none transition cursor-pointer"
        >
          {show ? <EyeSlash size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;
