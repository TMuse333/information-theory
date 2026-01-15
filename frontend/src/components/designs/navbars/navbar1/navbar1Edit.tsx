'use client'
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown, Edit2, Upload } from "lucide-react";
import Image from "next/image";
import { EditorialComponentProps, NavItem } from "@/types";
import { NavbarProps } from "@/types/navbar";
import useWebsiteStore from "@/stores/websiteStore";
import { useWebsiteMasterStore } from "@/stores/websiteMasterStore";
import { useComponentEditor } from "@/context";
import { handleComponentClick, useSyncColorEdits, useSyncPageDataToComponent } from "@/lib/hooks/hooks";
import { navbar1Details, Navbar1Props } from ".";
import { deriveColorPalette, useAnimatedGradient } from "@/lib/colorUtils";
import { hexToRgba } from "@/lib/colorUtils/colorMath";
import { ButtonConfig } from "@/types/button";
import { BUTTON_REGISTRY } from "@/components/ui/buttons";
import { shouldRenderButton, getButtonRenderAction, handleScrollToElement, getButtonColors } from "@/lib/utils/buttonHelpers";
import { getSafeImageUrl } from "@/lib/utils/imageHelpers";
import ImageField from "@/components/editor/imageField/imageField";
import React from "react";

const initialProps: NavbarProps = {
  logoText: "Logo",
  tabs: [
    { type: "scroll", label: "Home", scrollTo: "#hero" },
    { type: "scroll", label: "Features", scrollTo: "#features" },
    { type: "link", label: "About", href: "/about" },
  ],
  sticky: false,
  alignment: "right",
  buttonText: "Get Started",
  ctaDestination: "/contact",
  textColor: "#000000",
  baseBgColor: "#FFFFFF",
  mainColor: "#3B82F6",
  bgLayout: { type: "solid" },
};

