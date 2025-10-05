/**
 * Universal window dimensions for WebOS applications
 * Provides consistent sizing across all application types
 */

export interface WindowDimensions {
  width: number;
  height: number;
  autoHeight: boolean;
  minHeight: number;
  maxHeight: number;
}

export const UNIVERSAL_WINDOW_DIMENSIONS: WindowDimensions = {
  width: 600,
  height: 500,
  autoHeight: true,
  minHeight: 400,
  maxHeight: 800,
};

// Special dimensions for specific use cases
export const SPECIAL_DIMENSIONS: Record<string, WindowDimensions> = {
  // Browser needs more width for better web experience
  browser: {
    width: 800,
    height: 600,
    autoHeight: true,
    minHeight: 500,
    maxHeight: 900,
  },

  // Calculator is typically smaller and fixed size
  calculator: {
    width: 320,
    height: 480,
    autoHeight: false,
    minHeight: 400,
    maxHeight: 600,
  },
};

/**
 * Get window dimensions for a specific application type
 * Falls back to universal dimensions if no special dimensions are defined
 */
export const getWindowDimensions = (appType: string): WindowDimensions => {
  return SPECIAL_DIMENSIONS[appType.toLowerCase()] || UNIVERSAL_WINDOW_DIMENSIONS;
};