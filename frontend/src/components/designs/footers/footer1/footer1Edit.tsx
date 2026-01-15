

"use client";

import React, { useState, useEffect, useRef } from "react";
import { EditorialComponentProps } from "@/types/editorial";
import { footer1Details, Footer1Props } from ".";
import Footer1 from "./footer1";
import useWebsiteStore from "@/stores/websiteStore";
import { useComponentEditor } from "@/context";
import { handleComponentClick, useSyncColorEdits, useSyncPageDataToComponent } from "@/lib/hooks/hooks";
import { deriveColorPalette } from "@/lib/colorUtils";

// Example defaults
const initialFooterProps: Footer1Props = {
  brandName: "FocusFlow Software",
  logoSrc: "/remax-nova-flag.webp",
  navItems: [
    { name: "Home", href: "/" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy", href: "/privacy" },
  ],
  baseBgColor:'#FFFFFF',
  mainColor:'#00bfff',
  textColor:'#000000',
  bgLayout:{
    type:'solid'
  },
  socialLinks: [],
  developerCredit: {
    name:'Developed by Focusflow Software',
    href:'https://www.focusflowsoftware.com'
  },
  contact:{
    address:'123 main street',
    phone:'(123)-456-9810',
    email:'ceo@company.com',
    contactLink:'/'
  }
};

export const Footer1Edit: React.FC<EditorialComponentProps> = ({ id }) => {
  const { currentPageData, currentPageSlug, updateComponentProps, websiteData, setCurrentPageSlug } = useWebsiteStore();
  const { currentComponent, setCurrentComponent, setAssistantMessage, currentColorEdits, setCurrentColorEdits } =
    useComponentEditor();

  const footerComponent = currentPageData?.components.find((c) => c.id === id || c.componentCategory === "footer");
  const footerProps = (footerComponent?.props as Footer1Props) || initialFooterProps;

  const [componentProps, setComponentProps] = useState<Footer1Props>(footerProps);
  const hasSyncedRef = useRef(false);

  const handleUpdate = (updates: Partial<Footer1Props>) => {
    if (footerComponent?.id) {
      updateComponentProps(currentPageSlug, footerComponent.id, updates);
      setComponentProps(prev => ({ ...prev, ...updates }));
    }
  };

  const colors = deriveColorPalette(componentProps, "solid");

  const onClick = () => {
    handleComponentClick({
      currentComponent: currentComponent!,
      componentDetails: { ...footer1Details, id },
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

  useSyncColorEdits(currentComponent?.name, "Footer1", setComponentProps, currentColorEdits);

  // Sync component props from store
  useEffect(() => {
    if (!currentPageData) return;

    const componentInstance = currentPageData.components.find((c) => c.id === id || c.componentCategory === "footer");
    if (!componentInstance || !componentInstance.props) return;

    const propsFromStore = componentInstance.props as Footer1Props;

    setComponentProps(prev => {
      // Deep comparison for arrays and objects
      const navItemsChanged = JSON.stringify(prev.navItems) !== JSON.stringify(propsFromStore.navItems);
      const contactChanged = JSON.stringify(prev.contact) !== JSON.stringify(propsFromStore.contact);
      const socialLinksChanged = JSON.stringify(prev.socialLinks) !== JSON.stringify(propsFromStore.socialLinks);
      const developerCreditChanged = JSON.stringify(prev.developerCredit) !== JSON.stringify(propsFromStore.developerCredit);
      
      const hasChanged =
        prev.brandName !== propsFromStore.brandName ||
        prev.logoSrc !== propsFromStore.logoSrc ||
        prev.logoAlt !== propsFromStore.logoAlt ||
        navItemsChanged ||
        contactChanged ||
        socialLinksChanged ||
        developerCreditChanged ||
        prev.textColor !== propsFromStore.textColor ||
        prev.baseBgColor !== propsFromStore.baseBgColor ||
        prev.mainColor !== propsFromStore.mainColor;

      if (!hasChanged && hasSyncedRef.current) {
        return prev;
      }

      hasSyncedRef.current = true;
      console.log('🔄 [Footer1Edit] Syncing props from store:', propsFromStore);
      return propsFromStore;
    });
  }, [id, currentPageData]);

  useSyncPageDataToComponent(id, 'Footer1', setComponentProps);

  // Handle navigation link clicks - use PageSwitcher instead of actual navigation
  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!href || !websiteData) return;

    // Normalize slugs for comparison
    const normalizeSlug = (slug: string | undefined) => {
      if (!slug) return '';
      return slug.replace(/^\//, '').replace(/\/$/, '').toLowerCase();
    };

    const targetSlug = normalizeSlug(href);
    const currentSlug = normalizeSlug(currentPageSlug);

    // Find the page by slug
    const targetPage = websiteData.pages?.find(p => {
      const pageSlug = normalizeSlug(p.slug);
      return pageSlug === targetSlug ||
             (targetSlug === '' && (pageSlug === '' || pageSlug === 'index')) ||
             (targetSlug === 'index' && pageSlug === '');
    });

    if (targetPage && normalizeSlug(targetPage.slug) !== currentSlug) {
      setCurrentPageSlug(targetPage.slug || 'index');
    }
  };

  // Wrap Footer1 to intercept link clicks
  const FooterWithClickHandler = (props: Footer1Props) => {
    return (
      <div 
        onClick={(e) => {
          // Intercept clicks on navigation links only (not social links, mailto, tel, or external links)
          const target = e.target as HTMLElement;
          const link = target.closest('a[href]');
          if (link) {
            const href = link.getAttribute('href');
            const targetAttr = link.getAttribute('target');
            
            // Only intercept internal navigation links (starting with /, not mailto:, tel:, http://, https://)
            // Don't intercept social links (they have target="_blank") or contact links (mailto/tel)
            if (href && 
                href.startsWith('/') && 
                !href.startsWith('//') &&
                !targetAttr && // Not external links
                !href.startsWith('mailto:') &&
                !href.startsWith('tel:')) {
              e.preventDefault();
              e.stopPropagation();
              handleLinkClick(href, e as any);
              return false;
            }
          }
        }}
      >
        <Footer1 {...props} />
      </div>
    );
  };

  return (
    <div onClick={onClick} className="space-y-4">
      {/* Preview */}
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
        <FooterWithClickHandler {...componentProps} />
      </div>
    </div>
  );
};

export default Footer1Edit;
