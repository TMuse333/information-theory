"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Edit2,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Settings
} from "lucide-react";
import useWebsiteStore from "@/stores/websiteStore";
import { Footer1Props, StandardTab, FooterContact } from "@/types/navbar";

// ════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════

type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'custom';

interface SocialLinkItem {
  name: string;
  href: string;
  platform: SocialPlatform;
  icon?: React.ElementType;
}

// ════════════════════════════════════════════════════════════════
// Helper Functions
// ════════════════════════════════════════════════════════════════

const getPlatformIcon = (platform: SocialPlatform): React.ElementType => {
  switch (platform) {
    case 'instagram': return Instagram;
    case 'facebook': return Facebook;
    case 'twitter': return Twitter;
    case 'linkedin': return Linkedin;
    case 'youtube': return Youtube;
    default: return LinkIcon;
  }
};

const getPlatformName = (platform: SocialPlatform): string => {
  switch (platform) {
    case 'instagram': return 'Instagram';
    case 'facebook': return 'Facebook';
    case 'twitter': return 'Twitter';
    case 'linkedin': return 'LinkedIn';
    case 'youtube': return 'YouTube';
    case 'tiktok': return 'TikTok';
    default: return 'Custom';
  }
};

// ════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════

export default function NavigationPanel() {
  const websiteData = useWebsiteStore((s) => s.websiteData);
  const setWebsiteData = useWebsiteStore((s) => s.setWebsiteData);

  // Section visibility
  const [showNavbarConfig, setShowNavbarConfig] = useState(false);
  const [showFooterSettings, setShowFooterSettings] = useState(true);

  // Footer editing state
  const [editingNavIndex, setEditingNavIndex] = useState<number | null>(null);
  const [editingSocialIndex, setEditingSocialIndex] = useState<number | null>(null);
  const [editingContact, setEditingContact] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState(false);

  const [editedNavItem, setEditedNavItem] = useState<StandardTab | null>(null);
  const [editedSocialItem, setEditedSocialItem] = useState<SocialLinkItem | null>(null);
  const [editedContact, setEditedContact] = useState<FooterContact | null>(null);
  const [editedDeveloper, setEditedDeveloper] = useState<StandardTab | null>(null);

  // ────── Get current footer data from first footer component ──────
  const footerData = useMemo(() => {
    if (!websiteData?.pages) return null;

    // Pages is an object keyed by slug
    for (const page of Object.values(websiteData.pages)) {
      const footer = page.components?.find((c: any) => c.componentCategory === 'footer');
      if (footer?.props) {
        return footer.props as unknown as Footer1Props;
      }
    }
    return null;
  }, [websiteData?.pages]);

  const navItems = useMemo(() => footerData?.navItems ?? [], [footerData?.navItems]);

  const socialLinks = useMemo(() => {
    return (footerData?.socialLinks ?? []).map(link => {
      const linkAny = link as any;
      let platform: SocialPlatform = 'custom';

      if (linkAny.platform) {
        platform = linkAny.platform as SocialPlatform;
      } else {
        const nameLower = link.name.toLowerCase();
        if (nameLower.includes('instagram')) platform = 'instagram';
        else if (nameLower.includes('facebook')) platform = 'facebook';
        else if (nameLower.includes('twitter')) platform = 'twitter';
        else if (nameLower.includes('linkedin')) platform = 'linkedin';
        else if (nameLower.includes('youtube')) platform = 'youtube';
        else if (nameLower.includes('tiktok')) platform = 'tiktok';
      }

      return {
        name: link.name,
        href: link.href,
        platform,
        icon: getPlatformIcon(platform),
      };
    });
  }, [footerData?.socialLinks]);

  // ────── useEffects for editing state ──────
  useEffect(() => {
    if (editingNavIndex === null) {
      setEditedNavItem(null);
    } else if (navItems[editingNavIndex]) {
      setEditedNavItem({ ...navItems[editingNavIndex] });
    }
  }, [editingNavIndex, navItems]);

  useEffect(() => {
    if (editingSocialIndex === null) {
      setEditedSocialItem(null);
    } else if (socialLinks[editingSocialIndex]) {
      setEditedSocialItem({ ...socialLinks[editingSocialIndex] });
    } else {
      setEditedSocialItem({ name: '', href: '', platform: 'instagram' });
    }
  }, [editingSocialIndex, socialLinks]);

  useEffect(() => {
    if (!editingContact) {
      setEditedContact(null);
    } else if (footerData?.contact) {
      setEditedContact({ ...footerData.contact });
    } else {
      setEditedContact({});
    }
  }, [editingContact, footerData?.contact]);

  useEffect(() => {
    if (!editingDeveloper) {
      setEditedDeveloper(null);
    } else if (footerData?.developerCredit) {
      setEditedDeveloper({ ...footerData.developerCredit });
    } else {
      setEditedDeveloper({ name: '', href: '' });
    }
  }, [editingDeveloper, footerData?.developerCredit]);

  // ────── Update all footers across all pages ──────
  const updateAllFooters = (updates: Partial<Footer1Props>) => {
    if (!websiteData) return;

    // Pages is an object keyed by slug
    const updatedPages = Object.fromEntries(
      Object.entries(websiteData.pages).map(([slug, page]) => [
        slug,
        {
          ...page,
          components: page.components?.map((component: any) => {
            if (component.componentCategory === 'footer') {
              return {
                ...component,
                props: {
                  ...component.props,
                  ...updates,
                },
              };
            }
            return component;
          }),
        },
      ])
    );

    setWebsiteData({
      ...websiteData,
      pages: updatedPages,
    });
  };

  // ────── Handlers ──────

  // Nav Items handlers
  const handleAddNavItem = () => {
    const newItem: StandardTab = { name: "New Link", href: "/" };
    updateAllFooters({ navItems: [...navItems, newItem] });
  };

  const handleRemoveNavItem = (idx: number) => {
    updateAllFooters({ navItems: navItems.filter((_, i) => i !== idx) });
  };

  const handleSaveNavItem = () => {
    if (editingNavIndex === null || !editedNavItem) return;
    const newNavItems = [...navItems];
    newNavItems[editingNavIndex] = editedNavItem;
    updateAllFooters({ navItems: newNavItems });
    setEditingNavIndex(null);
  };

  // Social Links handlers
  const handleAddSocialLink = () => {
    setEditingSocialIndex(socialLinks.length);
  };

  const handleRemoveSocialLink = (idx: number) => {
    const newLinks = socialLinks.filter((_, i) => i !== idx);
    const converted = newLinks.map(link => ({
      name: link.name || getPlatformName(link.platform),
      href: link.href,
      platform: link.platform,
    }));
    updateAllFooters({ socialLinks: converted as any });
  };

  const handleSaveSocialLink = () => {
    if (editingSocialIndex === null || !editedSocialItem) return;

    // Ensure the item has an icon based on platform
    const itemWithIcon = {
      ...editedSocialItem,
      icon: getPlatformIcon(editedSocialItem.platform),
    };

    const newSocialLinks = [...socialLinks];
    if (editingSocialIndex < socialLinks.length) {
      newSocialLinks[editingSocialIndex] = itemWithIcon;
    } else {
      newSocialLinks.push(itemWithIcon);
    }

    const converted = newSocialLinks.map(link => ({
      name: link.name || getPlatformName(link.platform),
      href: link.href,
      platform: link.platform,
    }));
    updateAllFooters({ socialLinks: converted as any });
    setEditingSocialIndex(null);
  };

  // Contact handler
  const handleSaveContact = () => {
    if (!editedContact) return;
    updateAllFooters({ contact: editedContact });
    setEditingContact(false);
  };

  // Developer Credit handler
  const handleSaveDeveloper = () => {
    if (!editedDeveloper) return;
    updateAllFooters({ developerCredit: editedDeveloper });
    setEditingDeveloper(false);
  };

  // ────── Early return ──────
  if (!websiteData) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-gray-400">No website loaded</p>
      </div>
    );
  }

  // ────── Render ──────
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Navigation & Footer</h2>
        <p className="text-sm text-gray-600">
          Manage your site&apos;s navigation, contact info, and social links
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* Footer Settings (Editable) */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowFooterSettings(!showFooterSettings)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {showFooterSettings ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <h3 className="text-lg font-semibold text-gray-900">Footer Settings</h3>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                Site-wide
              </span>
            </div>
            <Settings className="w-5 h-5 text-gray-400" />
          </button>

          {showFooterSettings && (
            <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">

              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Information
                  </h4>
                  <button
                    onClick={() => setEditingContact(!editingContact)}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    {editingContact ? 'Cancel' : <><Edit2 className="w-3 h-3 inline mr-1" />Edit</>}
                  </button>
                </div>

                {editingContact ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Address</label>
                      <input
                        type="text"
                        value={editedContact?.address || ''}
                        onChange={(e) => setEditedContact(prev => prev ? { ...prev, address: e.target.value } : { address: e.target.value })}
                        placeholder="123 Main St, City, State"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Phone</label>
                      <input
                        type="text"
                        value={editedContact?.phone || ''}
                        onChange={(e) => setEditedContact(prev => prev ? { ...prev, phone: e.target.value } : { phone: e.target.value })}
                        placeholder="(123) 456-7890"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Email</label>
                      <input
                        type="email"
                        value={editedContact?.email || ''}
                        onChange={(e) => setEditedContact(prev => prev ? { ...prev, email: e.target.value } : { email: e.target.value })}
                        placeholder="contact@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <button
                      onClick={handleSaveContact}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Save Contact Info
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {footerData?.contact?.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-700">{footerData.contact.address}</span>
                      </div>
                    )}
                    {footerData?.contact?.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-700">{footerData.contact.phone}</span>
                      </div>
                    )}
                    {footerData?.contact?.email && (
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-700">{footerData.contact.email}</span>
                      </div>
                    )}
                    {!footerData?.contact?.address && !footerData?.contact?.phone && !footerData?.contact?.email && (
                      <p className="text-gray-500 text-sm">No contact information set</p>
                    )}
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Social Media Links
                  </h4>
                  <button
                    onClick={handleAddSocialLink}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {/* New social link form */}
                  {editingSocialIndex !== null && editingSocialIndex >= socialLinks.length && (
                    <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50">
                      <div className="p-3 space-y-2">
                        <select
                          value={editedSocialItem?.platform || 'instagram'}
                          onChange={(e) => setEditedSocialItem(prev => prev ? { ...prev, platform: e.target.value as SocialPlatform } : { name: '', href: '', platform: e.target.value as SocialPlatform })}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                          <option value="twitter">Twitter</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="youtube">YouTube</option>
                          <option value="tiktok">TikTok</option>
                          <option value="custom">Custom</option>
                        </select>
                        <input
                          type="text"
                          value={editedSocialItem?.name || ''}
                          onChange={(e) => setEditedSocialItem(prev => prev ? { ...prev, name: e.target.value } : { name: e.target.value, href: '', platform: 'instagram' })}
                          placeholder="Display Name (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="url"
                          value={editedSocialItem?.href || ''}
                          onChange={(e) => setEditedSocialItem(prev => prev ? { ...prev, href: e.target.value } : { name: '', href: e.target.value, platform: 'instagram' })}
                          placeholder="https://instagram.com/yourprofile"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveSocialLink}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSocialIndex(null)}
                            className="flex-1 px-3 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing social links */}
                  {socialLinks.length === 0 && editingSocialIndex === null ? (
                    <p className="text-sm text-gray-500 text-center py-4">No social media links</p>
                  ) : (
                    socialLinks.map((item, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                        {editingSocialIndex === idx ? (
                          <div className="p-3 space-y-2 bg-gray-50">
                            <select
                              value={editedSocialItem?.platform || 'instagram'}
                              onChange={(e) => setEditedSocialItem(prev => prev ? { ...prev, platform: e.target.value as SocialPlatform } : null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            >
                              <option value="instagram">Instagram</option>
                              <option value="facebook">Facebook</option>
                              <option value="twitter">Twitter</option>
                              <option value="linkedin">LinkedIn</option>
                              <option value="youtube">YouTube</option>
                              <option value="tiktok">TikTok</option>
                              <option value="custom">Custom</option>
                            </select>
                            <input
                              type="text"
                              value={editedSocialItem?.name || ''}
                              onChange={(e) => setEditedSocialItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                              placeholder="Display Name (optional)"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="url"
                              value={editedSocialItem?.href || ''}
                              onChange={(e) => setEditedSocialItem(prev => prev ? { ...prev, href: e.target.value } : null)}
                              placeholder="https://instagram.com/yourprofile"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveSocialLink}
                                className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingSocialIndex(null)}
                                className="flex-1 px-3 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-100">
                                {item.icon && <item.icon className="w-4 h-4 text-gray-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-800">{item.name || getPlatformName(item.platform)}</p>
                                <p className="text-xs text-gray-500 truncate">{item.href}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingSocialIndex(idx)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Edit2 className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleRemoveSocialLink(idx)}
                                className="p-1 hover:bg-red-100 rounded"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer Navigation Links */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Footer Navigation Links
                  </h4>
                  <button
                    onClick={handleAddNavItem}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {navItems.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No navigation links</p>
                  ) : (
                    navItems.map((item, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                        {editingNavIndex === idx ? (
                          <div className="p-3 space-y-2 bg-gray-50">
                            <input
                              type="text"
                              value={editedNavItem?.name || ''}
                              onChange={(e) => setEditedNavItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                              placeholder="Link Name"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              value={editedNavItem?.href || ''}
                              onChange={(e) => setEditedNavItem(prev => prev ? { ...prev, href: e.target.value } : null)}
                              placeholder="/path or #section"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveNavItem}
                                className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingNavIndex(null)}
                                className="flex-1 px-3 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-800">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.href}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingNavIndex(idx)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Edit2 className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleRemoveNavItem(idx)}
                                className="p-1 hover:bg-red-100 rounded"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Developer Credit */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800">Developer Credit</h4>
                  <button
                    onClick={() => setEditingDeveloper(!editingDeveloper)}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    {editingDeveloper ? 'Cancel' : <><Edit2 className="w-3 h-3 inline mr-1" />Edit</>}
                  </button>
                </div>

                {editingDeveloper ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editedDeveloper?.name || ''}
                      onChange={(e) => setEditedDeveloper(prev => prev ? { ...prev, name: e.target.value } : { name: e.target.value, href: '' })}
                      placeholder="Developer Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="url"
                      value={editedDeveloper?.href || ''}
                      onChange={(e) => setEditedDeveloper(prev => prev ? { ...prev, href: e.target.value } : { name: '', href: e.target.value })}
                      placeholder="https://developerwebsite.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={handleSaveDeveloper}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Save Developer Credit
                    </button>
                  </div>
                ) : (
                  <div className="text-sm">
                    {footerData?.developerCredit?.name ? (
                      <div>
                        <p className="text-gray-800">{footerData.developerCredit.name}</p>
                        <p className="text-xs text-gray-500">{footerData.developerCredit.href}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No developer credit set</p>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* Navbar Configuration (Read-only overview) */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowNavbarConfig(!showNavbarConfig)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {showNavbarConfig ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <h3 className="text-lg font-semibold text-gray-900">Navbar Overview</h3>
              {websiteData.navbarConfig && !websiteData.navbarConfig.isAutoGenerated && (
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                  Manual
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {websiteData.navbarConfig?.items.length || 0} items
            </span>
          </button>

          {showNavbarConfig && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 mb-3">
                Navbar items are auto-generated from pages. Click a navbar component to edit colors.
              </p>
              {websiteData.navbarConfig ? (
                <div className="space-y-2">
                  {websiteData.navbarConfig.items.map((item: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{item.label}</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {item.type}
                        </span>
                      </div>
                      {item.type === 'scroll' && item.targetId && (
                        <p className="text-xs text-gray-500 mt-1">Scrolls to: #{item.targetId}</p>
                      )}
                      {item.type === 'link' && item.href && (
                        <p className="text-xs text-gray-500 mt-1">Links to: {item.href}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No navbar configuration found</p>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">How It Works</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Footer settings</strong> apply to all pages automatically</li>
            <li>• <strong>Regenerate</strong> rebuilds navbar from your page structure</li>
            <li>• <strong>Colors</strong> can be edited by clicking the navbar/footer components</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
