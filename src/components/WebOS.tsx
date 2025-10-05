"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Minimize2, Maximize2, X, Folder, Calculator, Monitor, Settings, Sparkles, Activity } from "lucide-react";
import { APP_STYLES, APP_THEMES } from "@/lib/app-styles";
import { DynamicApp } from "@/components/dynamic/AppGenerator";
import { llmService } from "@/lib/llm-service";
import { getWindowDimensions, UNIVERSAL_WINDOW_DIMENSIONS } from "@/lib/window-dimensions";

interface WindowState {
  id: string;
  title: string;
  component: React.ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  autoHeight?: boolean;
  minHeight?: number;
  maxHeight?: number;
  isDynamic?: boolean;
}

interface ConversationMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  isThinking?: boolean;
  thinking?: string[];
}

interface DynamicApp {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
  icon: React.ComponentType<any>;
}

// Sample applications
const FileExplorer = () => (
  <div className="p-4 bg-white min-h-full">
    <h2 className={`${APP_STYLES.text.title} mb-4`}>File Explorer</h2>
    <div className="space-y-2">
      <div className={APP_THEMES.fileExplorer.listItem}>
        <Folder className="w-4 h-4" />
        <span>Documents</span>
      </div>
      <div className={APP_THEMES.fileExplorer.listItem}>
        <Folder className="w-4 h-4" />
        <span>Downloads</span>
      </div>
      <div className={APP_THEMES.fileExplorer.listItem}>
        <Folder className="w-4 h-4" />
        <span>Pictures</span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          <p>• 3 folders</p>
          <p>• Right-click to open files</p>
        </div>
      </div>
    </div>
  </div>
);

const CalculatorApp = () => {
  const [display, setDisplay] = useState("0");

  const handleNumber = (num: string) => {
    setDisplay(display === "0" ? num : display + num);
  };

  const handleClear = () => setDisplay("0");

  const handleCalculate = () => {
    try {
      const result = eval(display);
      setDisplay(result.toString());
    } catch {
      setDisplay("Error");
    }
  };

  return (
    <div className={`p-6 ${APP_THEMES.calculator.background} min-h-full flex flex-col`}>
      <div className={`${APP_THEMES.calculator.display} mb-4`}>
        {display}
      </div>
      <div className={`${APP_THEMES.calculator.keypad} flex-1`}>
        <Button
          onClick={handleClear}
          className={APP_STYLES.buttons.calculator.clear}
        >
          C
        </Button>
        <Button
          onClick={() => handleNumber("/")}
          className={APP_STYLES.buttons.calculator.operator}
        >
          ÷
        </Button>
        <Button
          onClick={() => handleNumber("*")}
          className={APP_STYLES.buttons.calculator.operator}
        >
          ×
        </Button>
        <Button
          onClick={() => setDisplay(display.slice(0, -1))}
          className={APP_STYLES.buttons.calculator.operator}
        >
          ⌫
        </Button>

        <Button
          onClick={() => handleNumber("7")}
          className={APP_STYLES.buttons.calculator.number}
        >
          7
        </Button>
        <Button
          onClick={() => handleNumber("8")}
          className={APP_STYLES.buttons.calculator.number}
        >
          8
        </Button>
        <Button
          onClick={() => handleNumber("9")}
          className={APP_STYLES.buttons.calculator.number}
        >
          9
        </Button>
        <Button
          onClick={() => handleNumber("-")}
          className={APP_STYLES.buttons.calculator.operator}
        >
          -
        </Button>

        <Button
          onClick={() => handleNumber("4")}
          className={APP_STYLES.buttons.calculator.number}
        >
          4
        </Button>
        <Button
          onClick={() => handleNumber("5")}
          className={APP_STYLES.buttons.calculator.number}
        >
          5
        </Button>
        <Button
          onClick={() => handleNumber("6")}
          className={APP_STYLES.buttons.calculator.number}
        >
          6
        </Button>
        <Button
          onClick={() => handleNumber("+")}
          className={APP_STYLES.buttons.calculator.operator}
        >
          +
        </Button>

        <Button
          onClick={() => handleNumber("1")}
          className={APP_STYLES.buttons.calculator.number}
        >
          1
        </Button>
        <Button
          onClick={() => handleNumber("2")}
          className={APP_STYLES.buttons.calculator.number}
        >
          2
        </Button>
        <Button
          onClick={() => handleNumber("3")}
          className={APP_STYLES.buttons.calculator.number}
        >
          3
        </Button>
        <Button
          className={`row-span-2 ${APP_STYLES.buttons.calculator.equals}`}
          onClick={handleCalculate}
        >
          =
        </Button>

        <Button
          className={`col-span-2 ${APP_STYLES.buttons.calculator.number}`}
          onClick={() => handleNumber("0")}
        >
          0
        </Button>
        <Button
          onClick={() => handleNumber(".")}
          className={APP_STYLES.buttons.calculator.number}
        >
          .
        </Button>
      </div>
    </div>
  );
};

