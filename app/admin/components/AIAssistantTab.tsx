import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  attachment?: {
    url: string;
    name: string;
    type: string;
  };
}

interface AIAssistantTabProps {
  active: boolean;
  onMutation?: () => void;
  floating?: boolean;
}

export function AIAssistantTab({ active, onMutation, floating }: AIAssistantTabProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
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
  const [selectedFile, setSelectedFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "chat");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedFile({
          url: data.url,
          name: file.name,
          type: file.type,
        });
      } else {
        alert("Failed to upload file");
      }
    } catch (err) {
      alert("Error uploading file");
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (!file) continue;

        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
          continue;
        }

        setIsUploadingFile(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "chat");

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            setSelectedFile({
              url: data.url,
              name: file.name || "pasted-image.png",
              type: file.type,
            });
          } else {
            alert("Failed to upload pasted file");
          }
        } catch (err) {
          alert("Error uploading pasted file");
        } finally {
          setIsUploadingFile(false);
        }

        e.preventDefault();
        break;
      }
    }
  };

  const handleSendPrompt = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const prompt = customPrompt || promptInput;
    if (!prompt.trim() || isSendingPrompt) return;

    const userMessage: ChatMessage = {
      role: "user" as const,
      content: prompt,
    };
    if (selectedFile) {
      userMessage.attachment = selectedFile;
    }

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setSelectedFile(null);
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
                      <div
                        className={`prose text-sm break-words whitespace-pre-wrap leading-relaxed
                          ${msg.role === "user" ? "text-white [&_strong]:text-white [&_code]:bg-white/20 [&_code]:text-white" : "text-on-surface [&_code]:bg-black/10"}
                          [&_p]:mb-2 [&_p:last-child]:mb-0
                          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
                          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
                          [&_li]:mb-1
                          [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2
                          [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2
                          [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mb-1
                          [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs
                          [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-2
                          [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-zinc-100
                          [&_strong]:font-bold
                          [&_table]:border-collapse [&_table]:w-full [&_table]:mb-2
                          [&_th]:border [&_th]:border-outline-variant/30 [&_th]:p-2 [&_th]:bg-surface-container-high [&_th]:font-bold [&_th]:text-left
                          [&_td]:border [&_td]:border-outline-variant/30 [&_td]:p-2 [&_td]:text-left`}
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.attachment && (
                        <a
                          href={msg.attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 mt-2 bg-white/20 hover:bg-white/30 text-[10px] text-white px-2 py-1 rounded-md w-fit font-semibold"
                        >
                          <span className="material-symbols-outlined text-xs">
                            {msg.attachment.type.startsWith("image/") ? "image" : "description"}
                          </span>
                          <span className="truncate max-w-[150px]">{msg.attachment.name}</span>
                        </a>
                      )}
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
              <div className="border-t border-divider pt-4 shrink-0 flex flex-col gap-2">
                {/* File Attachment Preview */}
                {selectedFile && (
                  <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-lg text-xs font-semibold w-fit text-on-surface border border-outline-variant/30">
                    <span className="material-symbols-outlined text-sm text-primary">
                      {selectedFile.type.startsWith("image/") ? "image" : "description"}
                    </span>
                    <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-on-surface-variant hover:text-error transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendPrompt} className="flex gap-2 w-full">
                  <button
                    type="button"
                    disabled={isSendingPrompt || isUploadingFile}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary rounded-xl flex items-center justify-center shrink-0 border border-outline-variant/30 cursor-pointer"
                  >
                    {isUploadingFile ? (
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    ) : (
                      <span className="material-symbols-outlined">attach_file</span>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onPaste={handlePaste}
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
              </div>
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
                      <div
                        className={`prose text-xs break-words whitespace-pre-wrap leading-relaxed
                          ${msg.role === "user" ? "text-white [&_strong]:text-white [&_code]:bg-white/20 [&_code]:text-white" : "text-on-surface [&_code]:bg-black/10"}
                          [&_p]:mb-2 [&_p:last-child]:mb-0
                          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
                          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
                          [&_li]:mb-1
                          [&_h1]:text-base [&_h1]:font-bold [&_h1]:mb-1.5
                          [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mb-1.5
                          [&_h3]:text-xs [&_h3]:font-bold [&_h3]:mb-1
                          [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[10px]
                          [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-2
                          [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-zinc-100
                          [&_strong]:font-bold
                          [&_table]:border-collapse [&_table]:w-full [&_table]:mb-2
                          [&_th]:border [&_th]:border-outline-variant/30 [&_th]:p-1.5 [&_th]:bg-surface-container-high [&_th]:font-bold [&_th]:text-left
                          [&_td]:border [&_td]:border-outline-variant/30 [&_td]:p-1.5 [&_td]:text-left`}
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.attachment && (
                        <a
                          href={msg.attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 mt-1.5 bg-white/20 hover:bg-white/30 text-[9px] text-white px-2 py-0.5 rounded-md w-fit font-semibold"
                        >
                          <span className="material-symbols-outlined text-[10px]">
                            {msg.attachment.type.startsWith("image/") ? "image" : "description"}
                          </span>
                          <span className="truncate max-w-[130px]">{msg.attachment.name}</span>
                        </a>
                      )}
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
              <div className="border-t border-divider bg-surface-container-lowest p-3 shrink-0 flex flex-col gap-2">
                {/* File Attachment Preview */}
                {selectedFile && (
                  <div className="flex items-center gap-1.5 bg-surface-container-high px-2 py-1 rounded-md text-[10px] font-semibold w-fit text-on-surface border border-outline-variant/30">
                    <span className="material-symbols-outlined text-xs text-primary">
                      {selectedFile.type.startsWith("image/") ? "image" : "description"}
                    </span>
                    <span className="truncate max-w-[150px]">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-on-surface-variant hover:text-error transition-all"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendPrompt} className="flex gap-1.5 w-full">
                  <button
                    type="button"
                    disabled={isSendingPrompt || isUploadingFile}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary rounded-lg flex items-center justify-center shrink-0 border border-outline-variant/30 cursor-pointer"
                  >
                    {isUploadingFile ? (
                      <span className="material-symbols-outlined animate-spin text-xs">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">attach_file</span>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onPaste={handlePaste}
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
            </div>
          )}
        </div>
      )}
    </>
  );
}
