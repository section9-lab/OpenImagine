"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Minimize2, Maximize2, X, Folder, Calculator, Chrome, Settings } from "lucide-react";

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
}

interface ConversationMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
}

// Sample applications
const FileExplorer = () => (
  <div className="p-4 h-full bg-white">
    <h2 className="text-lg font-semibold mb-4">File Explorer</h2>
    <div className="space-y-2">
      <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
        <Folder className="w-4 h-4" />
        <span>Documents</span>
      </div>
      <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
        <Folder className="w-4 h-4" />
        <span>Downloads</span>
      </div>
      <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
        <Folder className="w-4 h-4" />
        <span>Pictures</span>
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

  return (
    <div className="p-4 h-full bg-white">
      <div className="bg-gray-100 p-4 rounded text-right text-xl font-mono mb-4">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={handleClear} variant="outline">C</Button>
        <Button onClick={() => handleNumber("/")} variant="outline">÷</Button>
        <Button onClick={() => handleNumber("*")} variant="outline">×</Button>
        <Button onClick={() => setDisplay(display.slice(0, -1))} variant="outline">⌫</Button>
        <Button onClick={() => handleNumber("7")} variant="outline">7</Button>
        <Button onClick={() => handleNumber("8")} variant="outline">8</Button>
        <Button onClick={() => handleNumber("9")} variant="outline">9</Button>
        <Button onClick={() => handleNumber("-")} variant="outline">-</Button>
        <Button onClick={() => handleNumber("4")} variant="outline">4</Button>
        <Button onClick={() => handleNumber("5")} variant="outline">5</Button>
        <Button onClick={() => handleNumber("6")} variant="outline">6</Button>
        <Button onClick={() => handleNumber("+")} variant="outline">+</Button>
        <Button onClick={() => handleNumber("1")} variant="outline">1</Button>
        <Button onClick={() => handleNumber("2")} variant="outline">2</Button>
        <Button onClick={() => handleNumber("3")} variant="outline">3</Button>
        <Button className="row-span-2" onClick={() => setDisplay(eval(display).toString())}>=</Button>
        <Button className="col-span-2" onClick={() => handleNumber("0")} variant="outline">0</Button>
        <Button onClick={() => handleNumber(".")} variant="outline">.</Button>
      </div>
    </div>
  );
};

const BrowserApp = () => (
  <div className="h-full bg-white">
    <div className="border-b p-2 bg-gray-50">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-white border rounded px-3 py-1">
          https://openai.com
        </div>
        <Button size="sm">Go</Button>
      </div>
    </div>
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Welcome to OpenAI</h1>
      <p>This is a simulated browser window.</p>
    </div>
  </div>
);

export default function WebOS() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([
    {
      id: "1",
      content: "Welcome to OpenImagine! I can help you create applications and manage your desktop. Try asking me to open a calculator or file explorer!",
      timestamp: new Date(),
      isUser: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [nextZIndex, setNextZIndex] = useState(1000);
  const dragRef = useRef<{
    isDragging: boolean;
    windowId: string;
    startX: number;
    startY: number;
    startWindowX: number;
    startWindowY: number;
  }>({ isDragging: false, windowId: "", startX: 0, startY: 0, startWindowX: 0, startWindowY: 0 });

  const appTemplates = {
    calculator: { title: "Calculator", component: CalculatorApp, icon: Calculator },
    fileexplorer: { title: "File Explorer", component: FileExplorer, icon: Folder },
    browser: { title: "Browser", component: BrowserApp, icon: Chrome },
  };

  const openWindow = (appType: keyof typeof appTemplates) => {
    const template = appTemplates[appType];
    const newWindow: WindowState = {
      id: Date.now().toString(),
      title: template.title,
      component: template.component,
      x: Math.random() * 200 + 100,
      y: Math.random() * 100 + 100,
      width: 400,
      height: 300,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
    };
    setWindows([...windows, newWindow]);
    setNextZIndex(nextZIndex + 1);
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

  const handleMouseDown = (e: React.MouseEvent, windowId: string) => {
    dragRef.current = {
      isDragging: true,
      windowId,
      startX: e.clientX,
      startY: e.clientY,
      startWindowX: windows.find(w => w.id === windowId)?.x || 0,
      startWindowY: windows.find(w => w.id === windowId)?.y || 0,
    };
    focusWindow(windowId);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    setWindows(prevWindows => prevWindows.map(w => 
      w.id === dragRef.current.windowId ? {
        ...w,
        x: dragRef.current.startWindowX + deltaX,
        y: dragRef.current.startWindowY + deltaY,
      } : w
    ));
  }, []);

  const handleMouseUp = React.useCallback(() => {
    dragRef.current.isDragging = false;
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      timestamp: new Date(),
      isUser: true,
    };

    setConversationMessages([...conversationMessages, userMessage]);

    // Simple AI response logic
    setTimeout(() => {
      let response = "I understand you want to interact with the system. ";
      
      if (inputMessage.toLowerCase().includes("calculator")) {
        openWindow("calculator");
        response = "I've opened the Calculator app for you!";
      } else if (inputMessage.toLowerCase().includes("file") || inputMessage.toLowerCase().includes("folder")) {
        openWindow("fileexplorer");
        response = "I've opened the File Explorer for you!";
      } else if (inputMessage.toLowerCase().includes("browser") || inputMessage.toLowerCase().includes("web")) {
        openWindow("browser");
        response = "I've opened the Browser for you!";
      } else if (inputMessage.toLowerCase().includes("close all")) {
        setWindows([]);
        response = "I've closed all windows for you!";
      } else {
        response = "I can help you open applications like calculator, file explorer, or browser. Just ask me!";
      }

      const aiMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        timestamp: new Date(),
        isUser: false,
      };
      setConversationMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInputMessage("");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 space-y-4">
        <div 
          className="flex flex-col items-center space-y-1 cursor-pointer group"
          onDoubleClick={() => openWindow("fileexplorer")}
        >
          <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
            <Folder className="w-8 h-8 text-white" />
          </div>
          <span className="text-white text-sm">File Explorer</span>
        </div>
        
        <div 
          className="flex flex-col items-center space-y-1 cursor-pointer group"
          onDoubleClick={() => openWindow("calculator")}
        >
          <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <span className="text-white text-sm">Calculator</span>
        </div>

        <div 
          className="flex flex-col items-center space-y-1 cursor-pointer group"
          onDoubleClick={() => openWindow("browser")}
        >
          <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
            <Chrome className="w-8 h-8 text-white" />
          </div>
          <span className="text-white text-sm">Browser</span>
        </div>
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
            <span className="font-medium text-sm">{window.title}</span>
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
          <div className="h-full" style={{ height: window.height - 40 }}>
            <window.component />
          </div>
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
            className="text-white"
            onClick={() => focusWindow(window.id)}
          >
            {window.title}
          </Button>
        ))}

        <div className="flex-1" />

        {/* Clock */}
        <div className="text-white text-sm">
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Conversation Dock */}
      <div className="absolute bottom-16 left-0 right-0 bg-black/80 backdrop-blur-sm">
        {/* Messages */}
        <div className="max-h-64 overflow-y-auto p-4 space-y-2">
          {conversationMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  message.isUser
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-600">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me to open applications or manage your desktop..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}