import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { UnstyledButton as MantineButton } from "@mantine/core";
import clsx from 'clsx';

import "./button.css";

type ButtonVariant = "primary" | "secondary" | "cancel";
type ButtonType = 'button' | 'submit' | 'reset';

type ButtonProps = Omit<ComponentProps<typeof MantineButton>, 'type'> & {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: ButtonType;
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
