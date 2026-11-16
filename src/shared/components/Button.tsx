import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className = "",
    disabled = false,
    leadingIcon,
    trailingIcon,
    type = "button",
    variant = "secondary",
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled}
      className={[`ard-button`, `ard-button--${variant}`, className].filter(Boolean).join(" ")}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  );
});
