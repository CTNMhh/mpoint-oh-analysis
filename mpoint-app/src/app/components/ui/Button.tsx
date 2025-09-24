import React from "react";
import Link from "next/link";
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

  // Variant styles
  const variantStyles = {
    primary: "bg-[#e60000] text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400",
    secondary: "border border-[#e60000] bg-white text-[#e60000] hover:bg-[#e60000] hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-800 border-2 border-red-700 hover:border-red-900 shadow-red-200 hover:shadow-red-300 shadow-lg disabled:bg-gray-400 disabled:border-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:bg-gray-400 disabled:hover:border-gray-400 disabled:hover:shadow-none",
    gray: "bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:bg-gray-100",
    custom: "border bg-white disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-300"
  };

  // Size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-1.5 rounded-md",
    md: "px-4 py-2 text-base gap-2 rounded-lg",
    lg: "px-6 py-3 text-lg gap-2.5 rounded-xl font-semibold"
  };

  // Icon size mapping
  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 22
  };

  // Custom hover und active styles
  const getCustomStyles = () => {
    if (variant !== 'custom' || !hoverColor) return {};

    const colorMap: Record<string, { border: string; text: string; hoverBg: string; activeBg: string; activeText: string }> = {
      'blue-600': {
        border: '#2563eb',
        text: '#2563eb',
        hoverBg: '#eff6ff',
        activeBg: '#dbeafe',
        activeText: '#1d4ed8'
      },
      'green-600': {
        border: '#16a34a',
        text: '#16a34a',
        hoverBg: '#f0fdf4',
        activeBg: '#dcfce7',
        activeText: '#15803d'
      },
      'purple-600': {
        border: '#9333ea',
        text: '#9333ea',
        hoverBg: '#faf5ff',
        activeBg: '#f3e8ff',
        activeText: '#7c3aed'
      },
      'orange-600': {
        border: '#ea580c',
        text: '#ea580c',
        hoverBg: '#fff7ed',
        activeBg: '#fed7aa',
        activeText: '#c2410c'
      },
      'red-600': {
        border: '#dc2626',
        text: '#dc2626',
        hoverBg: '#fef2f2',
        activeBg: '#fecaca',
        activeText: '#b91c1c'
      },
      'yellow-600': {
        border: '#ca8a04',
        text: '#ca8a04',
        hoverBg: '#fefce8',
        activeBg: '#fef3c7',
        activeText: '#a16207'
      },
      'indigo-600': {
        border: '#4f46e5',
        text: '#4f46e5',
        hoverBg: '#f8fafc',
        activeBg: '#e0e7ff',
        activeText: '#3730a3'
      },
      'pink-600': {
        border: '#db2777',
        text: '#db2777',
        hoverBg: '#fdf2f8',
        activeBg: '#fce7f3',
        activeText: '#be185d'
      }
    };

    const colors = colorMap[hoverColor] || colorMap['blue-600'];

    return {
      '--border-color': colors.border,
      '--text-color': colors.text,
      '--hover-bg-color': colors.hoverBg,
      '--active-bg-color': colors.activeBg,
      '--active-text-color': colors.activeText
    } as React.CSSProperties;
  };

  const customStyleClass = variant === 'custom' && !disabled
    ? 'border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--hover-bg-color)] active:bg-[var(--active-bg-color)] active:text-[var(--active-text-color)] active:border-[var(--border-color)]'
    : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${customStyleClass} ${className}`.trim();

  // Render icon helper
  const renderIcon = () => {
    if (!Icon) return null;
    return <Icon size={iconSizes[size]} />;
  };

  // Check if it's a link button
  if ('href' in props) {
    // Extrahiere nur die gültigen Link-Props
    const { href } = props;
    const validLinkProps: Record<string, any> = {};

    // Nur gültige HTML-Attribute für <a> Tags durchlassen
    Object.keys(rest).forEach(key => {
      if (!['variant', 'size', 'icon', 'iconPosition', 'hoverColor', 'disabled'].includes(key)) {
        validLinkProps[key] = (rest as any)[key];
      }
    });

    return (
      <Link
        href={href}
        className={`${combinedClassName} block`}
        style={getCustomStyles()}
        {...validLinkProps}
      >
        {iconPosition === "left" && renderIcon()}
        {children}
        {iconPosition === "right" && renderIcon()}
      </Link>
    );
  }

  // Regular button - extrahiere nur gültige Button-Props
  const validButtonProps: Record<string, any> = {};
  Object.keys(rest).forEach(key => {
    if (!['variant', 'size', 'icon', 'iconPosition', 'hoverColor'].includes(key)) {
      validButtonProps[key] = (rest as any)[key];
    }
  });

  return (
    <button
      className={combinedClassName}
      style={getCustomStyles()}
      disabled={disabled}
      {...validButtonProps}
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

// Spezielle Link-Button Convenience Components
export const PrimaryLinkButton = (props: Omit<LinkButtonProps, 'variant'>) => (
  <Button {...props} variant="primary" />
);

export const SecondaryLinkButton = (props: Omit<LinkButtonProps, 'variant'>) => (
  <Button {...props} variant="secondary" />
);

export const OutlineLinkButton = (props: Omit<LinkButtonProps, 'variant'>) => (
  <Button {...props} variant="secondary" />
);