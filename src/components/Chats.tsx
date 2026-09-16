import React, { useState, useEffect, useCallback, useRef } from "react";
import { Group as PanelGroup, Panel } from "react-resizable-panels";
import { Character, Chat, Message, Attachment, User } from "../types";
import {
  chatCompletion,
  clearChat,
  createChat,
  deleteChat,
  deleteMessage,
  getChat,
  getMe,
  listChats,
  listCharacters,
  setChatMemories,
  subscribeProfileUpdated,
} from "../lib/api";
import {
  cleanDisplayContent,
  compressImageFile,
  createMemoryItem,
} from "./chats/chatUtils";
import ChatThreadList from "./chats/ChatThreadList";
import ChatWindow, { type PendingAttachment } from "./chats/ChatWindow";
import ChatDetailsPanel from "./chats/ChatDetailsPanel";
import ResizeHandle from "./chats/ResizeHandle";
import { MemoryMap } from "./MemoryMap";
import { useParams, useNavigate, useLocation } from "react-router-dom";

interface ChatsProps {
  selectedCharacterId?: string | null;
}

const Chats: React.FC<ChatsProps> = ({ selectedCharacterId }) => {
  const { characterId: routeCharacterId } = useParams<{ characterId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTargetCharacterId = routeCharacterId || selectedCharacterId || null;
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [characters, setCharacters] = useState<Record<string, Character>>({});
  const [showDetails, setShowDetails] = useState(true);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);

  // Which chat is currently displayed. Async message/appends only touch the
  // messages state when the user is still viewing that same chat, so a
  // response that arrives after switching chats cannot corrupt another chat's view.
  const activeChatIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeChatIdRef.current = activeChat?.id ?? null;
  }, [activeChat?.id]);

  const pendingCreateRef = useRef(new Set<string>());

  // Live user profile
  useEffect(() => {
    getMe().then(setUserProfile).catch(() => {});
    return subscribeProfileUpdated(() => {
      getMe().then(setUserProfile).catch(() => {});
    });
  }, []);

  // Available characters for the new-chat dropdown
  useEffect(() => {
    let active = true;
    listCharacters("public")
      .then((data) => {
        if (active) setAvailableCharacters(data.characters.slice(0, 20));
      })
      .catch((err) => console.error("Error loading available characters:", err));
    return () => {
      active = false;
    };
  }, []);

  // Load chats (enriched server-side with character snapshots)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await listChats();
        if (!active) return;
        setChats(data.chats);
        const charMap: Record<string, Character> = {};
        for (const chat of data.chats) {
          if (chat.character) charMap[chat.characterId] = chat.character;
        }
        setCharacters((prev) => ({ ...prev, ...charMap }));
      } catch (err) {
        console.error("Error loading chats:", err);
      } finally {
        if (active) setLoadingChats(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Load messages whenever the active chat changes
  useEffect(() => {
    if (!activeChat?.id) {
      setMessages([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const data = await getChat(activeChat.id);
        if (!active) return;
        if (data.chat) {
          const freshMems = data.chat.memories || [];
          setActiveChat((prev) => (prev && prev.id === data.chat.id ? { ...prev, ...data.chat, memories: freshMems } : prev));
          setChats((prev) => prev.map((c) => (c.id === data.chat.id ? { ...c, ...data.chat, memories: freshMems } : c)));
        }
        if (data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([{
            id: "initial",
            chatId: activeChat.id,
            senderId: activeChat.characterId,
            role: "assistant",
            text: activeChat.lastMessage,
            createdAt: activeChat.lastMessageAt,
          }]);
        }
      } catch (err) {
        console.error(`Error loading messages for chat ${activeChat.id}:`, err);
      }
    })();
    return () => {
      active = false;
    };
  }, [activeChat?.id]);

  const handleSetActiveChat = useCallback((chat: Chat) => {
    setActiveChat(chat);
    const char = characters[chat.characterId] || chat.character || null;
    setActiveCharacter(char as Character | null);
    if (chat.characterId && location.pathname !== `/chats/${chat.characterId}`) {
      navigate(`/chats/${chat.characterId}`);
    }
  }, [characters, location.pathname, navigate]);

  const startNewChat = useCallback(async (characterId: string) => {
    try {
      const { chat } = await createChat(characterId);
      setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)]);
      const char = chat.character as Character | undefined;
      if (char) {
        setCharacters((prev) => ({ ...prev, [characterId]: char }));
        setActiveCharacter(char);
      }
      setActiveChat(chat);
      setMessages([]);
      if (location.pathname !== `/chats/${characterId}`) {
        navigate(`/chats/${characterId}`);
      }
    } catch (err) {
      console.error("Error starting new chat:", err);
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!activeTargetCharacterId || loadingChats) return;
    const existingChat = chats.find((c) => c.characterId === activeTargetCharacterId);
    if (existingChat) {
      if (activeChat?.id !== existingChat.id) handleSetActiveChat(existingChat);
      return;
    }
    if (pendingCreateRef.current.has(activeTargetCharacterId)) return;
    pendingCreateRef.current.add(activeTargetCharacterId);
    startNewChat(activeTargetCharacterId).finally(() => {
      pendingCreateRef.current.delete(activeTargetCharacterId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTargetCharacterId, loadingChats, chats, activeChat?.id]);

  const handleSendMessage = async (text: string, pending: PendingAttachment | null) => {
    if (!activeChat || !activeCharacter || isLoading || isUploading || (!text.trim() && !pending)) return;
    const targetChatId = activeChat.id;

    setIsLoading(true);
    let attachment: Attachment | undefined;

    if (pending) {
      setIsUploading(true);
      try {
        const fileId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        let base64Url: string;
        if (pending.type === "image") {
          base64Url = await compressImageFile(pending.file, 1200, 0.85);
        } else {
          base64Url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(pending.file);
          });
        }

        try {
          localStorage.setItem(fileId, base64Url);
        } catch {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("local_")) {
              localStorage.removeItem(key);
            }
          }
          localStorage.setItem(fileId, base64Url);
        }

        attachment = {
          url: pending.type === "image" ? base64Url : `local://${fileId}`,
          type: pending.type,
          name: pending.file.name,
        };
      } catch (err) {
        console.error("Failed to prepare attachment:", err);
      }
      setIsUploading(false);
    }

    const tempMessage: Message | null = activeChatIdRef.current === targetChatId
      ? {
          id: "temp",
          chatId: targetChatId,
          senderId: targetChatId,
          role: "user",
          text,
          ...(attachment ? { attachment } : {}),
          createdAt: Date.now(),
        }
      : null;
    if (tempMessage) {
      setMessages((prev) => [...prev.filter((m) => m.id !== "temp"), tempMessage]);
    }

    const recoveryText = "Haha wait, my connection blinked for a second! What did you say?";

    try {
      const response = await chatCompletion(
        {
          chatId: targetChatId,
          text,
          ...(attachment
            ? {
                attachment: {
                  name: attachment.name,
                  type: attachment.type,
                  ...(attachment.type === "image" ? { data: attachment.url } : { url: attachment.url }),
                },
              }
            : {}),
        },
        AbortSignal.timeout(14000)
      );

      const raw = response.choices?.[0]?.message?.content || "";
      const aiContent = raw ? cleanDisplayContent(raw) : "";
      const shown = aiContent || recoveryText;

      if (activeChatIdRef.current === targetChatId) {
        setMessages((prev) => {
          const next = prev.filter((m) => m.id !== "temp" && m.id !== "temp-assistant");
          if (response.userMessage) next.push(response.userMessage);
          if (response.assistantMessage) {
            next.push(response.assistantMessage);
          } else {
            next.push({
              id: "temp-assistant",
              chatId: targetChatId,
              senderId: targetChatId,
              role: "assistant",
              text: shown,
              createdAt: Date.now(),
            });
          }
          return next;
        });

        // Real-time memory update: immediately reflect extracted memories without page reload
        if (response.memories && Array.isArray(response.memories)) {
          setActiveChat((prev) => (prev && prev.id === targetChatId ? { ...prev, memories: response.memories } : prev));
          setChats((prev) => prev.map((c) => (c.id === targetChatId ? { ...c, memories: response.memories } : c)));
        }
      }

      // Trailing sync 2.5s later to ensure any trailing background extraction is seamlessly captured
      setTimeout(async () => {
        try {
          if (activeChatIdRef.current === targetChatId) {
            const fresh = await getChat(targetChatId);
            if (fresh?.chat?.memories) {
              setActiveChat((prev) => (prev && prev.id === targetChatId ? { ...prev, memories: fresh.chat.memories } : prev));
              setChats((prev) => prev.map((c) => (c.id === targetChatId ? { ...c, memories: fresh.chat.memories } : c)));
            }
          }
        } catch {
          // Ignore background sync errors
        }
      }, 2500);
    } catch (err: any) {
      console.warn("AI fetch encountered an issue, using in-character recovery:", err);
      if (activeChatIdRef.current === targetChatId) {
        setMessages((prev) => {
          const next = prev.filter((m) => m.id !== "temp" && m.id !== "temp-assistant");
          if (tempMessage) next.push(tempMessage);
          next.push({
            id: "temp-assistant",
            chatId: targetChatId,
            senderId: targetChatId,
            role: "assistant",
            text: recoveryText,
            createdAt: Date.now(),
          });
          return next;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateResponse = async (assistantMsgId?: string) => {
    if (!activeChat || !activeCharacter || isLoading) return;
    const targetChatId = activeChat.id;
    setIsLoading(true);
    const recoveryText = "Haha wait, what did you say again? Tell me what you're thinking!";
    try {
      const response = await chatCompletion(
        {
          chatId: targetChatId,
          regenerate: true,
          ...(assistantMsgId && assistantMsgId !== "initial" && assistantMsgId !== "temp"
            ? { assistantMessageId: assistantMsgId }
            : {}),
        },
        AbortSignal.timeout(14000)
      );

      const raw = response.choices?.[0]?.message?.content || "";
      const aiContent = raw ? cleanDisplayContent(raw) : "";
      const shown = aiContent || recoveryText;

      if (activeChatIdRef.current === targetChatId) {
        setMessages((prev) => {
          const next = prev.filter(
            (m) => m.id !== assistantMsgId && m.id !== response.assistantMessage?.id && m.id !== "temp-assistant"
          );
          if (response.assistantMessage) {
            next.push(response.assistantMessage);
          } else {
            next.push({
              id: "temp-assistant",
              chatId: targetChatId,
              senderId: targetChatId,
              role: "assistant",
              text: shown,
              createdAt: Date.now(),
            });
          }
          return next;
        });

        // Real-time memory update on regeneration
        if (response.memories && Array.isArray(response.memories)) {
          setActiveChat((prev) => (prev && prev.id === targetChatId ? { ...prev, memories: response.memories } : prev));
          setChats((prev) => prev.map((c) => (c.id === targetChatId ? { ...c, memories: response.memories } : c)));
        }
      }
    } catch (err: any) {
      console.warn("AI fetch encountered an issue during regeneration:", err);
      if (activeChatIdRef.current === targetChatId) {
        setMessages((prev) => [...prev.filter((m) => m.id !== assistantMsgId), {
          id: "temp-assistant",
          chatId: targetChatId,
          senderId: targetChatId,
          role: "assistant",
          text: recoveryText,
          createdAt: Date.now(),
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSingleMessage = async (msgId: string) => {
    if (!activeChat || !msgId || msgId === "initial" || msgId === "temp") return;
    try {
      await deleteMessage(activeChat.id, msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleClearChat = async () => {
    if (!activeChat) return;
    if (confirm("Reset this conversation and clear message history?")) {
      try {
        const data = await clearChat(activeChat.id);
        setActiveChat((prev) => (prev ? { ...prev, ...data.chat } : prev));
        setMessages([]);
      } catch (e) {
        console.error("Failed to clear chat:", e);
      }
    }
  };

  const handleAddMemory = async (text: string) => {
    if (!activeChat || !text.trim()) return;
    try {
      const updated = [...(activeChat.memories || []), createMemoryItem(text)];
      const res = await setChatMemories(activeChat.id, updated);
      const freshMems = res.chat.memories || [];
      setActiveChat((prev) => (prev ? { ...prev, memories: freshMems } : prev));
      setChats((prev) => prev.map((c) => (c.id === activeChat.id ? { ...c, memories: freshMems } : c)));
    } catch (err) {
      console.error("Failed to add memory:", err);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!activeChat) return;
    try {
      const updated = (activeChat.memories || []).filter((m) => m.id !== memoryId);
      const res = await setChatMemories(activeChat.id, updated);
      const freshMems = res.chat.memories || [];
      setActiveChat((prev) => (prev ? { ...prev, memories: freshMems } : prev));
      setChats((prev) => prev.map((c) => (c.id === activeChat.id ? { ...c, memories: freshMems } : c)));
    } catch (err) {
      console.error("Failed to delete memory:", err);
    }
  };

  const handleDeleteChat = async (chat: Chat) => {
    const charName = characters[chat.characterId]?.name || chat.character?.name || "this character";
    if (!confirm(`Delete chat with ${charName}? This cannot be undone.`)) return;
    try {
      await deleteChat(chat.id);
      setChats((prev) => prev.filter((c) => c.id !== chat.id));
      if (activeChatIdRef.current === chat.id) {
        setActiveChat(null);
        setActiveCharacter(null);
        setMessages([]);
        if (location.pathname !== '/chats') {
          navigate('/chats', { replace: true });
        }
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  return (
    <div className="w-full h-full bg-white font-sans text-black overflow-hidden">
      <PanelGroup orientation="horizontal" className="w-full h-full">
        <Panel id="sidebar" defaultSize="25%" minSize="20%" maxSize="40%" className="border-r border-zinc-100 flex flex-col h-full bg-white relative">
          <ChatThreadList
            chats={chats}
            characters={characters}
            activeChatId={activeChat?.id || null}
            loadingChats={loadingChats}
            availableCharacters={availableCharacters}
            onSelectChat={handleSetActiveChat}
            onStartNewChat={startNewChat}
            onDeleteChat={handleDeleteChat}
          />
        </Panel>

        <ResizeHandle />

        <Panel minSize="30%" className="flex flex-col bg-[#F8F8F8] overflow-hidden relative">
          <ChatWindow
            character={activeCharacter}
            messages={messages}
            isLoading={isLoading}
            isUploading={isUploading}
            onBack={() => {
              setActiveChat(null);
              setActiveCharacter(null);
            }}
            onToggleDetails={() => setShowDetails(!showDetails)}
            onRegenerate={handleRegenerateResponse}
            onDeleteMessage={handleDeleteSingleMessage}
            onSend={handleSendMessage}
          />
        </Panel>

        {showDetails && activeCharacter && activeChat && <ResizeHandle />}
        {showDetails && activeCharacter && activeChat && (
          <Panel id="details" defaultSize="25%" minSize="20%" maxSize="40%" className="border-l border-zinc-100 bg-zinc-50/30 flex flex-col">
            <ChatDetailsPanel
              character={activeCharacter}
              chat={activeChat}
              onClose={() => setShowDetails(false)}
              onResetChat={handleClearChat}
              onAddMemory={handleAddMemory}
              onDeleteMemory={handleDeleteMemory}
              onOpenMemoryModal={() => setShowMemoryModal(true)}
            />
          </Panel>
        )}
      </PanelGroup>

      {showMemoryModal && activeCharacter && activeChat && (
        <MemoryMap
          memories={activeChat.memories || []}
          character={activeCharacter}
          onAddMemory={handleAddMemory}
          onDeleteMemory={handleDeleteMemory}
          isModal={true}
          onCloseModal={() => setShowMemoryModal(false)}
        />
      )}
    </div>
  );
};

export default Chats;