"use client";

import { useState } from "react";
import { useComponentEditor } from "@/context";
import useWebsiteStore from "@/stores/websiteStore";
import { ButtonConfig, ButtonActionType, ButtonAction } from "@/types/button";
import { BUTTON_REGISTRY } from "@/components/ui/buttons";
import { ChevronDown, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ButtonEditorPanel() {
  const { currentComponent } = useComponentEditor();
  const currentPageSlug = useWebsiteStore((s) => s.currentPageSlug);
  const updateComponentProps = useWebsiteStore((s) => s.updateComponentProps);
  const getPage = useWebsiteStore((s) => s.getPage);
  const currentPageData = getPage(currentPageSlug);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!currentComponent?.id) {
    return <div className="text-red-600 p-4">No component ID found</div>;
  }

  const componentId = currentComponent.id;

  // Find the button field
  const buttonField = currentComponent.editableFields?.find(
    (field: any) => field.type === "button"
  );

  if (!buttonField) {
    return <div>No button field found</div>;
  }

  // Get component data
  if (!currentPageData) {
    return <div>No page data</div>;
  }
  const component = currentPageData.components?.find((c: any) => c.id === componentId);
  if (!component) {
    return <div>Component not found</div>;
  }

  const buttonKey = buttonField.key;
  const buttonConfig = (component.props as any)?.[buttonKey] as ButtonConfig | undefined;

  // Helper to update button config - ensure action always exists
  const updateButton = (updates: Partial<ButtonConfig>) => {
    const currentAction = buttonConfig?.action || { type: "none" };
    const newConfig: ButtonConfig = {
      text: buttonConfig?.text || "",
      variant: buttonConfig?.variant || "button1",
      ...updates,
      // Ensure action is always set
      action: updates.action || currentAction,
    };
    updateComponentProps(currentPageSlug, componentId, { [buttonKey]: newConfig });
  };

  // Default values - ensure action always exists
  const text = buttonConfig?.text || "";
  const variant = buttonConfig?.variant || "button1";
  const action: ButtonAction = buttonConfig?.action || { type: "none" };
  const colors = buttonConfig?.colors;

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="font-semibold">{buttonField.label || "Button Configuration"}</h3>

      {/* Button Text */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Button Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => updateButton({ text: e.target.value })}
          placeholder="Enter button text"
          className="w-full p-2 border rounded text-sm"
        />
      </div>

      {/* Button Variant Selector */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Button Style</label>
        <select
          value={variant}
          onChange={(e) => updateButton({ variant: e.target.value as any })}
          className="w-full p-2 border rounded text-sm"
        >
          {Object.keys(BUTTON_REGISTRY).map((key) => (
            <option key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Action Type */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Action Type</label>
        <select
          value={action?.type || "none"}
          onChange={(e) => {
            const type = e.target.value as ButtonActionType;
            // Reset action based on type
            switch (type) {
              case "none":
                updateButton({ action: { type: "none" } });
                break;
              case "scroll":
                updateButton({ action: { type: "scroll", scrollTo: "" } });
                break;
              case "external":
                updateButton({ action: { type: "external", url: "", openInNewTab: true } });
                break;
              case "internal":
                updateButton({ action: { type: "internal", path: "" } });
                break;
              case "email":
                updateButton({ action: { type: "email", email: "" } });
                break;
              case "phone":
                updateButton({ action: { type: "phone", phone: "" } });
                break;
              case "download":
                updateButton({ action: { type: "download", fileUrl: "" } });
                break;
            }
          }}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="none">No Action (Visual Only)</option>
          <option value="scroll">Scroll to Section</option>
          <option value="internal">Internal Page Link</option>
          <option value="external">External URL</option>
          <option value="email">Email Link</option>
          <option value="phone">Phone Link</option>
          <option value="download">Download File</option>
        </select>
      </div>

      {/* Conditional Action Fields */}
      {action?.type === "scroll" && (
        <ScrollActionFields
          scrollTo={action.type === "scroll" ? action.scrollTo : ""}
          onChange={(val: string) => updateButton({ action: { type: "scroll", scrollTo: val } })}
          currentPageData={currentPageData}
        />
      )}

      {action?.type === "external" && (
        <ExternalActionFields
          url={action.type === "external" ? action.url : ""}
          openInNewTab={action.type === "external" ? action.openInNewTab : false}
          onUrlChange={(val: string) => updateButton({ action: { type: "external", url: val, openInNewTab: action.type === "external" ? action.openInNewTab : false } })}
          onNewTabChange={(val: boolean) => updateButton({ action: { type: "external", url: action.type === "external" ? action.url : "", openInNewTab: val } })}
        />
      )}

      {action?.type === "internal" && (
        <InternalActionFields
          path={action.type === "internal" ? action.path : ""}
          onChange={(val: string) => updateButton({ action: { type: "internal", path: val } })}
        />
      )}

      {action?.type === "email" && (
        <EmailActionFields
          email={action.type === "email" ? action.email : ""}
          subject={action.type === "email" ? action.subject : undefined}
          onEmailChange={(val: string) => updateButton({ action: { type: "email", email: val, subject: action.type === "email" ? action.subject : undefined } })}
          onSubjectChange={(val: string) => updateButton({ action: { type: "email", email: action.type === "email" ? action.email : "", subject: val || undefined } })}
        />
      )}

      {action?.type === "phone" && (
        <PhoneActionFields
          phone={action.type === "phone" ? action.phone : ""}
          onChange={(val: string) => updateButton({ action: { type: "phone", phone: val } })}
        />
      )}

      {action?.type === "download" && (
        <DownloadActionFields
          fileUrl={action.type === "download" ? action.fileUrl : ""}
          fileName={action.type === "download" ? action.fileName : undefined}
          onUrlChange={(val: string) => updateButton({ action: { type: "download", fileUrl: val, fileName: action.type === "download" ? action.fileName : undefined } })}
          onNameChange={(val: string) => updateButton({ action: { type: "download", fileUrl: action.type === "download" ? action.fileUrl : "", fileName: val || undefined } })}
        />
      )}

      {/* Advanced Color Options */}
      <div className="border-t pt-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>Advanced Colors (Optional)</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 space-y-3"
            >
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Background Color (Auto: Component Main Color)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={colors?.background || "#3B82F6"}
                    onChange={(e) =>
                      updateButton({ colors: { ...colors, background: e.target.value } })
                    }
                    className="h-10 w-20"
                  />
                  <input
                    type="text"
                    value={colors?.background || ""}
                    onChange={(e) =>
                      updateButton({ colors: { ...colors, background: e.target.value } })
                    }
                    placeholder="Auto"
                    className="flex-1 p-2 border rounded text-sm"
                  />
                  {colors?.background && (
                    <button
                      onClick={() => updateButton({ colors: { ...colors, background: undefined } })}
                      className="text-red-600 hover:text-red-800"
                      title="Reset to auto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Text Color (Auto: Contrasts with Background)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={colors?.text || "#FFFFFF"}
                    onChange={(e) =>
                      updateButton({ colors: { ...colors, text: e.target.value } })
                    }
                    className="h-10 w-20"
                  />
                  <input
                    type="text"
                    value={colors?.text || ""}
                    onChange={(e) =>
                      updateButton({ colors: { ...colors, text: e.target.value } })
                    }
                    placeholder="Auto"
                    className="flex-1 p-2 border rounded text-sm"
                  />
                  {colors?.text && (
                    <button
                      onClick={() => updateButton({ colors: { ...colors, text: undefined } })}
                      className="text-red-600 hover:text-red-800"
                      title="Reset to auto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {(colors?.background || colors?.text) && (
                <button
                  onClick={() => updateButton({ colors: undefined })}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reset all colors to auto
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// Action Field Components
// ============================================

function ScrollActionFields({ scrollTo, onChange, currentPageData }: any) {
  const components = currentPageData?.components || [];

  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">Scroll To Section</label>
      <select
        value={scrollTo}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded text-sm"
      >
        <option value="">Select section...</option>
        {components.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.componentName} ({c.id.slice(0, 8)}...)
          </option>
        ))}
      </select>
    </div>
  );
}

function ExternalActionFields({ url, openInNewTab, onUrlChange, onNewTabChange }: any) {
  return (
    <>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">External URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com"
          className="w-full p-2 border rounded text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={openInNewTab}
          onChange={(e) => onNewTabChange(e.target.checked)}
          id="openInNewTab"
        />
        <label htmlFor="openInNewTab" className="text-sm text-gray-700">
          Open in new tab
        </label>
      </div>
    </>
  );
}

function InternalActionFields({ path, onChange }: any) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">Internal Path</label>
      <input
        type="text"
        value={path}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/about"
        className="w-full p-2 border rounded text-sm"
      />
    </div>
  );
}

function EmailActionFields({ email, subject, onEmailChange, onSubjectChange }: any) {
  return (
    <>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="contact@example.com"
          className="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">
          Subject (Optional)
        </label>
        <input
          type="text"
          value={subject || ""}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Email subject"
          className="w-full p-2 border rounded text-sm"
        />
      </div>
    </>
  );
}

function PhoneActionFields({ phone, onChange }: any) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">Phone Number</label>
      <input
        type="tel"
        value={phone}
        onChange={(e) => onChange(e.target.value)}
        placeholder="+1 (555) 123-4567"
        className="w-full p-2 border rounded text-sm"
      />
    </div>
  );
}

function DownloadActionFields({ fileUrl, fileName, onUrlChange, onNameChange }: any) {
  return (
    <>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">File URL</label>
        <input
          type="url"
          value={fileUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="/files/document.pdf"
          className="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">
          File Name (Optional)
        </label>
        <input
          type="text"
          value={fileName || ""}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="document.pdf"
          className="w-full p-2 border rounded text-sm"
        />
      </div>
    </>
  );
}
