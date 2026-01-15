"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Sparkles, Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { NavItem, NavItemType } from "@/types";
import { deriveColorPalette, useAnimatedGradient } from "@/lib/colorUtils";
import { hexToRgba } from "@/lib/colorUtils/colorMath";
import { Navbar1Props } from ".";
import { ButtonConfig } from "@/types/button";
import { BUTTON_REGISTRY } from "@/components/ui/buttons";
import { shouldRenderButton, getButtonRenderAction, handleScrollToElement, getButtonColors } from "@/lib/utils/buttonHelpers";
import { getSafeImageUrl } from "@/lib/utils/imageHelpers";



const Navbar1: React.FC<Navbar1Props> = ({
  logoSrc,
  logoAlt = "Logo",
  logoText,
  tabs,
  sticky = false,
  alignment = "right",
  ctaDestination = "#",
  buttonText,
  button,
  textColor,
  baseBgColor,
  mainColor,
  bgLayout,
  hoverColor,
  excludeCurrentPage = true, // Auto-exclude current page by default
  currentPageSlug, // Optional manual override
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const pathname = usePathname(); // Detect current page
  const router = useRouter(); // For navigation

  const colors = deriveColorPalette({ textColor, baseBgColor, mainColor, bgLayout });
  const backgroundImage = useAnimatedGradient(bgLayout, colors);

  // Use hoverColor from props or fallback to theme hover color or default
  const effectiveHoverColor = hoverColor  || mainColor || "#E5E7EB";

  // Get button config with backward compatibility
  const buttonConfig: ButtonConfig | undefined = button ||
    (buttonText ? {
      text: buttonText,
      variant: "button1" as const,
      action: ctaDestination?.startsWith('#')
        ? { type: 'scroll' as const, scrollTo: ctaDestination.substring(1) }
        : { type: 'internal' as const, path: ctaDestination || '#' },
    } : undefined);

  // Helper: Check if a tab link points to the current page
  const isCurrentPage = (tabHref: string): boolean => {
    const currentSlug = currentPageSlug || pathname;

    // Normalize paths (remove leading/trailing slashes)
    const normalizeSlug = (slug: string | undefined) => {
      if (!slug) return '';
      return slug.replace(/^\//, '').replace(/\/$/, '').toLowerCase();
    };

    const normalizedHref = normalizeSlug(tabHref);
    const normalizedCurrent = normalizeSlug(currentSlug);

    // Handle index/home page
    if (normalizedCurrent === '' || normalizedCurrent === 'index') {
      return normalizedHref === '' || normalizedHref === 'index' || normalizedHref === '/';
    }

    return normalizedHref === normalizedCurrent;
  };

  // Filter tabs to exclude current page (only for 'link' type, keep scroll anchors)
  const filteredTabs = excludeCurrentPage
    ? tabs.filter(tab => {
        if (tab.type === 'link' && tab.href) {
          return !isCurrentPage(tab.href);
        }
        // Keep scroll anchors and other types
        return true;
      })
    : tabs;

  const renderNavItem = (item: NavItem, index: number, isMobile = false) => {
    const key = `${item.label}-${index}`;
    const isSubmenu = item.type === "submenu";
    const isOpen = openSubmenu === index;

    const handleClick = () => {
      if (isSubmenu) {
        setOpenSubmenu(isOpen ? null : index);
      } else if (item.type === "scroll" && item.scrollTo) {
        // Check if we need to navigate to a different page first
        if (item.targetPage) {
          const normalizeSlug = (slug: string | undefined) => {
            if (!slug) return '';
            return slug.replace(/^\//, '').replace(/\/$/, '').toLowerCase();
          };
          const normalizedTargetPage = normalizeSlug(item.targetPage);
          const normalizedCurrentPage = normalizeSlug(pathname);

          // Check if target page is home page
          const isTargetHome = normalizedTargetPage === '' || normalizedTargetPage === 'index' || normalizedTargetPage === '/';
          const isCurrentHome = normalizedCurrentPage === '' || normalizedCurrentPage === 'index';

          const needsPageSwitch = isTargetHome ? !isCurrentHome : normalizedTargetPage !== normalizedCurrentPage;

          if (needsPageSwitch) {
            // Navigate to target page with hash
            const targetPath = isTargetHome ? '/' : `/${normalizedTargetPage}`;
            router.push(`${targetPath}${item.scrollTo}`);
            setIsMobileMenuOpen(false);
            return;
          }
        }

        // If on the same page or no targetPage specified, just scroll
        const element = document.querySelector(item.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          setIsMobileMenuOpen(false);
        }
      } else {
        setIsMobileMenuOpen(false);
      }
    };

    // Check if this is the current page
    const isActive = item.type === 'link' && item.href && isCurrentPage(item.href);

    return (
      <div key={key} className={isMobile ? "block relative" : "relative"}>
        {isSubmenu ? (
          <div className="group">
            <button
              className={`navbar-tab flex items-center space-x-1 ${isMobile ? "w-full text-left px-3 py-2" : "px-3 py-2"} rounded-lg font-medium transition-colors`}
              style={{ color: colors.textColor }}
              onClick={handleClick}
            >
              <span>{item.label}</span>
              <ChevronDown className={`h-4 w-4 transform ${isOpen ? "rotate-180" : ""} transition-transform`} />
            </button>
            <AnimatePresence>
              {isOpen && item.children && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`${isMobile ? "ml-4 space-y-2" : "absolute top-full left-0 bg-white shadow-lg rounded-lg p-2 min-w-[150px]"}`}
                >
                  {item.children.map((subItem, subIndex) => (
                    <div key={`${subItem.label}-${subIndex}`}>
                      {subItem.type === "scroll" ? (
                        <button
                          onClick={() => {
                            if (subItem.scrollTo) {
                              // Check if we need to navigate to a different page first
                              if (subItem.targetPage) {
                                const normalizeSlug = (slug: string | undefined) => {
                                  if (!slug) return '';
                                  return slug.replace(/^\//, '').replace(/\/$/, '').toLowerCase();
                                };
                                const normalizedTargetPage = normalizeSlug(subItem.targetPage);
                                const normalizedCurrentPage = normalizeSlug(pathname);

                                const isTargetHome = normalizedTargetPage === '' || normalizedTargetPage === 'index' || normalizedTargetPage === '/';
                                const isCurrentHome = normalizedCurrentPage === '' || normalizedCurrentPage === 'index';

                                const needsPageSwitch = isTargetHome ? !isCurrentHome : normalizedTargetPage !== normalizedCurrentPage;

                                if (needsPageSwitch) {
                                  const targetPath = isTargetHome ? '/' : `/${normalizedTargetPage}`;
                                  router.push(`${targetPath}${subItem.scrollTo}`);
                                  setIsMobileMenuOpen(false);
                                  return;
                                }
                              }

                              // If on the same page, just scroll
                              const element = document.querySelector(subItem.scrollTo);
                              if (element) {
                                element.scrollIntoView({ behavior: "smooth" });
                                setIsMobileMenuOpen(false);
                              }
                            }
                          }}
                          className={`navbar-tab ${isMobile ? "block w-full text-left px-3 py-2" : "block px-3 py-2"} rounded-lg font-medium transition-colors`}
                          style={{ color: colors.textColor }}
                        >
                          {subItem.label}
                        </button>
                      ) : (
                        <Link
                          href={subItem.href || "#"}
                          target={subItem.target}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`navbar-tab ${isMobile ? "block w-full text-left px-3 py-2" : "block px-3 py-2"} rounded-lg font-medium transition-colors`}
                          style={{ color: colors.textColor }}
                        >
                          {subItem.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : item.type === "scroll" ? (
          <button
            className={`navbar-tab ${isMobile ? "block w-full text-left px-3 py-2" : "px-3 py-2"} rounded-lg font-medium transition-colors`}
            style={{ color: colors.textColor }}
            onClick={handleClick}
          >
            {item.label}
          </button>
        ) : (
          <Link
            href={item.href || "#"}
            target={item.target}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`navbar-tab ${isMobile ? "block w-full text-left px-3 py-2" : "px-3 py-2"} rounded-lg font-medium transition-colors relative ${isActive ? "font-bold" : ""}`}
            style={{
              color: isActive ? colors.mainColor : colors.textColor,
              borderBottom: isActive && !isMobile ? `2px solid ${colors.mainColor}` : undefined,
            }}
          >
            {item.label}
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Style tag for hover effects using dynamic color */}
      <style jsx>{`
        .navbar-tab:hover {
          background-color: ${effectiveHoverColor}20 !important;
        }
      `}</style>

      <motion.nav
        style={{
          backgroundColor: hexToRgba(colors.baseBgColor, 0.9),
          color: colors.textColor,
          backgroundImage,
          // position: sticky ? "fixed" : "relative",
          // top: 0,
          // zIndex: 50,
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full border-b border-gray-200 backdrop-blur-md shadow-sm"
      >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg shadow-md group-hover:shadow-lg transition-all overflow-hidden"
              style={{ background: `linear-gradient(to bottom right, ${colors.mainColor}, ${colors.accentColor})` }}
            >
              <Image
                src={getSafeImageUrl(logoSrc)}
                alt={logoAlt}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            {logoText && (
              <span className="text-xl font-bold" style={{ color: colors.textColor }}>{logoText}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div
            className={`hidden md:flex items-center space-x-8 ${
              alignment === "left"
                ? "justify-start"
                : alignment === "center"
                ? "justify-center flex-1"
                : "justify-end"
            }`}
          >
            {filteredTabs.map((tab, index) => renderNavItem(tab, index))}
          </div>

          {/* CTA Button - Desktop */}
          {buttonConfig && shouldRenderButton(buttonConfig) && (
            <div className="hidden md:block">
              {(() => {
                const ButtonComponent = BUTTON_REGISTRY[buttonConfig.variant];
                const renderAction = getButtonRenderAction(
                  buttonConfig.action,
                  handleScrollToElement
                );
                const buttonColors = getButtonColors(buttonConfig, colors);

                return (
                  <ButtonComponent
                    text={buttonConfig.text}
                    renderAction={renderAction}
                    style={{
                      backgroundColor: buttonColors.backgroundColor,
                      color: buttonColors.textColor,
                    }}
                    className="px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  />
                );
              })()}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: colors.textColor }}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 py-4 space-y-3"
            >
              {filteredTabs.map((tab, index) => renderNavItem(tab, index, true))}
              {buttonConfig && shouldRenderButton(buttonConfig) && (() => {
                const ButtonComponent = BUTTON_REGISTRY[buttonConfig.variant];
                const renderAction = getButtonRenderAction(
                  buttonConfig.action,
                  handleScrollToElement
                );
                const buttonColors = getButtonColors(buttonConfig, colors);

                return (
                  <div className="mt-4">
                    <ButtonComponent
                      text={buttonConfig.text}
                        renderAction={renderAction}
                      style={{
                        backgroundColor: buttonColors.backgroundColor,
                        color: buttonColors.textColor,
                      }}
                      className="w-full px-6 py-2.5 rounded-lg text-center shadow-lg"
                    />
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </motion.nav>
    </>
  );
};

export default Navbar1;