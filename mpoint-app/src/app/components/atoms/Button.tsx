import React from "react";
import { LucideIcon } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "gray";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
  href?: never; // Button kann kein href haben
}

export interface LinkButtonProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  variant?: "primary" | "secondary" | "danger" | "gray";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
  href: string;
  onClick?: never; // Link kann kein onClick haben
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
    ...rest
  } = props;

  // Base styles
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all cursor-pointer rounded-xl";

  // Variant styles
  const variantStyles = {
    primary: "bg-[#e60000] text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed",
    secondary: "border border-[#e60000] bg-white text-[#e60000] hover:bg-[#e60000] hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed",
    gray: "bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
  };

  // Size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5"
  };

  // Icon size mapping
  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  // Render icon helper
  const renderIcon = () => {
    if (!Icon) return null;
    return <Icon size={iconSizes[size]} />;
  };

  // Check if it's a link button
  if ('href' in props) {
    const { href, ...linkProps } = props;
    return (
      <a
        href={href}
        className={combinedClassName}
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
  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      {...rest}
    >
      {iconPosition === "left" && renderIcon()}
      {children}
      {iconPosition === "right" && renderIcon()}
    </button>
  );
}

export default function ExamplePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/data")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Example Page</h1>
      <Button variant="primary" size="md" icon={BookOpen} iconPosition="left">
        Primary Button
      </Button>
      <Button variant="secondary" size="md" className="ml-2">
        Secondary Button
      </Button>
      <Button variant="danger" size="md" className="ml-2" disabled>
        Danger Button
      </Button>
      <Button variant="gray" size="md" className="ml-2">
        Gray Button
      </Button>
      <div className="mt-4">
        <MoreLink href="/more-info" className="text-lg">
          Mehr erfahren
        </MoreLink>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Fetched Data:</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
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