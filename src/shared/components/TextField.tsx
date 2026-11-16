import { forwardRef, type InputHTMLAttributes } from "react";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(props, ref) {
  const { id, label, hint, error, className = "", required, ...inputProps } = props;
  const inputId = id ?? `ard-field-${inputProps.name ?? "input"}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy =
    [hintId, errorId, inputProps["aria-describedby"]].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ard-field">
      <label className="ard-field__label" htmlFor={inputId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        {...inputProps}
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : inputProps["aria-invalid"]}
        aria-describedby={describedBy}
        className={["ard-field__input", error ? "ard-field__input--error" : "", className]
          .filter(Boolean)
          .join(" ")}
      />
      {hint ? <p className="ard-field__hint" id={hintId}>{hint}</p> : null}
      {error ? <p className="ard-field__error" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
});
