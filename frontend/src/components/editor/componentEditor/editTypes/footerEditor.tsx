import { Navigation } from "lucide-react";

/**
 * FooterEditorPanel - Redirects to Navigation tab
 *
 * Footer settings (contact info, social links, navigation links, developer credit)
 * have been consolidated into the Navigation tab for better UX.
 *
 * Colors can still be edited via the ColorEditor when clicking on a footer component.
 */
export default function FooterEditorPanel() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="text-gray-500 max-w-sm">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Navigation className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Footer Settings Moved
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Contact info, social links, and navigation are now in the{" "}
          <strong className="text-purple-600">Navigation</strong> tab for easier access.
        </p>
        <p className="text-xs text-gray-500">
          Use the sidebar to switch to Navigation, or edit colors by clicking on the footer component.
        </p>
      </div>
    </div>
  );
}
