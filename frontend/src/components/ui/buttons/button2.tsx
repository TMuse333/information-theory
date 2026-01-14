"use client";

import React from "react";
import { motion } from "framer-motion";
import { BaseButtonProps } from "./buttonProps";

export const Button2: React.FC<BaseButtonProps> = ({
  text,
  renderAction,
  style,
  className = "",
  disabled = false,
}) => {
  const baseClasses = "relative px-8 py-3 rounded-lg font-semibold text-base overflow-hidden transition-all duration-300";
  const combinedClasses = `${baseClasses} ${className}`;

  const buttonContent = (
    <motion.button
      disabled={disabled}
      style={style}
      className={combinedClasses}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Animated background gradient on hover */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `linear-gradient(135deg, ${style?.backgroundColor || "#3B82F6"} 0%, ${style?.backgroundColor || "#3B82F6"}dd 100%)`,
        }}
      />
      
      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        }}
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "linear",
        }}
      />

      {/* Text content */}
      <span className="relative z-10">{text}</span>
    </motion.button>
  );

  if (renderAction.type === "link") {
    return (
      <motion.a
        href={renderAction.href}
        target={renderAction.target}
        style={style}
        className={combinedClasses}
        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.div
          className="absolute inset-0 opacity-0"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `linear-gradient(135deg, ${style?.backgroundColor || "#3B82F6"} 0%, ${style?.backgroundColor || "#3B82F6"}dd 100%)`,
          }}
        />
        <motion.div
          className="absolute inset-0 -translate-x-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          }}
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "linear",
          }}
        />
        <span className="relative z-10">{text}</span>
      </motion.a>
    );
  }

  return buttonContent;
};