const BrowserApp = () => {
  const [url, setUrl] = useState('https://example.com');
  const [inputUrl, setInputUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>(['https://example.com']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const navigateToUrl = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError('');

    try {
      let normalizedUrl = targetUrl.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      setUrl(normalizedUrl);
      setInputUrl(normalizedUrl);

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(normalizedUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

    } catch (err) {
      setError('无法访问该网站');
      console.error('Navigation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevUrl = history[newIndex];
      setUrl(prevUrl);
      setInputUrl(prevUrl);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextUrl = history[newIndex];
      setUrl(nextUrl);
      setInputUrl(nextUrl);
    }
  };

  const refresh = () => {
    navigateToUrl(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      navigateToUrl(inputUrl);
    }
  };

  return (
    <div className="bg-white min-h-full flex flex-col">
      {/* 浏览器工具栏 */}
      <div className="flex items-center space-x-2 p-2 border-b border-gray-200 bg-gray-50">
        {/* 导航按钮 */}
        <button
          onClick={goBack}
          disabled={historyIndex === 0}
          className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goForward}
          disabled={historyIndex === history.length - 1}
          className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={refresh}
          disabled={loading}
          className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* 地址栏 */}
        <div className="flex-1 flex items-center bg-white border border-gray-300 rounded px-3 py-1">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 outline-none text-sm"
            placeholder="输入网址..."
            disabled={loading}
          />
          {loading && (
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full ml-2"></div>
          )}
        </div>

        <button
          onClick={() => navigateToUrl(inputUrl)}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
        >
          访问
        </button>
      </div>

      {/* 浏览器内容区域 */}
      <div className="flex-1 bg-white">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🌐</div>
              <h2 className="text-xl font-semibold mb-2">无法访问网站</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => navigateToUrl(inputUrl)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                重试
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <iframe
              src={url}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              onLoad={() => setLoading(false)}
              onError={() => {
                setError('无法加载该网站');
                setLoading(false);
              }}
            />
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <div className="border-t border-gray-200 px-2 py-1 text-xs text-gray-500 flex items-center justify-between">
        <span>{loading ? '正在加载...' : url}</span>
        <span>WebOS Browser</span>
      </div>
    </div>
  );
};

export default function WebOS() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [dynamicApps, setDynamicApps] = useState<DynamicApp[]>([]);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([
    {
      id: "1",
      content: "欢迎来到 OpenImagine！我由GLM-4.6大模型驱动，可以帮您创建各种应用程序和管理桌面。试试对我说：'我需要一个BMI计算器' 或者 '创建一个房贷计算器'！",
      timestamp: new Date(),
      isUser: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [nextZIndex, setNextZIndex] = useState(1000);
  const [isProcessing, setIsProcessing] = useState(false);
  const dragRef = useRef<{
    isDragging: boolean;
    windowId: string;
    startX: number;
    startY: number;
    startWindowX: number;
    startWindowY: number;
    startWidth: number;
    startHeight: number;
    resizeDirection: string;
  }>({
    isDragging: false,
    windowId: "",
    startX: 0,
    startY: 0,
    startWindowX: 0,
    startWindowY: 0,
    startWidth: 0,
    startHeight: 0,
    resizeDirection: ''
  });

  const appTemplates = {
    calculator: { title: "Calculator", component: CalculatorApp, icon: Calculator },
    fileexplorer: { title: "File Explorer", component: FileExplorer, icon: Folder },
    browser: { title: "Browser", component: BrowserApp, icon: Monitor },
  };

  const createDynamicApp = (title: string, description: string, component: React.ComponentType, icon: React.ComponentType<any>) => {
    const newApp: DynamicApp = {
      id: Date.now().toString(),
      title,
      description,
      component,
      icon,
    };
    setDynamicApps(prev => [...prev, newApp]);
    return newApp.id;
  };

  const openWindow = (appType: keyof typeof appTemplates, dynamicAppComponent?: React.ComponentType, dynamicTitle?: string) => {
    let template;
    let component;
    let title;

    if (dynamicAppComponent && dynamicTitle) {
      // Dynamic app
      component = dynamicAppComponent;
      title = dynamicTitle;
    } else {
      // Built-in app
      template = appTemplates[appType];
      component = template.component;
      title = template.title;
    }

    // 使用通用的窗口尺寸系统
    const dimensions = dynamicAppComponent
      ? UNIVERSAL_WINDOW_DIMENSIONS
      : getWindowDimensions(appType);

    const newWindow: WindowState = {
      id: Date.now().toString(),
      title,
      component,
      x: Math.random() * (window.innerWidth - dimensions.width) + 50,
      y: Math.random() * (window.innerHeight - dimensions.height) + 50,
      width: dimensions.width,
      height: dimensions.height,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex + 1000,
      autoHeight: dimensions.autoHeight,
      minHeight: dimensions.minHeight,
      maxHeight: dimensions.maxHeight,
      isDynamic: !!dynamicAppComponent,
    };
    setWindows([...windows, newWindow]);
    setNextZIndex(nextZIndex + 1);
  };

  const openDynamicWindow = (appId: string) => {
    const app = dynamicApps.find(a => a.id === appId);
    if (app) {
      openWindow('calculator' as any, app.component, app.title);
    }
  };

  const deleteDynamicApp = (appId: string) => {
    // 从动态应用列表中移除
    setDynamicApps(prev => prev.filter(app => app.id !== appId));

    // 关闭相关的窗口
    setWindows(prev => prev.filter(() => {
      // 这里需要更复杂的逻辑来判断窗口是否属于被删除的应用
      // 暂时保留所有窗口，因为目前无法准确关联
      return true;
    }));
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ));
  };

  const maximizeWindow = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { 
        ...w, 
        isMaximized: !w.isMaximized,
        x: w.isMaximized ? w.x : 0,
        y: w.isMaximized ? w.y : 0,
        width: w.isMaximized ? w.width : window.innerWidth,
        height: w.isMaximized ? w.height : window.innerHeight - 80,
      } : w
    ));
  };

  const focusWindow = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
    ));
    setNextZIndex(nextZIndex + 1);
  };

  const handleMouseDown = (e: React.MouseEvent, windowId: string, resizeDirection: string = '') => {
    const window = windows.find(w => w.id === windowId);
    if (!window) return;

    dragRef.current = {
      isDragging: true,
      windowId,
      startX: e.clientX,
      startY: e.clientY,
      startWindowX: window.x,
      startWindowY: window.y,
      startWidth: window.width,
      startHeight: window.height,
      resizeDirection
    };
    focusWindow(windowId);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!dragRef.current.isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    const { resizeDirection, startWidth, startHeight, startWindowX, startWindowY } = dragRef.current;

    setWindows(prevWindows => prevWindows.map(w =>
      w.id === dragRef.current.windowId ? {
        ...w,
        // 如果是调整大小
        ...(resizeDirection ? {
          width: Math.max(300, startWidth + (resizeDirection.includes('e') ? deltaX : resizeDirection.includes('w') ? -deltaX : 0)),
          height: Math.max(200, startHeight + (resizeDirection.includes('s') ? deltaY : resizeDirection.includes('n') ? -deltaY : 0)),
          x: resizeDirection.includes('w') ? Math.min(startWindowX + deltaX, startWindowX + startWidth - 300) :
             resizeDirection.includes('e') ? startWindowX :
             startWindowX,
          y: resizeDirection.includes('n') ? Math.min(startWindowY + deltaY, startWindowY + startHeight - 200) :
             resizeDirection.includes('s') ? startWindowY :
             startWindowY,
        } : {
          // 如果是拖拽移动
          x: startWindowX + deltaX,
          y: startWindowY + deltaY,
        })
      } : w
    ));
  }, []);

  const handleMouseUp = React.useCallback(() => {
    dragRef.current.isDragging = false;
    dragRef.current.resizeDirection = '';
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      timestamp: new Date(),
      isUser: true,
    };

    setConversationMessages([...conversationMessages, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    // 添加思考过程中的消息占位符
    const thinkingMessageId = (Date.now() + 1).toString();
    const thinkingMessage: ConversationMessage = {
      id: thinkingMessageId,
      content: "AI正在思考如何创建您的应用...",
      timestamp: new Date(),
      isUser: false,
      isThinking: true,
      thinking: []
    };
    setConversationMessages(prev => [...prev, thinkingMessage]);

    try {
      // 获取对话历史
      const conversationHistory = conversationMessages.slice(-5).map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      // 模拟思考过程的逐步显示
      setTimeout(() => {
        setConversationMessages(prev =>
          prev.map(msg =>
            msg.id === thinkingMessageId
              ? {
                  ...msg,
                  content: "AI正在思考如何创建您的应用...",
                  thinking: ["1. 分析用户需求：理解您想要的应用类型", "2. 设计输入字段：确定需要的用户输入", "3. 设计计算逻辑：确定如何计算结果", "4. 生成应用Schema：创建完整的应用配置"]
                }
              : msg
          )
        );
      }, 1000);

      // 调用LLM服务
      const response = await llmService.processMessage(inputMessage, conversationHistory);

      // 更新思考过程为实际的LLM思考步骤
      setConversationMessages(prev =>
        prev.map(msg =>
          msg.id === thinkingMessageId
            ? {
                ...msg,
                content: "AI正在生成应用配置...",
                thinking: response.thinking || []
              }
            : msg
        )
      );

      // 处理LLM响应
      if (response.action === 'create_app' && response.appSchema) {
        // 延迟一下，让用户看到完整的思考过程
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 创建动态应用
        const AppWrapper = () => <DynamicApp schema={response.appSchema} />;
        createDynamicApp(
          response.appSchema.title,
          response.appSchema.description,
          AppWrapper,
          Activity
        );

        // 更新思考消息为完成状态
        setConversationMessages(prev =>
          prev.map(msg =>
            msg.id === thinkingMessageId
              ? {
                  ...msg,
                  content: `${response.message}\n\n✅ 应用已添加到桌面！您可以双击桌面图标重新打开。`,
                  isThinking: false
                }
              : msg
          )
        );

        // 打开应用窗口
        setTimeout(() => {
          openWindow('calculator' as any, AppWrapper, response.appSchema.title);
        }, 500);
      } else {
        // 普通聊天响应
        setConversationMessages(prev =>
          prev.map(msg =>
            msg.id === thinkingMessageId
              ? {
                  ...msg,
                  content: response.message,
                  isThinking: false
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('AI响应错误:', error);
      setConversationMessages(prev =>
        prev.map(msg =>
          msg.id === thinkingMessageId
            ? {
                ...msg,
                content: '抱歉，我现在遇到了一些技术问题。您可以尝试稍后再试，或者我可以帮您打开现有的应用程序。',
                isThinking: false
              }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 flex flex-col space-y-4">
        {/* Built-in Apps */}
        <div
          className="flex flex-col items-center space-y-1 cursor-pointer group"
          onDoubleClick={() => openWindow("fileexplorer")}
        >
          <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
            <Folder className="w-8 h-8 text-white" />
          </div>
          <span className="text-white text-sm text-center">File Explorer</span>
        </div>

        <div
          className="flex flex-col items-center space-y-1 cursor-pointer group"
          onDoubleClick={() => openWindow("calculator")}
        >
          <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <span className="text-white text-sm text-center">Calculator</span>
        </div>

        <div
          className="flex flex-col items-center space-y-1 cursor-pointer group"
          onDoubleClick={() => openWindow("browser")}
        >
          <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
            <Monitor className="w-8 h-8 text-white" />
          </div>
          <span className="text-white text-sm text-center">Browser</span>
        </div>

        {/* Dynamic Apps */}
        {dynamicApps.map((app) => {
          const IconComponent = app.icon;
          return (
            <div
              key={app.id}
              className="flex flex-col items-center space-y-1 cursor-pointer group relative"
              onDoubleClick={() => openDynamicWindow(app.id)}
              title={app.description}
              onContextMenu={(e) => {
                e.preventDefault();
                if (window.confirm(`确定要删除 "${app.title}" 吗？`)) {
                  deleteDynamicApp(app.id);
                }
              }}
            >
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all border border-white/10">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <span className="text-white text-sm text-center max-w-[80px] truncate">{app.title}</span>

              {/* 右键删除提示 */}
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Windows */}
      {windows.filter(w => !w.isMinimized).map((window) => (
        <div
          key={window.id}
          className="absolute bg-white rounded-lg shadow-xl border"
          style={{
            left: window.x,
            top: window.y,
            width: window.width,
            height: window.height,
            zIndex: window.zIndex,
          }}
        >
          {/* Window Title Bar */}
          <div
            className="flex items-center justify-between p-2 bg-gray-100 rounded-t-lg cursor-move"
            onMouseDown={(e) => handleMouseDown(e, window.id)}
          >
            <div className="flex items-center space-x-2">
              {/* 显示动态应用图标 */}
              {window.isDynamic && (
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                  <Activity className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              <span className="font-medium text-sm">{window.title}</span>
            </div>
            <div className="flex space-x-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => minimizeWindow(window.id)}
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => maximizeWindow(window.id)}
              >
                <Maximize2 className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => closeWindow(window.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* Window Content */}
          <div
            className="overflow-auto"
            style={{ height: window.height - 40 }}
            ref={(el) => {
              if (el && window.autoHeight) {
                // 简单的自动高度调整逻辑
                const resizeObserver = new ResizeObserver(() => {
                  const contentHeight = el.scrollHeight;
                  const newHeight = Math.min(
                    Math.max(contentHeight + 40, window.minHeight || 200),
                    window.maxHeight || 800
                  );

                  setWindows(prev => prev.map(w =>
                    w.id === window.id ? { ...w, height: newHeight } : w
                  ));
                });

                resizeObserver.observe(el);

                // 清理函数
                return () => resizeObserver.disconnect();
              }
            }}
          >
            <window.component />
          </div>

          {/* Resize Handles */}
          {!window.isMaximized && (
            <>
              {/* Corner handles */}
              <div
                className="absolute top-0 left-0 w-2 h-2 bg-gray-300 rounded-tl cursor-nw-resize hover:bg-gray-400 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, window.id, 'nw')}
              />
              <div
                className="absolute top-0 right-0 w-2 h-2 bg-gray-300 rounded-tr cursor-ne-resize hover:bg-gray-400 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, window.id, 'ne')}
              />
              <div
                className="absolute bottom-0 left-0 w-2 h-2 bg-gray-300 rounded-bl cursor-sw-resize hover:bg-gray-400 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, window.id, 'sw')}
              />
              <div
                className="absolute bottom-0 right-0 w-2 h-2 bg-gray-300 rounded-br cursor-se-resize hover:bg-gray-400 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, window.id, 'se')}
              />

              {/* Edge handles */}
              <div
                className="absolute top-0 left-8 right-8 h-1 bg-gray-300 cursor-ns-resize hover:bg-gray-400 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, window.id, 'n')}
              />
              <div
                className="absolute bottom-0 left-8 right-8 h-1 bg-gray-300 cursor-ns-resize hover:bg-gray-400 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, window.id, 's')}
              />
              <div
                className="absolute top-10 left-0 w-1 bg-gray-300 cursor-ew-resize hover:bg-gray-400 transition-colors"
                style={{ height: `calc(100% - 40px)` }}
                onMouseDown={(e) => handleMouseDown(e, window.id, 'w')}
              />
              <div
                className="absolute top-10 right-0 w-1 bg-gray-300 cursor-ew-resize hover:bg-gray-400 transition-colors"
                style={{ height: `calc(100% - 40px)` }}
                onMouseDown={(e) => handleMouseDown(e, window.id, 'e')}
              />
            </>
          )}
        </div>
      ))}

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 h-16 flex items-center px-4 space-x-2">
        {/* Start Button */}
        <Button className="bg-gray-700 hover:bg-gray-600 text-white">
          <Settings className="w-4 h-4 mr-2" />
          Start
        </Button>

        {/* Running Applications */}
        {windows.map((window) => (
          <Button
            key={window.id}
            variant={window.isMinimized ? "outline" : "secondary"}
            className="text-white flex items-center space-x-2"
            onClick={() => focusWindow(window.id)}
          >
            {/* 显示动态应用图标 */}
            {window.isDynamic && (
              <div className="w-3.5 h-3.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Activity className="w-2 h-2 text-white" />
              </div>
            )}
            <span>{window.title}</span>
          </Button>
        ))}

        <div className="flex-1" />

        {/* Clock */}
        <div className="text-white text-sm" suppressHydrationWarning>
          {typeof window !== "undefined" ? new Date().toLocaleTimeString() : ""}
        </div>

      </div>

      {/* AI Assistant - Minimalist OpenAI Style */}
      <div className="absolute bottom-20 left-4 right-4 max-w-md mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/50 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
                <p className="text-xs text-gray-500">Powered by GLM-4.6</p>
              </div>
            </div>
            <button
              onClick={() => setConversationMessages([])}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto px-4 py-3 space-y-4">
            {conversationMessages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">Hello! I'm your AI Assistant</p>
                <p className="text-xs text-gray-500">Ask me to open apps or manage your desktop</p>
              </div>
            ) : (
              conversationMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`max-w-[85%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl ${
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                        : message.isThinking
                        ? 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200'
                        : 'bg-gray-100 text-gray-900 border border-gray-200/50'
                    }`}>
                      {/* Thinking indicator */}
                      {message.isThinking && (
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-xs text-purple-600 font-medium">AI思考中...</span>
                        </div>
                      )}

                      {/* Message content */}
                      <div className="text-sm leading-relaxed">
                        {message.content}
                      </div>

                      {/* Thinking steps */}
                      {message.isThinking && message.thinking && (
                        <div className="mt-3 space-y-2">
                          {message.thinking.map((step, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-2 text-xs text-purple-700 bg-purple-50/50 px-3 py-2 rounded-lg border border-purple-100"
                              style={{ animation: `slideIn 0.3s ease-out ${index * 0.1}s both` }}
                            >
                              <Sparkles className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`text-xs mt-1 px-1 ${
                      message.isUser ? 'text-blue-100 text-right' : 'text-gray-400 text-left'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI思考中...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="问我创建应用或管理桌面..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isProcessing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={isProcessing || !inputMessage.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl transition-all duration-200 flex items-center justify-center min-w-[40px] h-[40px] shadow-sm hover:shadow-md"
              >
                {isProcessing ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}