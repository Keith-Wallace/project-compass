import { forwardRef, type ComponentProps, type ReactNode, type MouseEventHandler } from "react";
import { UnstyledButton as MantineButton } from "@mantine/core";
import clsx from 'clsx';

import "./button.css";

type ButtonVariant = "primary" | "secondary" | "cancel";
type ButtonType = 'button' | 'submit' | 'reset';

type ButtonProps = Omit<ComponentProps<typeof MantineButton>, 'type'> & {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined
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
      onClick,
      variant = "primary",
      ...otherProps
    },
    ref
  ) => {
    return (
      <MantineButton
        {...otherProps}
        className={clsx(variantClassMap[variant], className)}
        onClick={onClick}
        ref={ref}
      >
        {children}
      </MantineButton>
    );
  }
);

Button.displayName = "Button";
