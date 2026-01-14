// ============================================
// Button Action Types (Discriminated Union)
// ============================================

export type ScrollAction = {
  type: 'scroll';
  scrollTo: string;  // Component ID on current page
};

export type ExternalLinkAction = {
  type: 'external';
  url: string;
  openInNewTab: boolean;
};

export type InternalLinkAction = {
  type: 'internal';
  path: string;  // e.g., "/about", "/contact"
};

export type EmailAction = {
  type: 'email';
  email: string;
  subject?: string;  // Optional email subject
};

export type PhoneAction = {
  type: 'phone';
  phone: string;  // e.g., "+1234567890"
};

export type DownloadAction = {
  type: 'download';
  fileUrl: string;
  fileName?: string;
};

export type NoneAction = {
  type: 'none';
};

// Union of all possible actions
export type ButtonAction =
  | ScrollAction
  | ExternalLinkAction
  | InternalLinkAction
  | EmailAction
  | PhoneAction
  | DownloadAction
  | NoneAction;

// ============================================
// Button Configuration
// ============================================

export type ButtonVariant = "button1" | "button2" | "button3";

export interface ButtonConfig {
  text: string;
  variant: ButtonVariant;
  action: ButtonAction;

  // Optional color overrides
  colors?: {
    background?: string;  // Override button background color
    text?: string;        // Override button text color
  };
}

// Helper to get all action types
export type ButtonActionType = ButtonAction['type'];

// Default button config
export const defaultButtonConfig: ButtonConfig = {
  text: "Learn More",
  variant: "button1",
  action: { type: 'none' },
};
