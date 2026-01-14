// components/imageTextBox/index.ts
import ImageTextBoxEdit from "./imageTextBoxEdit";
import { EditableComponent } from "@/types/editorial";
import { BaseComponentProps, ImageProp } from "@/types";;
import { ButtonConfig } from "@/types/button";

export const imageTextBoxDetails: EditableComponent = {
  name: "ImageTextBox",
  details:
    "A flexible image and text section with optional reverse layout, background color, and styling options.",
  uniqueEdits: [

  ],
  editableFields: [
    {
      key: "images.main",
      label: "Main Image",
      description: "Upload or select the main image for this section.",
      type: "image",
    },
    {
      key: "title",
      label: "Title",
      description: "Main title text displayed over the image or section.",
      type: "text",
      wordLimit: 15,
    },
    {
      key: "description",
      label: "Description",
      description: "Supporting text under the title.",
      type: "text",
      wordLimit: 50,
    },
    {
      key: "button",
      label: "Call-to-Action Button",
      description: "Configure button text and action",
      type: "button",
      allowedActions: ["scroll", "external", "internal", "email", "phone", "none"],
    },
    {
      key: "textColor",
      label: "Text Color",
      description: "Color of the text in this section.",
      type: "color",
    },
    {
      key: "baseBgColor",
      label: "Background Color",
      description: "Background color of the section.",
      type: "color",
    },
    {
      key: "mainColor",
      label: "Main color",
      description: "Foreground color for buttons, borders, and accents.",
      type: "color",
    },
    {
      key: "bgLayout",
      label: "Background layout",
      description: "The layout for the background colors.",
      type: "color",
    },
  ],
  category:'contentPiece'
};

export const defaultImageTextBoxProps = {
  images: {
    main: {
      src: "/placeholder.webp",
      alt: "Featured Image",
    } as ImageProp,
  },
  title: "Stunning Visuals Meet Powerful Words",
  description: "This section combines a bold image with compelling text to tell your story with impact and elegance.",
  button: {
    text: "Learn More",
    variant: "button1",
    action: { type: "none" },
  } as ButtonConfig,
  buttonText: "Learn More", // Keep for backward compatibility
  reverse: false,
  objectContain: false,
  textColor: "#1f2937",
  baseBgColor: "#f0f9ff",
  mainColor: "#3B82F6",
  bgLayout: {
    type: "radial",
    radialSize: "125% 125%",
    radialPosition: "50% 0%",
    radialBaseStop: 50,
  } as const,
  items: [],
  array: [],
}

export interface ImageTextBoxProps extends Partial<BaseComponentProps> {
  images?: {
    main?: ImageProp;
  };
  title?: string;
  description?: string;
  button?: ButtonConfig;
  buttonText?: string;
  reverse?: boolean;
  objectContain?: boolean;
}

export { ImageTextBoxEdit };