export const Navbar1Edit: React.FC<EditorialComponentProps> = ({ id }) => {
  const { setCurrentPageData } = useWebsiteStore();
  const currentPageData = useWebsiteStore((state) => state.currentPageData);
  const updateNavbarProps = useWebsiteStore((state) => state.updateNavbarProps);
  const updateComponentProps = useWebsiteStore((state) => state.updateComponentProps);
  const websiteMaster = useWebsiteMasterStore((state) => state.websiteMaster);
  const { switchToPage, currentPageIndex } = useWebsiteMasterStore();

  const {
    currentComponent,
    setCurrentComponent,
    setAssistantMessage,
    currentColorEdits,
    setCurrentColorEdits,
  } = useComponentEditor();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);
  const hasSyncedRef = React.useRef(false);

  // Get navbar component from store
  const navbarComponent = currentPageData?.components.find(
    (c) => c.type === "navbar1"
  );
  let navbarProps = (navbarComponent?.props as NavbarProps) || initialProps;

  // Apply theme colors if they're missing from props but exist in theme
  if (websiteMaster?.theme && (!navbarProps.textColor || !navbarProps.baseBgColor || !navbarProps.mainColor)) {
    navbarProps = {
      ...navbarProps,
      textColor: navbarProps.textColor || websiteMaster.theme.colors.text?.primary || websiteMaster.theme.colors.navbar.text,
      baseBgColor: navbarProps.baseBgColor || websiteMaster.theme.colors.navbar.background,
      mainColor: navbarProps.mainColor || websiteMaster.theme.colors.primary,
      hoverColor: navbarProps.hoverColor || websiteMaster.theme.colors.navbar.hover || websiteMaster.theme.colors.primary,
    };
  }

  const [componentProps, setComponentProps] = useState<Navbar1Props>(navbarProps);

  const handleUpdate = (updates: Partial<NavbarProps>) => {
    if (navbarComponent?.id) {
      updateNavbarProps(navbarComponent.id, updates);
      setComponentProps(prev => ({ ...prev, ...updates }));
    }
  };

  const colors = deriveColorPalette(componentProps, componentProps.bgLayout.type);
  const backgroundImage = useAnimatedGradient(componentProps.bgLayout, colors);
  const effectiveHoverColor = componentProps.hoverColor || componentProps.mainColor || "#E5E7EB";

  // Get button config with backward compatibility
  const buttonConfig: ButtonConfig | undefined = componentProps.button ||
    (componentProps.buttonText ? {
      text: componentProps.buttonText,
      variant: "button1" as const,
      action: componentProps.ctaDestination?.startsWith('#')
        ? { type: 'scroll' as const, scrollTo: componentProps.ctaDestination.substring(1) }
        : { type: 'internal' as const, path: componentProps.ctaDestination || '#' },
    } : undefined);

  const onClick = () => {
    handleComponentClick({
      currentComponent: currentComponent!,
      componentDetails: navbar1Details,
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

  useSyncColorEdits(
    currentComponent?.name,
    "Navbar1",
    setComponentProps,
    currentColorEdits
  );

  // Sync component props from store and apply theme colors
  useEffect(() => {
    if (!currentPageData) return;

    const componentInstance = currentPageData.components.find((c) => c.id === id);
    if (!componentInstance || !componentInstance.props) return;

    // Get props from store
    const propsFromStore = componentInstance.props as Navbar1Props;

    // Apply theme colors only if missing
    const updatedProps: Navbar1Props = {
      ...propsFromStore,
      textColor: propsFromStore.textColor || websiteMaster?.theme?.colors.text?.primary || websiteMaster?.theme?.colors.navbar.text || "#1A1A1A",
      baseBgColor: propsFromStore.baseBgColor || websiteMaster?.theme?.colors.navbar.background || "#FFFFFF",
      mainColor: propsFromStore.mainColor || websiteMaster?.theme?.colors.primary || "#3B82F6",
      hoverColor: propsFromStore.hoverColor || websiteMaster?.theme?.colors.navbar.hover || websiteMaster?.theme?.colors.primary || "#3B82F6",
    };

    // Only update if props actually changed (prevent infinite loop)
    setComponentProps(prev => {
      // Deep comparison of important fields
      const hasChanged =
        prev.textColor !== updatedProps.textColor ||
        prev.baseBgColor !== updatedProps.baseBgColor ||
        prev.mainColor !== updatedProps.mainColor ||
        prev.hoverColor !== updatedProps.hoverColor ||
        prev.tabs !== updatedProps.tabs ||
        prev.logoText !== updatedProps.logoText ||
        prev.logoSrc !== updatedProps.logoSrc;

      if (!hasChanged && hasSyncedRef.current) {
        return prev; // No change, return previous to avoid re-render
      }

      hasSyncedRef.current = true;
      return updatedProps;
    });
  }, [id, currentPageData, websiteMaster?.theme]);

  // Focus text input when editing starts
  useEffect(() => {
    if (isEditingText && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.select();
    }
  }, [isEditingText]);

  // Handle navigation clicks - use PageSwitcher instead of actual navigation
  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🖱️ [Navbar1Edit] Tab clicked:', { type: item.type, label: item.label, href: item.href });

    if (item.type === 'link' && item.href && websiteMaster) {
      console.log('📋 [Navbar1Edit] Available pages:', websiteMaster.pages.map((p, i) => ({ index: i, slug: p.slug, name: p.pageName })));
      console.log('📍 [Navbar1Edit] Current page index:', currentPageIndex);

      // Check if pages have valid slugs - if not, warn user to regenerate
      const hasValidSlugs = websiteMaster.pages.some(p => p.slug && p.slug !== '');
      if (!hasValidSlugs) {
        console.error('⚠️ [Navbar1Edit] Pages have no slugs! This is an old website. Please generate a new one.');
        alert('This website needs to be regenerated with the updated template. Please create a new website to use the page switcher feature.');
        return;
      }

      // Normalize slugs for comparison
      const normalizeSlug = (slug: string | undefined) => {
        if (!slug) return '';
        return slug.replace(/^\//, '').replace(/\/$/, '').toLowerCase();
      };

      const targetSlug = normalizeSlug(item.href);
      console.log('🎯 [Navbar1Edit] Looking for page with slug:', targetSlug);

      // Find the page by slug
      const pageIndex = websiteMaster.pages.findIndex(p => {
        const pageSlug = normalizeSlug(p.slug);
        const match = pageSlug === targetSlug ||
                     (targetSlug === '' && (pageSlug === '' || pageSlug === 'index')) ||
                     (targetSlug === 'index' && pageSlug === '');
        if (match) {
          console.log('✅ [Navbar1Edit] Found matching page:', { index: p, slug: p.slug, pageSlug });
        }
        return match;
      });

      console.log('🔍 [Navbar1Edit] Page index found:', pageIndex);

      if (pageIndex !== -1 && pageIndex !== currentPageIndex) {
        console.log(`🔄 [Navbar1Edit] Switching to page: ${websiteMaster.pages[pageIndex].pageName}`);
        switchToPage(pageIndex);
      } else if (pageIndex === currentPageIndex) {
        console.log(`ℹ️ [Navbar1Edit] Already on this page`);
      } else {
        console.log(`⚠️ [Navbar1Edit] Page not found for href:`, item.href);
      }
    } else if (item.type === 'scroll' && item.scrollTo) {
      // Check if we need to navigate to a different page first
      if (item.targetPage && websiteMaster) {
        const currentPage = websiteMaster.pages[currentPageIndex];
        const normalizeSlug = (slug: string | undefined) => {
          if (!slug) return '';
          return slug.replace(/^\//, '').replace(/\/$/, '').toLowerCase();
        };
        const normalizedTargetPage = normalizeSlug(item.targetPage);
        const normalizedCurrentPage = normalizeSlug(currentPage?.slug);

        // Check if target page is home page
        const isTargetHome = normalizedTargetPage === '' || normalizedTargetPage === 'index' || normalizedTargetPage === '/';
        const isCurrentHome = normalizedCurrentPage === '' || normalizedCurrentPage === 'index';

        const needsPageSwitch = isTargetHome ? !isCurrentHome : normalizedTargetPage !== normalizedCurrentPage;

        if (needsPageSwitch) {
          // Find the target page
          const targetPageIndex = websiteMaster.pages.findIndex(p => {
            const pageSlug = normalizeSlug(p.slug);
            if (isTargetHome) {
              return pageSlug === '' || pageSlug === 'index';
            }
            return pageSlug === normalizedTargetPage;
          });

          if (targetPageIndex !== -1) {
            console.log(`🔄 [Navbar1Edit] Switching to page for scroll: ${websiteMaster.pages[targetPageIndex].pageName}`);
            switchToPage(targetPageIndex);

            // Schedule scroll after page switch (DOM needs time to update)
            setTimeout(() => {
              const element = document.getElementById(item.scrollTo!);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }, 300);
          }
          setIsMobileMenuOpen(false);
          return;
        }
      }

      // If on the same page or no targetPage specified, just scroll
      const element = document.getElementById(item.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }

    setIsMobileMenuOpen(false);
  };

  const handleLogoTextUpdate = (newText: string) => {
    handleUpdate({ logoText: newText });
    setIsEditingText(false);
  };

  const handleLogoImageUpdate = (imageData: { src: string; alt: string }) => {
    handleUpdate({
      logoSrc: imageData.src,
      logoAlt: imageData.alt
    });
  };

  const tabs = componentProps.tabs || [];

  // Helper: Check if a tab link points to the current page being edited
  const isCurrentPage = (tabHref: string): boolean => {
    if (!websiteMaster || currentPageIndex === undefined) return false;

    const currentPage = websiteMaster.pages[currentPageIndex];
    if (!currentPage || !currentPage.slug) return false;

    // Normalize paths (remove leading/trailing slashes)
    const normalizeSlug = (slug: string | undefined) => {
      if (!slug) return '';
      return slug.replace(/^\//, '').replace(/\/$/, '').toLowerCase();
    };

    const normalizedHref = normalizeSlug(tabHref);
    const normalizedCurrent = normalizeSlug(currentPage.slug);

    // Handle index/home page
    if (normalizedCurrent === '' || normalizedCurrent === 'index') {
      return normalizedHref === '' || normalizedHref === 'index' || normalizedHref === '/';
    }

    return normalizedHref === normalizedCurrent;
  };

  return (
    <>
      {/* Editing hints overlay */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-2 text-sm">
        <p className="text-blue-900 font-medium">
          📝 Editor Mode: Links use Page Switcher • Click logo to upload • Click text to edit
        </p>
      </div>

      <div onClick={onClick} className="relative">
        {/* Style tag for hover effects */}
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
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full border-b border-gray-200 backdrop-blur-md shadow-sm"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo Section with Upload */}
              <div className="flex items-center space-x-3 group relative">
                {/* Logo Image/Upload */}
                <div
                  className="relative cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLogoUpload(!showLogoUpload);
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-dashed border-transparent hover:border-blue-500"
                    style={{ background: `linear-gradient(to bottom right, ${colors.mainColor}, ${colors.accentColor})` }}
                  >
                    <Image
                      src={getSafeImageUrl(componentProps.logoSrc)}
                      alt={componentProps.logoAlt || "Logo"}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Upload hint */}
                  <div className="absolute -bottom-8 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Click to upload logo
                  </div>
                </div>

                {/* Logo Upload Modal */}
                {showLogoUpload && navbarComponent && (
                  <div
                    className="absolute top-12 left-0 z-50 bg-white rounded-lg shadow-xl p-4 border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Upload Logo</h3>
                      <button
                        onClick={() => setShowLogoUpload(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <ImageField
                      value={{
                        src: componentProps.logoSrc || "",
                        alt: componentProps.logoAlt || "Logo"
                      }}
                      onChange={handleLogoImageUpdate}
                      placeholder="Drop logo here"
                      fieldKey="logoSrc"
                      componentId={navbarComponent.id}
                      className="w-32 h-32"
                    />
                  </div>
                )}

                {/* Logo Text - Editable */}
                {componentProps.logoText && (
                  <div className="relative group">
                    {isEditingText ? (
                      <input
                        ref={textInputRef}
                        type="text"
                        defaultValue={componentProps.logoText}
                        onBlur={(e) => handleLogoTextUpdate(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleLogoTextUpdate(e.currentTarget.value);
                          }
                          if (e.key === 'Escape') {
                            setIsEditingText(false);
                          }
                          e.stopPropagation();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xl font-bold bg-white border-2 border-blue-500 rounded px-2 py-1"
                        style={{ color: colors.textColor }}
                      />
                    ) : (
                      <div
                        className="flex items-center gap-2 cursor-text hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingText(true);
                        }}
                      >
                        <span className="text-xl font-bold" style={{ color: colors.textColor }}>
                          {componentProps.logoText}
                        </span>
                        <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop Navigation */}
              <div
                className={`hidden md:flex items-center space-x-8 ${
                  componentProps.alignment === "left"
                    ? "justify-start"
                    : componentProps.alignment === "center"
                    ? "justify-center flex-1"
                    : "justify-end"
                }`}
              >
                {tabs.map((tab, index) => {
                  // Check if this is the current page
                  const isActive = tab.type === 'link' && tab.href && isCurrentPage(tab.href);

                  return (
                    <button
                      key={index}
                      onClick={(e) => handleNavClick(tab, e)}
                      className={`navbar-tab px-3 py-2 rounded-lg transition-colors relative group ${isActive ? "font-bold" : "font-medium"}`}
                      style={{
                        color: isActive ? colors.mainColor : colors.textColor,
                        borderBottom: isActive ? `2px solid ${colors.mainColor}` : undefined,
                      }}
                    >
                      {tab.label}
                      {tab.type === 'link' && (
                        <span className="absolute -bottom-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {isActive ? 'Current page' : `Switches to ${tab.label} page`}
                        </span>
                      )}
                    </button>
                  );
                })}

                {buttonConfig && shouldRenderButton(buttonConfig) && (() => {
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
                      className="px-6 py-2 rounded-full font-semibold transition-all"
                    />
                  );
                })()}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg transition-colors hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                style={{ color: colors.textColor }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden overflow-hidden border-t border-gray-200"
                style={{ backgroundColor: colors.baseBgColor }}
              >
                <div className="px-4 py-4 space-y-2">
                  {tabs.map((tab, index) => {
                    // Check if this is the current page
                    const isActive = tab.type === 'link' && tab.href && isCurrentPage(tab.href);

                    return (
                      <button
                        key={index}
                        onClick={(e) => handleNavClick(tab, e)}
                        className={`navbar-tab block w-full text-left px-3 py-2 rounded-lg transition-colors ${isActive ? "font-bold" : "font-medium"}`}
                        style={{
                          color: isActive ? colors.mainColor : colors.textColor,
                          borderLeft: isActive ? `3px solid ${colors.mainColor}` : undefined,
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
    </>
  );
};

export default Navbar1Edit;
