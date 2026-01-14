import { ButtonAction, ButtonConfig } from "@/types/button";
import { ButtonRenderAction } from "@/components/ui/buttons/buttonProps";
import { getLuminance } from "@/lib/colorUtils/colorMath";

/**
 * Minimal color context required for button color calculations.
 * Compatible with DerivedColorPalette and simpler color objects.
 */
export interface ButtonColorContext {
  mainColor: string;
  whiteText: string;
  darkText: string;
}

/**
 * Determines if a button should be rendered
 */
export function shouldRenderButton(config?: ButtonConfig): boolean {
  return !!config && config.action?.type !== "none" && !!config.text?.trim();
}

/**
 * Intelligently calculates button colors with smart defaults and optional overrides
 */
export function getButtonColors(
  buttonConfig: ButtonConfig,
  componentColors: ButtonColorContext
): { backgroundColor: string; textColor: string } {
  // Determine background color (override or default to mainColor)
  const backgroundColor = buttonConfig.colors?.background || componentColors.mainColor;

  // If text color is explicitly overridden, use it
  if (buttonConfig.colors?.text) {
    return {
      backgroundColor,
      textColor: buttonConfig.colors.text,
    };
  }

  // Otherwise, intelligently choose text color based on background luminance
  const luminance = getLuminance(backgroundColor);

  // If background is light (luminance > 0.5), use dark text
  // If background is dark (luminance <= 0.5), use white text
  const textColor = luminance > 0.5
    ? componentColors.darkText   // Light background → dark text
    : componentColors.whiteText; // Dark background → white text

  return {
    backgroundColor,
    textColor,
  };
}

/**
 * Converts a ButtonAction to a ButtonRenderAction ready for component rendering
 */
export function getButtonRenderAction(
  action: ButtonAction,
  onScroll?: (targetId: string) => void
): ButtonRenderAction {
  switch (action.type) {
    case 'scroll':
      return {
        type: 'button',
        onClick: () => onScroll?.(action.scrollTo),
      };

    case 'external':
      return {
        type: 'link',
        href: action.url,
        target: action.openInNewTab ? '_blank' : '_self',
      };

    case 'internal':
      return {
        type: 'link',
        href: action.path,
        target: '_self',
      };

    case 'email':
      const mailtoUrl = `mailto:${action.email}${action.subject ? `?subject=${encodeURIComponent(action.subject)}` : ''}`;
      return {
        type: 'link',
        href: mailtoUrl,
        target: '_self',
      };

    case 'phone':
      return {
        type: 'link',
        href: `tel:${action.phone}`,
        target: '_self',
      };

    case 'download':
      return {
        type: 'link',
        href: action.fileUrl,
        target: '_blank',
      };

    case 'none':
    default:
      return {
        type: 'button',
        onClick: () => {},
      };
  }
}

/**
 * Handles scroll action by scrolling to target element
 */
export function handleScrollToElement(targetId: string) {
  const element = document.getElementById(targetId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    console.warn(`Scroll target not found: ${targetId}`);
  }
}
