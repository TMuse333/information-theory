"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { deriveColorPalette, useAnimatedGradient } from "@/lib/colorUtils";
import { CenteredHeroProps, defaultCenteredHeroProps } from "./index";

const CenteredHero: React.FC<CenteredHeroProps> = (props) => {
  const {
    subTitle = defaultCenteredHeroProps.subTitle,
    title = defaultCenteredHeroProps.title,
    description = defaultCenteredHeroProps.description,
    buttonText = defaultCenteredHeroProps.buttonText,
    images = defaultCenteredHeroProps.images,
    textColor = defaultCenteredHeroProps.textColor,
    baseBgColor = defaultCenteredHeroProps.baseBgColor,
    mainColor = defaultCenteredHeroProps.mainColor,
    bgLayout = defaultCenteredHeroProps.bgLayout,
  } = props;

  const colors = deriveColorPalette({
    textColor,
    baseBgColor,
    mainColor,
    bgLayout,
  });

  const background = useAnimatedGradient(bgLayout, colors);
  const mainImage = images?.main || defaultCenteredHeroProps.images.main!;

  return (
    <motion.section
      style={{ background, color: colors.textColor }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen flex items-center justify-center px-4 py-20"
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-base font-semibold uppercase tracking-wider"
          style={{ color: colors.mainColor }}
        >
          {subTitle}
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
          style={{
            backgroundImage: `linear-gradient(to right, ${colors.mainColor}, ${colors.textColor})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed"
          style={{ color: colors.textColor }}
        >
          {description}
        </motion.p>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all"
            style={{
              backgroundColor: colors.mainColor,
              color: "#ffffff",
            }}
          >
            {buttonText}
          </motion.button>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-12 flex justify-center"
        >
          <div className="relative w-full max-w-2xl h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={mainImage.src}
              alt={mainImage.alt}
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CenteredHero;

