import { Button as MantineButton, ButtonProps, px, UnstyledButton, Group, Text, UnstyledButtonProps } from '@mantine/core';
import { ReactNode, useState, ComponentType, CSSProperties, ButtonHTMLAttributes } from 'react';

type TablerIcon = ComponentType<{ size?: number; className?: string; stroke?: number }>;

interface BarButtonProps extends ButtonProps {
  iconMode?: boolean;
  avatarLabel?: string;
  children?: ReactNode;
  onClick?: () => void;
  radius?: number | string;
  backgroundColor?: string;
  color?: string;
  sidebarMode?: boolean;
  icon?: TablerIcon;
  label?: string;
  active?: boolean;
  hoverBackgroundColor?: string;
  hoverColor?: string;
  leftSection?: ReactNode;
  customStyles?: CSSProperties;
  customHoverStyles?: CSSProperties;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

const Button = ({
  iconMode = false,
  sidebarMode = false,
  avatarLabel,
  icon: Icon,
  label,
  children,
  onClick,
  radius,
  style: propStyle,
  backgroundColor,
  color,
  active = false,
  hoverBackgroundColor,
  hoverColor,
  leftSection,
  customStyles,
  customHoverStyles,
  type,
  ...props
}: BarButtonProps) => {
  const [hovered, setHovered] = useState(false);

  const borderRadius = radius ?? ((iconMode || avatarLabel) ? '50%' : sidebarMode ? '8px' : 5);

  const getInitial = (label: string) => {
    const match = label.trim().match(/[a-zA-Z0-9]/);
    return match ? match[0].toUpperCase() : '?';
  };

  if (sidebarMode && Icon && label) {
    const { 
      variant, size, fullWidth, rightSection, justify, 
      ...unstyledProps 
    } = props;
    
    const sidebarBgColor = (active || hovered) 
      ? (hoverBackgroundColor ?? 'var(--mantine-color-dark-9)') 
      : (backgroundColor ?? 'transparent');
    const sidebarTextColor = (active || hovered) 
      ? (hoverColor ?? 'var(--mantine-color-white)') 
      : (color ?? 'var(--mantine-color-gray-6)');
    
    return (
      <UnstyledButton
        onClick={onClick}
        style={{
          display: 'block',
          width: '100%',
          padding: '12px 16px',
          borderRadius,
          backgroundColor: sidebarBgColor,
          color: sidebarTextColor,
          transition: 'all 0.15s ease',
          cursor: 'pointer',
          ...(propStyle as React.CSSProperties),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...(unstyledProps as UnstyledButtonProps)}
      >
        <Group gap={12} wrap="nowrap">
          <Icon size={18} stroke={1.5} />
          <Text size="sm" style={{ fontWeight: 500 }}>
            {label}
          </Text>
        </Group>
      </UnstyledButton>
    );
  }

  if (avatarLabel) {
    const initial = getInitial(avatarLabel);
    //TODO: should follow user's color for avatar icon
    const defaultBg = backgroundColor ?? 'var(--mantine-color-dark-9)';
    const defaultHoverBg = hoverBackgroundColor ?? 'var(--mantine-color-gray-7)';
    const defaultColor = color ?? 'var(--mantine-color-white)';
    const defaultHoverColor = hoverColor ?? 'var(--mantine-color-white)';

    return (
      <UnstyledButton
        onClick={onClick}
        style={{
          width: px(40),
          height: px(40),
          borderRadius,
          backgroundColor: hovered ? defaultHoverBg : defaultBg,
          color: hovered ? defaultHoverColor : defaultColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          fontSize: '14px',
          transition: 'background-color 0.2s',
          ...(propStyle as React.CSSProperties),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Click to sign out"
      >
        {initial}
      </UnstyledButton>
    );
  }

  const iconStyle: React.CSSProperties = {
    borderRadius,
    width: px(40),
    height: px(40),
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: hovered
      ? (hoverBackgroundColor ?? 'var(--mantine-color-green-7)')
      : (backgroundColor ?? 'var(--mantine-color-green-6)'),
    transform: hovered ? 'scale(1.1)' : 'scale(1)',
    transition: 'all 0.2s ease-in-out',
    color: hovered ? (hoverColor ?? 'var(--mantine-color-white)') : (color ?? 'var(--mantine-color-white)'),
  };

  const normalStyle: React.CSSProperties = {
    borderRadius,
    backgroundColor,
    color,
  };

  if (customStyles) {
    const combinedStyle = {
      ...customStyles,
      ...(hovered && customHoverStyles ? customHoverStyles : {}),
      ...(propStyle as React.CSSProperties ?? {}),
    };

    return (
      <MantineButton
        {...props}
        type={type}
        leftSection={leftSection}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={combinedStyle}
        onClick={onClick}
      >
        {children}
      </MantineButton>
    );
  }

  const combinedStyle = iconMode
    ? { ...iconStyle, ...((propStyle as React.CSSProperties) ?? {}) }
    : { ...normalStyle, ...((propStyle as React.CSSProperties) ?? {}) };

  return (
    <MantineButton
      {...props}
      type={type}
      leftSection={leftSection}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={combinedStyle}
      onClick={onClick}
    >
      {children}
    </MantineButton>
  );
};

export default Button;