// Render props - what the button component receives after processing
export type ButtonRenderAction =
  | { type: 'button'; onClick: () => void }
  | { type: 'link'; href: string; target?: '_blank' | '_self' };

export interface BaseButtonProps {
  text: string;
  renderAction: ButtonRenderAction;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
}
