/**
 * Button Props - Template Stub
 * This file will be replaced with actual implementation during deployment
 */

export type ButtonRenderAction =
  | { type: 'button'; onClick: () => void }
  | { type: 'link'; href: string; target: '_self' | '_blank' };

export interface ButtonBaseProps {
  text: string;
  action: ButtonRenderAction;
  backgroundColor?: string;
  textColor?: string;
}
