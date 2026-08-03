import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "../icons/SettingsIcons";

/**
 * Reusable password input field with visibility toggle.
 *
 * @param {object} props
 * @param {string} props.id - Input element id for label association.
 * @param {string} props.label - Field label text.
 * @param {string} props.value - Controlled input value.
 * @param {function} props.onChange - Change handler.
 * @param {boolean} [props.required=false]
 * @param {string} [props.placeholder=""]
 * @returns {JSX.Element}
 */
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
    <div className="flex flex-col gap-[var(--gap-stack)]">
      <label
        htmlFor={id}
        className="text-[var(--text-micro)] uppercase tracking-wider text-text-muted"
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
          className="w-full bg-bg-dark border border-border-muted rounded-md pl-3 pr-10 py-2 text-text text-xs focus:outline-none focus:border-border transition"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 text-text-muted hover:text-text focus:outline-none transition"
        >
          {show ? (
            <EyeSlashIcon className="w-4 h-4" />
          ) : (
            <EyeIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;
