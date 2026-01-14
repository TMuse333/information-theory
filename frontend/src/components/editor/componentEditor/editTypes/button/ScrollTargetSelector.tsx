"use client";

import useWebsiteStore from "@/stores/websiteStore";

interface ScrollTargetSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ScrollTargetSelector({ value, onChange }: ScrollTargetSelectorProps) {
  const currentPageSlug = useWebsiteStore((s) => s.currentPageSlug);
  const getPage = useWebsiteStore((s) => s.getPage);
  const currentPageData = getPage(currentPageSlug);

  // Get all component IDs from current page
  const scrollTargets = currentPageData?.components?.map((c: any) => ({
    id: c.id,
    label: `${c.componentName || c.type || "Component"} (${c.id.slice(0, 8)})`,
  })) || [];

  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">Scroll Target</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded text-sm text-black"
      >
        <option value="">Select section...</option>
        {scrollTargets.map((target) => (
          <option key={target.id} value={target.id}>
            {target.label}
          </option>
        ))}
      </select>
      {scrollTargets.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">No components found on this page</p>
      )}
    </div>
  );
}

