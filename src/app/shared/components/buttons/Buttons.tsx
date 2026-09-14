import { forwardRef, type ComponentProps } from "react";
import { Button as RadixButton } from "@radix-ui/themes";

import "./buttons.css";

type ButtonVariant = "primary" | "secondary" | "cancel";

type ButtonProps = Omit<ComponentProps<typeof RadixButton>, "variant" | "color"> & {
  variant?: ButtonVariant;
};

const variantMap: Record<
  ButtonVariant,
  {
    color: ComponentProps<typeof RadixButton>["color"];
    radixVariant: ComponentProps<typeof RadixButton>["variant"];
  }
> = {
  primary: { color: "green", radixVariant: "solid"},
  secondary: { color: "gray", radixVariant: "outline"},
  cancel: { color: "red", radixVariant: "soft"},
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", ...otherProps }, ref) => {
    const { color, radixVariant } = variantMap[variant];

    return (
      <RadixButton
        {...otherProps}
        color={color}
        radius="large"
        ref={ref}
        variant={radixVariant}
      >
        {children}
      </RadixButton>
    );
  }
);

Button.displayName = "Button";
