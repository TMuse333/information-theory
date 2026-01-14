import CenteredHeroEdit from "./centeredHeroEdit";
import { EditableComponent } from "@/types/editorial";
import { BaseComponentProps, ImageProp } from "@/types";;
import { ButtonConfig } from "@/types/button";

export const centeredHeroDetails: EditableComponent = {
  name: "CenteredHero",
  details: "A clean, centered hero section with title, description, and optional image. Perfect for minimalist designs.",
  uniqueEdits: [],
  editableFields: [
    {
      key: "subTitle",
      label: "Subtitle",
      description: "Small text above the main headline",
      type: "text",
      wordLimit: 6,
    },
    {
      key: "title",
      label: "Title",
      description: "Main headline text",
      type: "text",
      wordLimit: 12,
    },
    {
      key: "description",
      label: "Description",
      description: "Supporting text below the headline",
      type: "text",
      wordLimit: 30,
    },
    {
      key: "button",
      label: "Call-to-Action Button",
      description: "Configure button text and action",
      type: "button",
      allowedActions: ["scroll", "external", "internal", "email", "phone", "none"],
    },
    {
      key: "images.main",
      label: "Hero Image",
      description: "Optional centered image below the text",
      type: "image",
    },
    {
      key: "textColor",
      label: "Text Color",
      description: "Main text color, should contrast with background",
      type: "color",
    },
    {
      key: "baseBgColor",
      label: "Background Color",
      description: "Base background color for the hero section",
      type: "color",
    },
    {
      key: "mainColor",
      label: "Main Color",
      description: "Accent color for buttons and highlights",
      type: "color",
    },
    {
      key: "bgLayout",
      label: "Background Layout",
      description: "Background gradient layout",
      type: "color",
    },
  ],
  category: "hero",
};

export interface CenteredHeroProps extends Partial<BaseComponentProps> {
  subTitle?: string;
  title?: string;
  description?: string;
  button?: ButtonConfig;
  buttonText?: string;
  images?: {
    main?: ImageProp;
  };
}

export const defaultCenteredHeroProps: Required<Omit<CenteredHeroProps, 'images'>> & { images: { main?: ImageProp } } = {
  subTitle: "Welcome",
  title: "Your Compelling Headline",
  description: "A clear and concise description that captures attention and communicates your value proposition.",
  button: {
    text: "Get Started",
    variant: "button1",
    action: { type: "none" },
  } as ButtonConfig,
  buttonText: "Get Started", // Keep for backward compatibility
  textColor: "#1f2937",
  baseBgColor: "#ffffff",
  mainColor: "#3B82F6",
  bgLayout: {
    type: "radial" as const,
    radialSize: "125% 125%",
    radialPosition: "50% 50%",
    radialBaseStop: 50,
  },
  images: {
    main: {
      src: "/placeholder.webp",
      alt: "Hero Image",
    },
  },
  array: [],
  items: [],
};

export { CenteredHeroEdit };

