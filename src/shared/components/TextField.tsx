import { forwardRef, type InputHTMLAttributes } from "react";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ id, label, hint, error, className = "", required, ...props }, ref) {
    const inputId = id ?? `ard-field-${props.name ?? "input"}`;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy =
      [hintId, errorId, props["aria-describedby"]].filter(Boolean).join(" ") || undefined;

    return (
      <div className="ard-field">
        <label className="ard-field__label" htmlFor={inputId}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        <input
          {...props}
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={describedBy}
          className={[
            "ard-field__input",
            error ? "ard-field__input--error" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {hint && (
          <p className="ard-field__hint" id={hintId}>
            {hint}
          </p>
        )}
        {error && (
          <p className="ard-field__error" id={errorId} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
