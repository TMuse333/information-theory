import { BaseColorProps } from "./componentTypes";

export type NavItemType = "link" | "scroll" | "submenu" | "external";

export interface NavItem {
  type: NavItemType;
  label: string;
  href?: string; // for link/external
  scrollTo?: string; // for scroll (component id)
  targetPage?: string; // for scroll - the page slug where scrollTo target exists (e.g., "/" or "/about")
  target?: "_blank"; // for external
  children?: NavItem[]; // for submenu
}





export interface NavbarProps extends BaseColorProps {
    logoSrc?: string;
    logoAlt?:string
    logoText?: string;
    tabs: NavItem[];
    sticky?: boolean;
    alignment?: "left" | "center" | "right";
    ctaDestination?: string;
    buttonText?: string;
    hoverColor?: string;
  }
  export interface StandardTab {
    name:string,
    href:string
  }
  export interface FooterContact {
    address?: string;
    phone?: string;
    email?: string;
    contactLink?: string;
  }

  export interface BaseFooterProps {
    logoSrc?: string;
    logoAlt?:string
    brandName?: string;
    contact?:FooterContact
    navItems?: StandardTab[];
    // socialLinks can have either icon (old format) or platform (new format) for serialization
    socialLinks?: Array<{
      name: string;
      href: string;
      icon?: React.ElementType; // Old format - not serializable
      platform?: string; // New format - serializable platform identifier
    }>;
    developerCredit?:StandardTab;
  }

  // Footer1Props - combines footer-specific props with color props
  // This type will be properly defined when footer1 component is synced during deployment
  export interface Footer1Props extends BaseFooterProps, BaseColorProps {
    bgLayout: { type: "solid" };
  }


