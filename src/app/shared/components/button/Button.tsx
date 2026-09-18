import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { UnstyledButton as MantineButton } from "@mantine/core";
import clsx from 'clsx';

import "./button.css";

type ButtonVariant = "primary" | "secondary" | "cancel";

type ButtonProps = ComponentProps<typeof MantineButton> & {
  children?: ReactNode;
  className?: string;
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
      <MantineButton
        {...otherProps}
        className={clsx(variantClassMap[variant], className)}
        ref={ref}
      >
        {children}
      </MantineButton>
    );
  }
);

Button.displayName = "Button";
