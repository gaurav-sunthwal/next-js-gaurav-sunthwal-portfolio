import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";

interface AIAssistantTabProps {
  active: boolean;
  onMutation?: () => void;
  floating?: boolean;
}

export function AIAssistantTab({ active, onMutation, floating }: AIAssistantTabProps) {
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hi! I am your Portfolio Admin Assistant. I can help you manage your projects, experiences, skills, education, certifications, and settings. What would you like to do?",
    },
  ]);
  const [promptInput, setPromptInput] = useState("");
  const [isSendingPrompt, setIsSendingPrompt] = useState(false);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check if API Key is available on agent tab activation
  const checkApiKey = async () => {
    try {
      const res = await fetch("/api/admin-agent");
      if (res.ok) {
        const data = await res.json();
        setIsApiKeyMissing(!data.hasKey);
      } else {
        setIsApiKeyMissing(true);
      }
    } catch {
      setIsApiKeyMissing(true);
    }
  };

  useEffect(() => {
    if (active || (floating && isFloatingOpen)) {
      checkApiKey();
    }
  }, [active, floating, isFloatingOpen]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (active || isFloatingOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, active, isFloatingOpen]);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim() || isSavingApiKey) return;
    setIsSavingApiKey(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "gemini_api_key", value: apiKeyInput.trim() }),
      });
      if (res.ok) {
        setIsApiKeyMissing(false);
        setApiKeyInput("");
      } else {
        alert("Failed to save API Key");
      }
    } catch (err) {
      alert("Error saving API Key");
    } finally {
      setIsSavingApiKey(false);
    }
  };

  const handleSendPrompt = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const prompt = customPrompt || promptInput;
    if (!prompt.trim() || isSendingPrompt) return;

    const newMessages = [...chatMessages, { role: "user" as const, content: prompt }];
    setChatMessages(newMessages);
    if (!customPrompt) setPromptInput("");
    setIsSendingPrompt(true);

    try {
      const res = await fetch("/api/admin-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages((prev) => [...prev, { role: "assistant" as const, content: data.response }]);
        // Trigger data refresh on the parent panel
        if (onMutation) {
          onMutation();
        }
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant" as const, content: `Error: ${data.error || "Failed to get response"}` },
        ]);
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: `Error: ${err.message || "Something went wrong"}` },
      ]);
    } finally {
      setIsSendingPrompt(false);
    }
  };

  if (!active && !floating) return null;

  if (active) {
    return (
      <div className="space-y-6 flex flex-col h-[calc(100vh-12rem)]">
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-on-surface">AI Portfolio Assistant</h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Manage projects, skills, education, certifications, and settings using natural language.
            </p>
          </div>
        </div>

        {isApiKeyMissing ? (
          <div className="flex-grow flex items-center justify-center p-4">
            <Card
              interactive={false}
              className="w-full max-w-md border border-outline-variant/30 bg-surface-container-lowest p-8 rounded-2xl shadow-lg"
            >
              <div className="text-center mb-6">
                <span className="material-symbols-outlined text-primary text-5xl mb-2">vpn_key</span>
                <h3 className="text-lg font-bold text-on-surface">Gemini API Key Required</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  To activate the AI Assistant, please enter a valid Gemini API Key. The key will be stored securely in
                  your database settings.
                </p>
              </div>

              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <Input
                  label="Gemini API Key"
                  type="password"
                  required
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                />
                <Button
                  type="submit"
                  disabled={isSavingApiKey || !apiKeyInput.trim()}
                  variant="primary"
                  className="w-full py-3 h-auto rounded-xl font-semibold border-none flex justify-center items-center gap-2"
                >
                  {isSavingApiKey ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      <span>Saving Key...</span>
                    </>
                  ) : (
                    <span>Save API Key</span>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        ) : (
          <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0">
            {/* Left Side: Chat Workspace */}
            <Card
              interactive={false}
              className="flex-grow flex flex-col border border-outline-variant/30 bg-surface-container-lowest p-6 rounded-2xl min-h-0"
            >
              {/* Message list */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4 scroll-smooth">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-tr-none"
                          : "bg-surface-container text-on-surface border border-outline-variant/20 rounded-tl-none"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {isSendingPrompt && (
                  <div className="flex justify-start">
                    <div className="bg-surface-container text-on-surface border border-outline-variant/20 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      <span className="text-xs text-on-surface-variant font-medium">Assistant is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input form */}
              <form onSubmit={handleSendPrompt} className="flex gap-2 shrink-0 border-t border-divider pt-4">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Ask me to show, update, delete or add something..."
                  disabled={isSendingPrompt}
                  className="flex-grow bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary transition-all font-medium"
                />
                <Button
                  type="submit"
                  disabled={isSendingPrompt || !promptInput.trim()}
                  variant="primary"
                  className="px-5 py-3 h-auto rounded-xl flex items-center justify-center shrink-0 border-none"
                >
                  <span className="material-symbols-outlined">send</span>
                </Button>
              </form>
            </Card>

            {/* Right Side: Suggestions & Quick actions */}
            <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto">
              <Card
                interactive={false}
                className="p-6 border border-outline-variant/30 bg-surface-container-lowest rounded-2xl"
              >
                <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">lightbulb</span>
                  Quick Suggestions
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    "List all projects",
                    "Show all certifications",
                    "Get current resume link",
                    "Show my work experiences",
                  ].map((sug, i) => (
                    <button
                      key={i}
                      disabled={isSendingPrompt}
                      onClick={(e) => handleSendPrompt(e, sug)}
                      className="text-left text-xs bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-primary p-3 rounded-xl transition-all font-semibold border border-outline-variant/10 cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </Card>

              <Card
                interactive={false}
                className="p-6 border border-outline-variant/30 bg-surface-container-lowest rounded-2xl"
              >
                <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600 text-lg">info</span>
                  Agent Capabilities
                </h3>
                <ul className="text-[11px] leading-relaxed text-on-surface-variant space-y-2 font-medium">
                  <li className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-xs text-primary mt-0.5">check_circle</span>
                    <span>
                      List, create, update, or delete portfolio <strong>Projects</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-xs text-primary mt-0.5">check_circle</span>
                    <span>
                      Manage work <strong>Experiences</strong> and bullets
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-xs text-primary mt-0.5">check_circle</span>
                    <span>
                      Update technical <strong>Skills</strong> in real-time
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-xs text-primary mt-0.5">check_circle</span>
                    <span>
                      View & edit <strong>Certifications</strong> and <strong>Education</strong>
                    </span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Floating Mode
  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsFloatingOpen(!isFloatingOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center bg-primary text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        aria-label="Toggle AI Assistant"
      >
        <span className="material-symbols-outlined text-2xl transition-transform duration-300">
          {isFloatingOpen ? "close" : "smart_toy"}
        </span>
      </button>

      {/* Floating Chat Panel */}
      {isFloatingOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] z-50 flex flex-col bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
          {/* Header */}
          <div className="bg-primary px-5 py-4 flex justify-between items-center shrink-0 text-white">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined">smart_toy</span>
              <div>
                <h3 className="font-bold text-sm leading-none">AI Assistant</h3>
                <span className="text-[10px] text-white/70 font-medium">Online</span>
              </div>
            </div>
            <button
              onClick={() => setIsFloatingOpen(false)}
              className="text-white/80 hover:text-white transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Body */}
          {isApiKeyMissing ? (
            <div className="flex-grow flex items-center justify-center p-6 overflow-y-auto">
              <div className="text-center w-full max-w-xs">
                <span className="material-symbols-outlined text-primary text-4xl mb-2">vpn_key</span>
                <h4 className="text-sm font-bold text-on-surface">API Key Required</h4>
                <p className="text-[11px] text-on-surface-variant mt-1 mb-4 leading-relaxed">
                  Enter Gemini API Key to activate assistant. Stored securely.
                </p>
                <form onSubmit={handleSaveApiKey} className="space-y-3 text-left">
                  <Input
                    label="Gemini API Key"
                    type="password"
                    required
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="py-2 text-xs"
                  />
                  <Button
                    type="submit"
                    disabled={isSavingApiKey || !apiKeyInput.trim()}
                    variant="primary"
                    className="w-full py-2.5 h-auto rounded-lg text-xs font-semibold border-none flex justify-center items-center gap-1.5"
                  >
                    {isSavingApiKey ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-xs">sync</span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Key</span>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col min-h-0 bg-surface-container-lowest">
              {/* Chat Messages */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3 scroll-smooth">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-tr-none"
                          : "bg-surface-container text-on-surface border border-outline-variant/20 rounded-tl-none"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {isSendingPrompt && (
                  <div className="flex justify-start">
                    <div className="bg-surface-container text-on-surface border border-outline-variant/20 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs flex items-center gap-1.5">
                      <span className="material-symbols-outlined animate-spin text-xs">sync</span>
                      <span className="text-[10px] text-on-surface-variant font-medium">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestions (Horizontal Scroll) */}
              <div className="px-4 py-2 border-t border-divider bg-surface-container-low/50 overflow-x-auto flex gap-2 scrollbar-none shrink-0">
                {[
                  "List all projects",
                  "Show all certifications",
                  "Get current resume link",
                  "Show my work experiences",
                ].map((sug, i) => (
                  <button
                    key={i}
                    disabled={isSendingPrompt}
                    onClick={(e) => handleSendPrompt(e, sug)}
                    className="whitespace-nowrap text-[10px] bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-primary px-3 py-1.5 rounded-full transition-all font-semibold border border-outline-variant/10 cursor-pointer shrink-0"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendPrompt} className="p-3 border-t border-divider flex gap-1.5 shrink-0 bg-surface-container-lowest">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Ask me to do something..."
                  disabled={isSendingPrompt}
                  className="flex-grow bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary transition-all font-medium"
                />
                <Button
                  type="submit"
                  disabled={isSendingPrompt || !promptInput.trim()}
                  variant="primary"
                  className="p-2 h-auto rounded-lg flex items-center justify-center shrink-0 border-none aspect-square"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
