"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { deriveColorPalette, useAnimatedGradient } from "@/lib/colorUtils";
import { BUTTON_REGISTRY } from "@/components/ui/buttons";
import { shouldRenderButton, getButtonRenderAction, handleScrollToElement, getButtonColors } from "@/lib/utils/buttonHelpers";
import { ImageTextPointsProps, defaultImageTextPointsProps } from "./index";
import { ButtonConfig } from "@/types/button";

const ImageTextPoints: React.FC<ImageTextPointsProps> = (props) => {
  const {
    title = defaultImageTextPointsProps.title,
    description = defaultImageTextPointsProps.description,
    button,
    buttonText,
    images = defaultImageTextPointsProps.images,
    reverse = defaultImageTextPointsProps.reverse,
    textArray = defaultImageTextPointsProps.textArray,
    textColor = defaultImageTextPointsProps.textColor,
    baseBgColor = defaultImageTextPointsProps.baseBgColor,
    mainColor = defaultImageTextPointsProps.mainColor,
    bgLayout = defaultImageTextPointsProps.bgLayout,
  } = props;

  // Get button config with backward compatibility
  const buttonConfig: ButtonConfig | undefined = button || 
    (buttonText ? {
      text: buttonText,
      variant: "button1",
      action: { type: "none" },
    } : undefined);

  const colors = deriveColorPalette({
    textColor,
    baseBgColor,
    mainColor,
    bgLayout,
  });

  const background = useAnimatedGradient(bgLayout, colors);

  const mainImage = images?.main || defaultImageTextPointsProps.images.main;

  return (
    <motion.section
      style={{ background, color: colors.textColor }}
      className="relative px-4 py-24"
    >
      <div
        className={`mx-auto max-w-5xl flex flex-col ${
          reverse ? "md:flex-row-reverse" : "md:flex-row"
        } items-center gap-12`}
      >
        {/* Left side: header + paragraph */}
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h2 className="mb-8 text-center md:text-left text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
            {title}
          </motion.h2>
          <motion.p
            className="mb-12 max-w-lg mx-auto md:mx-0 text-center md:text-left text-base leading-relaxed md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {description}
          </motion.p>
        </motion.div>

        {/* Right side: image */}
        <motion.div
          className="md:w-1/2 max-w-sm rounded-lg overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Image
            src={mainImage.src}
            alt={mainImage.alt}
            className="w-full h-auto object-cover rounded-lg"
            width={600}
            height={1300}
          />
        </motion.div>
      </div>

      {/* Points below (from textArray) */}
      <div className="mt-16 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
        {textArray.map((point, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center text-center px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 + index * 0.2 }}
          >
            <div className="mb-4 rounded-full bg-blue-200/50 px-4 py-2 text-sm font-medium text-gray-900">
              {point.title}
            </div>
            <p className="text-base leading-relaxed">{point.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Button */}
      {buttonConfig && shouldRenderButton(buttonConfig) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-12 text-center"
        >
          {(() => {
            const ButtonComponent = BUTTON_REGISTRY[buttonConfig.variant];
            const renderAction = getButtonRenderAction(
              buttonConfig.action,
              handleScrollToElement
            );
            const buttonColors = getButtonColors(buttonConfig, colors);

            return (
              <motion.div
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="group relative flex w-fit mx-auto"
              >
                <ButtonComponent
                  text={buttonConfig.text}
                  variant={buttonConfig.variant}
                  renderAction={renderAction}
                  style={{
                    backgroundColor: buttonColors.backgroundColor,
                    color: buttonColors.textColor,
                  }}
                  className="rounded-full px-6 py-3 transition-colors"
                />
              </motion.div>
            );
          })()}
        </motion.div>
      )}
    </motion.section>
  );
};

export default ImageTextPoints;

