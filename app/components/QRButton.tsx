import type { ReactNode } from "react";

type QRButtonProps = {
  title: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
};

export default function QRButton({
  title,
  label,
  icon,
  onClick,
  className,
  disabled,
}: QRButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 whitespace-nowrap rounded px-4 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 disabled:cursor-not-allowed ${className ?? ""}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
