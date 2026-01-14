"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { EditorialComponentProps } from "@/types/editorial";
import { useComponentEditor } from "@/context/context";
import { extractTextProps, handleComponentClick, useSyncColorEdits, useSyncLlmOutput, useSyncPageDataToComponent } from "@/lib/hooks/hooks";
import EditableTextField from "@/components/editor/editableTextField/editableTextArea";
import useWebsiteStore from "@/stores/websiteStore";
import { centeredHeroDetails, CenteredHeroProps, defaultCenteredHeroProps } from ".";
import { deriveColorPalette, useAnimatedGradient } from "@/lib/colorUtils";
import ImageField from "@/components/editor/imageField/imageField";
import { BUTTON_REGISTRY } from "@/components/ui/buttons";
import { shouldRenderButton, getButtonRenderAction, handleScrollToElement, getButtonColors } from "@/lib/utils/buttonHelpers";
import { ButtonConfig } from "@/types/button";

const CenteredHeroEdit: React.FC<EditorialComponentProps> = ({ id }) => {
  const [componentProps, setComponentProps] = useState<CenteredHeroProps>(defaultCenteredHeroProps);

  const {
    setCurrentComponent,
    currentComponent,
    setAssistantMessage,
    LlmCurrentTextOutput,
    setLlmCurrentTextOutput,
    currentColorEdits,
    setCurrentColorEdits,
  } = useComponentEditor();

  const propsWithDefaults = { ...defaultCenteredHeroProps, ...componentProps };
  const componentText = extractTextProps(propsWithDefaults);
  const colors = deriveColorPalette(propsWithDefaults, propsWithDefaults.bgLayout.type);
  const background = useAnimatedGradient(propsWithDefaults.bgLayout, colors);

  const updateComponentProps = useWebsiteStore((state) => state.updateComponentProps);
  const currentPageSlug = useWebsiteStore((state) => state.currentPageSlug);

  useSyncLlmOutput(
    currentComponent?.name,
    "CenteredHero",
    setComponentProps,
    LlmCurrentTextOutput,
    setLlmCurrentTextOutput,
    centeredHeroDetails?.editableFields
  );

  useSyncColorEdits(
    currentComponent?.name,
    "CenteredHero",
    setComponentProps,
    currentColorEdits
  );

  const onClick = () => {
    handleComponentClick({
      currentComponent: currentComponent!,
      componentDetails: { ...centeredHeroDetails, id },
      setCurrentComponent,
      setAssistantMessage,
    });
    setCurrentColorEdits({
      textColor: colors.textColor,
      baseBgColor: colors.baseBgColor,
      mainColor: colors.mainColor,
      bgLayout: colors.bgLayout,
    });
  };

  useSyncPageDataToComponent(id, "CenteredHero", setComponentProps);

  useEffect(() => {
    if (id && updateComponentProps) {
      updateComponentProps(currentPageSlug, id, componentProps);
    }
  }, [componentProps, id, currentPageSlug, updateComponentProps]);

  const updateProp = <K extends keyof CenteredHeroProps>(key: K, value: CenteredHeroProps[K]) => {
    setComponentProps((prev) => ({ ...prev, [key]: value }));
  };

  const mainImage = propsWithDefaults.images?.main ?? defaultCenteredHeroProps.images.main;

  // Get button config with backward compatibility
  const buttonConfig: ButtonConfig | undefined = propsWithDefaults.button ||
    (propsWithDefaults.buttonText ? {
      text: propsWithDefaults.buttonText,
      variant: "button1",
      action: { type: "none" },
    } : undefined);

  return (
    <motion.section
      onClick={onClick}
      style={{ background, color: colors.textColor }}
      className="relative min-h-screen flex items-center justify-center px-4 py-20 cursor-pointer"
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Subtitle */}
        <EditableTextField
          value={propsWithDefaults.subTitle}
          onChange={(val) => updateProp("subTitle", val)}
          placeholder="Subtitle"
          className="text-sm md:text-base font-semibold uppercase tracking-wider"
          style={{ color: colors.mainColor }}
          fieldKey="subTitle"
          componentId={id}
        />

        {/* Title */}
        <EditableTextField
          value={propsWithDefaults.title}
          onChange={(val) => updateProp("title", val)}
          placeholder="Main Title"
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
          style={{
            backgroundImage: `linear-gradient(to right, ${colors.mainColor}, ${colors.textColor})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          fieldKey="title"
          componentId={id}
        />

        {/* Description */}
        <EditableTextField
          value={propsWithDefaults.description}
          onChange={(val) => updateProp("description", val)}
          placeholder="Description"
          className="text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed"
          style={{ color: colors.textColor }}
          fieldKey="description"
          componentId={id}
        />

        {/* Button */}
        {buttonConfig && shouldRenderButton(buttonConfig) && (
          (() => {
            const ButtonComponent = BUTTON_REGISTRY[buttonConfig.variant];
            const renderAction = getButtonRenderAction(
              buttonConfig.action,
              handleScrollToElement
            );
            const buttonColors = getButtonColors(buttonConfig, colors);

            return (
              <ButtonComponent
                text={buttonConfig.text}
                variant={buttonConfig.variant}
                renderAction={renderAction}
                style={{
                  backgroundColor: buttonColors.backgroundColor,
                  color: buttonColors.textColor,
                }}
                className="px-8 py-4 rounded-full font-semibold text-lg shadow-lg"
              />
            );
          })()
        )}

        {/* Image */}
        {mainImage && (
          <div className="mt-12 flex justify-center">
            <div className="relative w-full max-w-2xl h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <ImageField
                value={mainImage}
                onChange={(val) =>
                  updateProp("images", { main: { ...mainImage, ...val } })
                }
                fieldKey="images.main"
                componentId={id}
              />
              {mainImage.src && (
                <Image
                  src={mainImage.src}
                  alt={mainImage.alt ?? "Hero Image"}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default CenteredHeroEdit;

