import React from "react";
import { LucideIcon } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "gray" | "custom";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
  href?: never; // Button kann kein href haben
  hoverColor?: string; // Für custom variant
}

export interface LinkButtonProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  variant?: "primary" | "secondary" | "danger" | "gray" | "custom";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
  href: string;
  onClick?: never; // Link kann kein onClick haben
  hoverColor?: string; // Für custom variant
}

type CombinedButtonProps = ButtonProps | LinkButtonProps;

export function Button(props: CombinedButtonProps) {
  const {
    variant = "primary",
    size = "md",
    icon: Icon,
    iconPosition = "left",
    className = "",
    children,
    disabled,
    hoverColor,
    ...rest
  } = props;

  // Base styles
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all cursor-pointer";

  // Variant styles - Custom behält weißen Hintergrund, ändert nur Border-Farbe
  const variantStyles = {
    primary: "bg-[#e60000] text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400",
    secondary: "border border-[#e60000] bg-white text-[#e60000] hover:bg-[#e60000] hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-800 border-2 border-red-700 hover:border-red-900 shadow-red-200 hover:shadow-red-300 shadow-lg disabled:bg-gray-400 disabled:border-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:bg-gray-400 disabled:hover:border-gray-400 disabled:hover:shadow-none",
    gray: "bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:bg-gray-100",
    custom: "border border-gray-600 bg-white text-gray-600 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-300"
  };

  // Size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-1.5 rounded-md",
    md: "px-4 py-2 text-base gap-2 rounded-lg",
    lg: "px-6 py-3 text-lg gap-2.5 rounded-xl"
  };

  // Icon size mapping
  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 22
  };

  // Custom hover styles - nur Border-Farbe ändert sich
  const getCustomHoverStyle = () => {
    if (variant !== 'custom' || !hoverColor) return {};

    const colorMap: Record<string, string> = {
      'blue-600': '#2563eb',
      'green-600': '#16a34a',
      'purple-600': '#9333ea',
      'orange-600': '#ea580c',
      'red-600': '#dc2626',
      'yellow-600': '#ca8a04',
      'indigo-600': '#4f46e5',
      'pink-600': '#db2777'
    };

    const borderColor = colorMap[hoverColor] || '#2563eb';

    return {
      '--hover-border-color': borderColor
    } as React.CSSProperties;
  };

  const customHoverClass = variant === 'custom' && !disabled
    ? 'hover:border-[var(--hover-border-color)]'
    : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${customHoverClass} ${className}`;

  // Render icon helper
  const renderIcon = () => {
    if (!Icon) return null;
    return <Icon size={iconSizes[size]} />;
  };

  // Check if it's a link button
  if ('href' in props) {
    const { href, hoverColor, ...linkProps } = props;
    return (
      <a
        href={href}
        className={combinedClassName}
        style={getCustomHoverStyle()}
        {...(linkProps as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>)}
      >
        {iconPosition === "left" && renderIcon()}
        {children}
        {iconPosition === "right" && renderIcon()}
      </a>
    );
  }

  // Regular button
  const buttonProps = props as ButtonProps;
  const { hoverColor: _, ...buttonRest } = buttonProps;
  return (
    <button
      className={combinedClassName}
      style={getCustomHoverStyle()}
      disabled={disabled}
      {...buttonRest}
    >
      {iconPosition === "left" && renderIcon()}
      {children}
      {iconPosition === "right" && renderIcon()}
    </button>
  );
}

// Convenience components for common use cases
export const PrimaryButton = (props: Omit<CombinedButtonProps, 'variant'>) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton = (props: Omit<CombinedButtonProps, 'variant'>) => (
  <Button {...props} variant="secondary" />
);

export const DangerButton = (props: Omit<CombinedButtonProps, 'variant'>) => (
  <Button {...props} variant="danger" />
);

export const GrayButton = (props: Omit<CombinedButtonProps, 'variant'>) => (
  <Button {...props} variant="gray" />
);

export const CustomButton = (props: Omit<CombinedButtonProps, 'variant'>) => (
  <Button {...props} variant="custom" />
);