"use client";

import React from "react";
import { motion } from "framer-motion";
import { BaseButtonProps } from "./buttonProps";

export const Button3: React.FC<BaseButtonProps> = ({
  text,
  renderAction,
  style,
  className = "",
  disabled = false,
}) => {
  const baseClasses = "relative px-8 py-3 rounded-full font-semibold text-base overflow-hidden border-2 transition-all duration-300";
  const combinedClasses = `${baseClasses} ${className}`;

  const buttonContent = (
    <motion.button
      disabled={disabled}
      style={{
        ...style,
        backgroundColor: "transparent",
        borderColor: style?.backgroundColor || "#3B82F6",
        color: style?.backgroundColor || "#3B82F6",
      }}
      className={combinedClasses}
      whileHover={{
        scale: 1.08,
        backgroundColor: style?.backgroundColor || "#3B82F6",
        color: style?.color || "#ffffff",
        borderColor: style?.backgroundColor || "#3B82F6",
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
    >
      {/* Ripple effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: style?.backgroundColor || "#3B82F6",
          opacity: 0,
        }}
        whileHover={{
          scale: [1, 1.5, 1.8],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
      />

      {/* Pulsing dot indicator */}
      <motion.div
        className="absolute top-2 right-2 w-2 h-2 rounded-full"
        style={{
          backgroundColor: style?.backgroundColor || "#3B82F6",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Text content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {text}
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          →
        </motion.span>
      </span>
    </motion.button>
  );

  if (renderAction.type === "link") {
    return (
      <motion.a
        href={renderAction.href}
        target={renderAction.target}
        style={{
          ...style,
          backgroundColor: "transparent",
          borderColor: style?.backgroundColor || "#3B82F6",
          color: style?.backgroundColor || "#3B82F6",
        }}
        className={combinedClasses}
        whileHover={{
          scale: 1.08,
          backgroundColor: style?.backgroundColor || "#3B82F6",
          color: style?.color || "#ffffff",
          borderColor: style?.backgroundColor || "#3B82F6",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: style?.backgroundColor || "#3B82F6",
            opacity: 0,
          }}
          whileHover={{
            scale: [1, 1.5, 1.8],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
        />
        <motion.div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{
            backgroundColor: style?.backgroundColor || "#3B82F6",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {text}
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            →
          </motion.span>
        </span>
      </motion.a>
    );
  }

  return buttonContent;
};

