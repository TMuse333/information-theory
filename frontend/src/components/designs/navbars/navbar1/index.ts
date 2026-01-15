
import Navbar1Edit from "./navbar1Edit";
import Navbar1 from "./navbar1";
import { WebsiteComponent, EditorialComponentProps, EditableComponent, ImageProp, EditableField, NavbarProps, BaseColorProps, NavItemType } from "@/types";
import { ButtonConfig } from "@/types/button";


export const navbar1Details: EditableComponent = {
  name: "Navbar1",
  details: "Navigation bar with links, scroll anchors, and submenu support",
  uniqueEdits: ["items"],
  editableFields: [
    {
      key: "logoText",
      label: "Logo Text",
      description: "Text displayed in the logo area",
      type: "text",
    },
    {
      key: "logoSrc",
      label: "Logo Image",
      description: "Logo image URL",
      type: "image",
    },
    {
      key: "logoAlt",
      label: "Logo Alt Text",
      description: "Alt text for logo image",
      type: "text",
    },
    {
      key: "sticky",
      label: "Sticky Navbar",
      description: "Keep navbar at top while scrolling",
      type: "text",
    },
    {
      key: "alignment",
      label: "Navbar Alignment",
      description: "Align navbar items left, center, or right",
      type: "text",
    },
    {
      key: "button",
      label: "Call-to-Action Button",
      description: "Configure CTA button text and action",
      type: "button",
      allowedActions: ["scroll", "external", "internal", "email", "phone", "none"],
    },
    {
      key: "textColor",
      label: "Text Color",
      type: "color",
      description:'the color of the text'
    },
    {
      key: "baseBgColor",
      label: "Background Color",
      type: "color",
      description:'the color of the background'
    },
    {
      key: "mainColor",
      label: "Accent Color",
      type: "color",
      description:'the main color'
    },
    {
      key: "hoverColor",
      label: "Hover Color",
      type: "color",
      description:'the color of tabs when hovered'
    },
    // The navbar items themselves
    {
      key: "items",
      label: "Navigation Items",
      description: "Configure navigation links, scrolls, and submenus",
      type: "navbar",
      allowedItemTypes: ["link", "scroll", "external", "submenu"],
      maxDepth: 2, // Allow up to 2 levels of nesting
    } as EditableField,
  ],
  category:'navbar'
};

export interface NavItem {
  type: NavItemType;
  label: string;
  href?: string; // for link/external
  scrollTo?: string; // for scroll (component id)
  target?: "_blank"; // for external
  children?: NavItem[]; // for submenu
}





export interface Navbar1Props extends BaseColorProps {
    logoSrc?: string;
    logoAlt?:string
    logoText?: string;
    tabs: NavItem[];
    sticky?: boolean;
    alignment?: "left" | "center" | "right";
    button?: ButtonConfig;
    ctaDestination?: string; // Keep for backward compatibility
    buttonText?: string; // Keep for backward compatibility
    hoverColor?: string; // Color for tab hover effect

    // Current page detection (auto-excludes current page from navbar)
    excludeCurrentPage?: boolean; // Default: true - automatically exclude current page
    currentPageSlug?: string; // Optional manual override for current page slug
  }



export const navbar1Component: WebsiteComponent<EditorialComponentProps, Navbar1Props> = {
  editorial: Navbar1Edit,
  production: Navbar1,
  editableProps: navbar1Details,
};

export { Navbar1, Navbar1Edit };
