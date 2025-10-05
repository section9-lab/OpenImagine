// WebOS应用样式规范
// 统一所有内置应用和动态应用的样式

export const APP_STYLES = {
  // 按钮样式规范
  buttons: {
    primary: "bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300 font-semibold transition-colors",
    danger: "bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors",
    success: "bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors",

    // 计算器专用按钮样式
    calculator: {
      number: "bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 font-semibold transition-colors",
      operator: "bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold transition-colors",
      clear: "bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors",
      equals: "bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors",
    }
  },

  // 输入框样式规范
  inputs: {
    default: "border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",
    error: "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all",
  },

  // 卡片样式规范
  cards: {
    default: "bg-white border border-gray-200 rounded-lg shadow-sm",
    highlighted: "bg-blue-50 border border-blue-200 rounded-lg shadow-sm",
    success: "bg-green-50 border border-green-200 rounded-lg shadow-sm",
    warning: "bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm",
    error: "bg-red-50 border border-red-200 rounded-lg shadow-sm",
  },

  // 文本样式规范
  text: {
    title: "text-xl font-bold text-gray-900",
    subtitle: "text-lg font-semibold text-gray-700",
    body: "text-sm text-gray-600",
    caption: "text-xs text-gray-500",
    error: "text-sm text-red-600",
    success: "text-sm text-green-600",
  },

  // 布局样式规范
  layout: {
    container: "max-w-2xl mx-auto p-6",
    section: "space-y-4",
    grid: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
    flex: "flex items-center space-x-4",
    flexBetween: "flex items-center justify-between",
  }
};

// 应用特定样式主题
export const APP_THEMES = {
  calculator: {
    background: "bg-white",
    display: "bg-gray-900 text-white p-4 rounded text-right text-2xl font-mono",
    keypad: "grid grid-cols-4 gap-2",
  },
  form: {
    background: "bg-white",
    inputGroup: "space-y-2",
    label: "block text-sm font-medium text-gray-700 mb-2",
    buttonGroup: "flex space-x-4 mt-6",
  },
  browser: {
    background: "bg-white",
    addressBar: "border-b p-2 bg-gray-50",
    content: "p-8 text-center",
  },
  fileExplorer: {
    background: "bg-white",
    listItem: "flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors",
  }
};

// 动态应用的默认样式配置
export const DYNAMIC_APP_DEFAULTS = {
  container: {
    className: "bg-white overflow-y-auto",
  },
  title: {
    className: "text-2xl font-bold text-gray-900 text-center mb-6",
  },
  description: {
    className: "text-gray-600 text-center mb-6",
  },
  form: {
    className: "space-y-4",
  },
  buttons: {
    calculate: APP_STYLES.buttons.primary,
    reset: APP_STYLES.buttons.secondary,
    buttonGroup: "flex space-x-4 mt-6",
  },
  results: {
    container: "mt-6 space-y-3",
    item: "p-4 bg-blue-50 rounded-lg border border-blue-200",
    label: "text-sm text-gray-600",
    value: "text-lg font-semibold text-gray-900",
  }
};

// 样式辅助函数
export const getAppButtonStyle = (type: keyof typeof APP_STYLES.buttons = 'primary', custom?: string) => {
  const baseStyle = APP_STYLES.buttons[type];
  return custom ? `${baseStyle} ${custom}` : baseStyle;
};

export const getAppCardStyle = (type: keyof typeof APP_STYLES.cards = 'default', custom?: string) => {
  const baseStyle = APP_STYLES.cards[type];
  return custom ? `${baseStyle} ${custom}` : baseStyle;
};