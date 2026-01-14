import { Button1 } from "./button1";
import { Button2 } from "./button2";
import { Button3 } from "./button3";

// Button Registry - add new button components here as you create them
export const BUTTON_REGISTRY = {
  button1: Button1,
  button2: Button2,
  button3: Button3,
} as const;

export type ButtonVariant = keyof typeof BUTTON_REGISTRY;

export * from "./buttonProps";
export { Button1, Button2, Button3 };
