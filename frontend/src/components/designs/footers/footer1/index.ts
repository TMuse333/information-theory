import Footer1Edit from "./footer1Edit";
import Footer1 from "./footer1";
import {
  WebsiteComponent,
  EditorialComponentProps,
  BaseComponentProps,
  EditableComponent,
  NavItem,
  BaseFooterProps,
  BaseColorProps,
} from "@/types";

export const footer1Details: EditableComponent = {
    name: "Footer1",
    details: "A simple and clean footer with logo, contact info, navigation links, and social icons.",
    uniqueEdits: [],
    editableFields: [
      // Branding
      { key: "logoSrc", label: "Logo Source", description: "URL of the logo image", type: "text" },
      { key: "logoAlt", label: "Logo Alt Text", description: "Alt text for the logo image", type: "text" },
      { key: "brandName", label: "Brand Name", description: "The name of your brand or company displayed in the footer", type: "text" },
  
      // Contact Info
      {
        key: "contact",
        label: "Contact Info",
        description: "Contact details like phone, email, or address.",
        type: "standardTabArray",
        arrayLength: { min: 1, max: 3 },
        itemSchema: {
          nameLabel: "Label (e.g. Email, Phone, Address)",
          hrefLabel: "Value (e.g. info@domain.com or tel:+123456789)",
          hrefType: "url",
        },
      },
  
      // Navigation Links
      {
        key: "navItems",
        label: "Navigation Links",
        description: "Links to important pages like Home, About, Contact, etc.",
        type: "standardTabArray",
        arrayLength: { min: 2, max: 6 },
        itemSchema: {
          nameLabel: "Link Label",
          hrefLabel: "Link URL",
          hrefType: "url",
        },
      },
  
      // Social Links
      {
        key: "socialLinks",
        label: "Social Links",
        description: "List of social media profiles with icons.",
        type: "standardTabArray",
        arrayLength: { min: 1, max: 5 },
        itemSchema: {
          nameLabel: "Platform Name (e.g. Facebook)",
          hrefLabel: "Profile URL",
          hrefType: "url",
        },
      },
  
      // Developer Credit
      {
        key: "developerCredit",
        label: "Developer Credit",
        description: "Credit section for developer name and URL.",
        type: "standardTabArray",
        arrayLength: { fixed: 1 },
        itemSchema: {
          nameLabel: "Developer Name",
          hrefLabel: "Developer Website URL",
          hrefType: "url",
        },
      },
  
      // Colors
      { key: "textColor", label: "Text Color", description: "Color of text elements in the footer", type: "color" },
      { key: "baseBgColor", label: "Background Color", description: "Base background color of the footer", type: "color" },
      { key: "mainColor", label: "Accent Color", description: "Accent or link color for footer links", type: "color" },
    ],
    category: "footer",
  };
  

export interface Footer1Props extends BaseFooterProps,BaseColorProps {
    bgLayout: { type: "solid" };
}

export const footer1Component: WebsiteComponent<
  EditorialComponentProps,
  Footer1Props
> = {
  editorial: Footer1Edit,
  production: Footer1,
  editableProps: footer1Details,
};

export { Footer1, Footer1Edit };
