import { BaseButtonProps } from "./buttonProps";

export function Button1({ text, renderAction, style, className = "", disabled }: BaseButtonProps) {
  const baseClasses = `px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all hover:scale-105 active:scale-95 ${className}`;

  // Render as link
  if (renderAction.type === 'link') {
    return (
      <a
        href={renderAction.href}
        target={renderAction.target}
        className={baseClasses}
        style={style}
        onClick={(e) => disabled && e.preventDefault()}
      >
        {text}
      </a>
    );
  }

  // Render as button
  return (
    <button
      onClick={renderAction.onClick}
      className={baseClasses}
      style={style}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
