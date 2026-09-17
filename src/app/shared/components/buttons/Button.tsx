import { forwardRef, type ComponentProps } from "react";
import { Button as BaseUIButton } from "@base-ui/react/button";
import clsx from 'clsx';

import "./button.css";

type ButtonVariant = "primary" | "secondary" | "cancel";

type ButtonProps = ComponentProps<typeof BaseUIButton> & {
  variant?: ButtonVariant;
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary: "button button-primary",
  secondary: "button button-secondary",
  cancel: "button button-cancel",
};


export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      ...otherProps
    },
    ref
  ) => {
    return (
      <BaseUIButton
        {...otherProps}
        className={clsx(variantClassMap[variant], className)}
        ref={ref}
      >
        {children}
      </BaseUIButton>
    );
  }
);

Button.displayName = "Button";
