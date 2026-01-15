"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Link as LinkIcon } from "lucide-react";
import { getSafeImageUrl } from "@/lib/utils/imageHelpers";
import { Footer1Props } from "."; // import your Footer1Props interface

// Map platform string to icon component
const getPlatformIcon = (platform?: string): React.ElementType => {
  switch (platform) {
    case 'instagram': return Instagram;
    case 'facebook': return Facebook;
    case 'twitter': return Twitter;
    case 'linkedin': return Linkedin;
    case 'youtube': return Youtube;
    default: return LinkIcon;
  }
};

const Footer: React.FC<Footer1Props> = ({
  logoSrc,
  logoAlt,
  brandName,
  contact,
  navItems,
  socialLinks,
  developerCredit,
  textColor,
  baseBgColor,
  mainColor,
  bgLayout, // this will always be { type: "solid" }
}) => {
  console.log('📄 [Footer1] Rendering footer with props:', {
    socialLinksCount: socialLinks?.length || 0,
    socialLinks: socialLinks,
    contact: contact,
    navItemsCount: navItems?.length || 0,
  });
  return (
    <footer
      className="w-full border-t"
      style={{ backgroundColor: baseBgColor, color: textColor }}
    >
      <div className="max-w-[1200px] mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="flex flex-col-reverse">
          {brandName && (
            <Link href="/" className="flex flex-col items-center md:items-start">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold mt-4" style={{ color: textColor }}>
                {brandName}
              </span>
            </Link>
          )}
          {logoSrc && (
            <Image
              src={!logoSrc.includes('example.com') && !logoSrc.includes('fasttrack.com') ? logoSrc : "/placeholder.webp"}
              alt={logoAlt || `${brandName || "Brand"} logo`}
              width={600}
              height={1300}
              className="w-[100px] mb-8 scale-[1.5] rounded-md mt-4 mx-auto object-cover"
            />
          )}
        </div>

        {/* Contact Info */}
        {contact && (
          <div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4" style={{ color: textColor }}>
              Contact
            </h3>
            {contact.address && <p className="text-sm sm:text-base md:text-lg mb-2">{contact.address}</p>}
            {contact.phone && (
              <p className="text-sm sm:text-base md:text-lg mb-2">
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                  style={{ color: mainColor }}
                  className="hover:underline transition-colors"
                >
                  {contact.phone}
                </a>
              </p>
            )}
            {contact.email && (
              <p className="text-sm sm:text-base md:text-lg mb-2">
                <a
                  href={`mailto:${contact.email}`}
                  style={{ color: mainColor }}
                  className="hover:underline transition-colors"
                >
                  {contact.email}
                </a>
              </p>
            )}
            {contact.contactLink && (
              <a
                href={contact.contactLink}
                className="text-sm sm:text-base md:text-lg hover:underline transition-colors"
                style={{ color: mainColor }}
              >
                Get in Touch
              </a>
            )}
          </div>
        )}

        {/* Social Icons - Show even if contact is not present */}
        {socialLinks && socialLinks.length > 0 && (
          <div className={contact ? "mt-6" : ""}>
            {!contact && (
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4" style={{ color: textColor }}>
                Follow Us
              </h3>
            )}
            <div className="flex gap-4">
              {socialLinks.map((link, index) => {
                // Handle both old format (with icon) and new format (with platform)
                const linkAny = link as any;
                const platform = linkAny.platform;
                const Icon = linkAny.icon 
                  ? linkAny.icon 
                  : getPlatformIcon(platform);
                const linkName = link.name || `Social ${index + 1}`;
                
                console.log('🔗 [Footer1] Rendering social link:', { 
                  index, 
                  name: linkName, 
                  href: link.href, 
                  platform,
                  hasIcon: !!linkAny.icon,
                  IconComponent: Icon?.name || 'unknown'
                });
                
                if (!Icon) {
                  console.warn('⚠️ [Footer1] No icon found for social link:', link);
                  return null;
                }
                
                return (
                  <a
                    key={`${linkName}-${index}`}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={linkName}
                    className="w-10 h-10 flex items-center justify-center rounded-full border-2"
                    style={{ 
                      backgroundColor: baseBgColor, 
                      color: mainColor,
                      borderColor: mainColor 
                    }}
                    title={linkName}
                  >
                    <Icon size={18} color={mainColor} />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        {navItems && navItems.length > 0 && (
          <div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4" style={{ color: textColor }}>
              Navigation
            </h3>
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm sm:text-base md:text-lg hover:underline transition-colors"
                    style={{ color: mainColor }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Developer Credit */}
      {developerCredit && (
        <div className="text-center mt-4 pb-8 px-4 text-xs sm:text-sm md:text-base" style={{ color: textColor }}>
        
          <a href={developerCredit.href} className="hover:underline transition-colors" style={{ color: mainColor }}>
            {developerCredit.name}
          </a>
        </div>
      )}
    </footer>
  );
};

export default Footer;
