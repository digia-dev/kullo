"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Hash, Heart, Loader2, MapPin, MessageSquare, MoreHorizontal, Paperclip, Pencil, Plus, Reply, Search, Send, Smile, Sparkles, Star, Trash2, UserMinus, UserPlus, Users, X } from "lucide-react";
import { Avatar, MentionText } from "./ui";
import {
  addConversationMemberAction,
  createChannelAction,
  createConversationAction,
  deleteConversationAction,
  deleteMessageAction,
  editMessageAction,
  markConversationReadAction,
  messageToTaskAction,
  reactToMessageAction,
  removeConversationMemberAction,
  renameConversationAction,
  sendChatAttachmentAction,
  sendMessageAction,
  setConversationMemberRoleAction,
} from "@/app/(app)/actions";
import { formatBytes, formatTime } from "@/lib/utils";
import { toast } from "./Toaster";

type Conversation = {
  id: string;
  kind: string;
  name: string;
  description: string | null;
  projectId: string | null;
  departmentId: string | null;
  lastMessage: string | null;
  lastAuthor: string | null;
  lastAt: string | null;
  unread: number;
  memberIds?: string[];
  roles?: Record<string, string>;
  icon?: string | null;
};

const CHANNEL_ICON_OPTIONS = [
  { key: "hash", label: "Tagar", Icon: Hash },
  { key: "star", label: "Bintang", Icon: Star },
  { key: "heart", label: "Hati", Icon: Heart },
  { key: "pin", label: "Pin", Icon: MapPin },
] as const;

/** Ikon percakapan: ikon pilihan kanal, atau ikon bawaan sesuai jenisnya. */
function ConversationGlyph({ conversation, size = 14 }: { conversation: Pick<Conversation, "kind" | "icon">; size?: number }) {
  const chosen = CHANNEL_ICON_OPTIONS.find((option) => option.key === conversation.icon);
  if (chosen) {
    const Icon = chosen.Icon;
    return <Icon size={size} />;
  }
  if (conversation.kind === "project") return <Sparkles size={size} />;
  if (conversation.kind === "group") return <Users size={size} />;
  if (conversation.kind === "dm") return <MessageSquare size={size} />;
  return <Hash size={size} />;
}

type ChatMessage = {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  createdAt: string;
  replyToId: string | null;
  replyBody: string | null;
  reactions: Array<{ emoji: string; count: number; mine: boolean }>;
  attachments: Array<{ id: string; name: string; kind: string; size: number }>;
};

function renderBody(body: string) {
  return <MentionText body={body} />;
}

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (same(date, today)) return "Hari ini";
  if (same(date, yesterday)) return "Kemarin";
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

export function ChatClient({
  conversations,
  active,
  messages,
  projects,
  people,
  currentUserId,
  startNew = false,
}: {
  conversations: Conversation[];
  active: Conversation | null;
  messages: ChatMessage[];
  projects: Array<{ id: string; name: string; code: string }>;
  people: Array<{ id: string; name: string; avatarColor: string; departmentName?: string | null }>;
  currentUserId: string;
  startNew?: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [taskFor, setTaskFor] = useState<string | null>(null);
  const [taskProject, setTaskProject] = useState(projects[0]?.id ?? "");
  const [newOpen, setNewOpen] = useState(startNew);
  const [memberQuery, setMemberQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [reactionFor, setReactionFor] = useState<string | null>(null);
  const [conversationMenu, setConversationMenu] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string; body: string } | null>(null);
  const [editMessage, setEditMessage] = useState<{ id: string; body: string } | null>(null);
  const [draftBeforeEdit, setDraftBeforeEdit] = useState("");
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [memberBusy, setMemberBusy] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [addMemberQuery, setAddMemberQuery] = useState("");
  const [createMode, setCreateMode] = useState<"chat" | "channel">("chat");
  const [channelName, setChannelName] = useState("");
  const [channelIcon, setChannelIcon] = useState<"hash" | "star" | "heart" | "pin">("hash");
  const [listFilter, setListFilter] = useState<"all" | "unread" | "channel">("all");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<string | null>(null);

  const candidates = useMemo(() => {
    const query = memberQuery.trim().toLowerCase();
    return people
      .filter((person) => person.id !== currentUserId)
      .filter((person) => !query || person.name.toLowerCase().includes(query) || (person.departmentName ?? "").toLowerCase().includes(query));
  }, [people, currentUserId, memberQuery]);

  const mentionMatches = useMemo(() => {    if (!mentionOpen) return [];
    const query = mentionQuery.trim().toLowerCase();
    return people
      .filter((person) => person.id !== currentUserId)
      .filter((person) => !query || person.name.toLowerCase().includes(query))
      .slice(0, 6);
  }, [mentionOpen, mentionQuery, people, currentUserId]);

  const activeMembers = active ? people.filter((person) => active.memberIds?.includes(person.id)) : [];
  const addableMembers = active
    ? people.filter((person) => person.id !== currentUserId && !active.memberIds?.includes(person.id))
    : [];
  const filteredAddable = addableMembers.filter((person) => person.name.toLowerCase().includes(addMemberQuery.trim().toLowerCase()));
  const visibleConversations = conversations.filter((conversation) => {
    if (listFilter === "unread") return conversation.unread > 0;
    if (listFilter === "channel") return conversation.kind !== "dm";
    return true;
  });
  const visibleChannels = visibleConversations.filter((conversation) => conversation.kind !== "dm");
  const visibleDms = visibleConversations.filter((conversation) => conversation.kind === "dm");
  const myRole = active?.roles?.[currentUserId] ?? "member";
  const canManageMembers = Boolean(active && active.kind !== "dm" && myRole === "admin");

  function updateMention(value: string, caret: number) {
    const before = value.slice(0, caret);
    const match = before.match(/(?:^|\s)@([\p{L}\p{N}_ ]{0,24})$/u);
    if (!match) {
      setMentionOpen(false);
      return;
    }
    setMentionQuery(match[1]);
    setMentionIndex(0);
    setMentionOpen(true);
  }

  function insertMention(name: string) {
    const element = composerRef.current;
    const caret = element?.selectionStart ?? body.length;
    const at = body.slice(0, caret).lastIndexOf("@");
    if (at < 0) return;
    const next = `${body.slice(0, at)}@${name} ${body.slice(caret)}`;
    setBody(next);
    setMentionOpen(false);
    window.requestAnimationFrame(() => {
      element?.focus();
      const position = at + name.length + 2;
      element?.setSelectionRange(position, position);
    });
  }

  async function saveEdit() {
    if (!editMessage) return;
    const value = body.trim();
    if (!value) return;
    setPending(true);
    setError("");
    const result = await editMessageAction(editMessage.id, value);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Gagal menyimpan pesan.");
      return;
    }
    setEditMessage(null);
    setBody(draftBeforeEdit);
    setDraftBeforeEdit("");
    toast("Pesan diperbarui");
    router.refresh();
  }

  function startEdit(message: { id: string; body: string }) {
    setReactionFor(null);
    setTaskFor(null);
    setReplyTo(null);
    setActionError("");
    setDraftBeforeEdit(body);
    setEditMessage({ id: message.id, body: message.body });
    setBody(message.body);
    window.requestAnimationFrame(() => {
      const element = composerRef.current;
      if (!element) return;
      element.focus();
      element.setSelectionRange(element.value.length, element.value.length);
      element.scrollIntoView({ block: "nearest" });
    });
  }

  function cancelEdit() {
    setEditMessage(null);
    setBody(draftBeforeEdit);
    setDraftBeforeEdit("");
    setActionError("");
  }

  async function saveRename() {
    if (!active) return;
    setActionBusy(true);
    setActionError("");
    const result = await renameConversationAction(active.id, renameValue);
    setActionBusy(false);
    if (!result.ok) {
      setActionError(result.error ?? "Gagal mengganti nama.");
      return;
    }
    setRenameOpen(false);
    toast("Nama percakapan diperbarui");
    router.refresh();
  }

  async function removeConversation() {
    if (!active) return;
    setActionBusy(true);
    setActionError("");
    const result = await deleteConversationAction(active.id);
    setActionBusy(false);
    if (!result.ok) {
      setActionError(result.error ?? "Gagal menghapus percakapan.");
      return;
    }
    setDeleteOpen(false);
    toast("Percakapan dihapus", "info");
    router.push("/app/chat");
    router.refresh();
  }

  async function addMember(userId: string) {
    if (!active) return;
    setMemberBusy(true);
    setMemberError("");
    const result = await addConversationMemberAction(active.id, userId);
    setMemberBusy(false);
    if (!result.ok) {
      setMemberError(result.error ?? "Gagal menambah anggota.");
      return;
    }
    toast("Anggota ditambahkan");
    router.refresh();
  }

  async function removeMember(userId: string) {
    if (!active) return;
    setMemberBusy(true);
    setMemberError("");
    const result = await removeConversationMemberAction(active.id, userId);
    setMemberBusy(false);
    if (!result.ok) {
      setMemberError(result.error ?? "Gagal mengeluarkan anggota.");
      return;
    }
    if (userId === currentUserId) {
      setMembersOpen(false);
      router.push("/app/chat");
    }
    toast(userId === currentUserId ? "Anda keluar dari grup" : "Anggota dikeluarkan", "info");
    router.refresh();
  }

  async function setRole(userId: string, role: "admin" | "member") {
    if (!active) return;
    setMemberBusy(true);
    setMemberError("");
    const result = await setConversationMemberRoleAction(active.id, userId, role);
    setMemberBusy(false);
    if (!result.ok) {
      setMemberError(result.error ?? "Gagal mengubah peran anggota.");
      return;
    }
    toast(role === "admin" ? "Anggota dijadikan admin" : "Admin anggota dicabut");
    router.refresh();
  }

  async function createConversation() {
    if (selected.length === 0) return;
    setCreating(true);
    setCreateError("");
    const result = await createConversationAction(selected, selected.length > 1 ? groupName : undefined);
    setCreating(false);
    if (!result.ok) {
      setCreateError(result.error ?? "Gagal membuat percakapan.");
      return;
    }
    setNewOpen(false);
    setSelected([]);
    setGroupName("");
    router.push(`/app/chat?c=${result.id}`);
    router.refresh();
  }

  async function createChannel() {
    const name = channelName.trim();
    if (name.length < 2) {
      setCreateError("Nama kanal minimal 2 karakter.");
      return;
    }
    setCreating(true);
    setCreateError("");
    const result = await createChannelAction(name, channelIcon);
    setCreating(false);
    if (!result.ok) {
      setCreateError(result.error ?? "Gagal membuat kanal.");
      return;
    }
    setNewOpen(false);
    setChannelName("");
    setChannelIcon("hash");
    setCreateMode("chat");
    router.push(`/app/chat?c=${result.id}`);
    router.refresh();
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, active?.id]);

  useEffect(() => {
    setEditMessage(null);
    setDraftBeforeEdit("");
  }, [active?.id]);

  useEffect(() => {
    if (!active || readRef.current === active.id || active.unread === 0) return;
    readRef.current = active.id;
    void markConversationReadAction(active.id);
  }, [active]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setNewOpen(false);
      setRenameOpen(false);
      setDeleteOpen(false);
      setDeleteMessageId(null);
      setMembersOpen(false);
      setConversationMenu(false);
      setReactionFor(null);
      setMentionOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const grouped = useMemo(() => {
    const groups: Array<{ day: string; items: ChatMessage[] }> = [];
    for (const message of messages) {
      const day = dayLabel(message.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.day === day) last.items.push(message);
      else groups.push({ day, items: [message] });
    }
    return groups;
  }, [messages]);

  async function send() {
    if (!active) return;
    if (pendingFile) {
      setPending(true);
      setError("");
      const formData = new FormData();
      formData.set("conversationId", active.id);
      formData.set("file", pendingFile);
      if (body.trim()) formData.set("body", body.trim());
      if (replyTo?.id) formData.set("replyToId", replyTo.id);
      const result = await sendChatAttachmentAction(formData);
      setPending(false);
      if (!result.ok) {
        setError(result.error ?? "Lampiran gagal dikirim.");
        return;
      }
      setBody("");
      setReplyTo(null);
      setPendingFile(null);
      setMentionOpen(false);
      toast("Lampiran terkirim");
      router.refresh();
      return;
    }
    if (!body.trim()) return;
    setPending(true);
    setError("");
    const result = await sendMessageAction(active.id, body, replyTo?.id);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Pesan gagal dikirim.");
      return;
    }
    setBody("");
    setReplyTo(null);
    setMentionOpen(false);
    router.refresh();
  }

  function renderConversation(conversation: Conversation) {
    return (
      <button
        key={conversation.id}
        type="button"
        className={`chat-channel ${active?.id === conversation.id ? "active" : ""}`}
        onClick={() => router.push(`/app/chat?c=${conversation.id}`)}
      >
        <ConversationGlyph conversation={conversation} />
        <span className="chat-item-copy">
          <span className="chat-item-name">{conversation.name}</span>
          {conversation.lastMessage && (
            <span className="chat-item-preview">
              {conversation.lastAuthor ? `${conversation.lastAuthor}: ` : ""}{conversation.lastMessage}
            </span>
          )}
        </span>
        <span className="chat-item-side">
          {conversation.lastAt && <span className="chat-item-time">{formatTime(conversation.lastAt)}</span>}
          {conversation.unread > 0 && <span className="nav-count">{conversation.unread}</span>}
        </span>
      </button>
    );
  }

  return (
    <>
    <div className="panel" style={{ overflow: "hidden" }}>
      <div className={`chat-layout ${active ? "has-active" : ""}`}>
        <aside className="chat-side" aria-label="Daftar percakapan">
          <div className="chat-side-head">
            <div
              className="chat-filter-group"
              role="group"
              aria-label="Filter percakapan"
            >
              {([
                ["all", "Semua"],
                ["unread", "Belum dibaca"],
                ["channel", "Kanal"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={listFilter === key}
                  onClick={() => setListFilter(key)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "6px 4px",
                    border: 0,
                    fontSize: 11,
                    fontWeight: listFilter === key ? 650 : 500,
                    background: listFilter === key ? "var(--accent-soft)" : "transparent",
                    color: listFilter === key ? "var(--accent-ink)" : "var(--text-muted)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="icon-btn chat-new-btn"
              aria-label="Chat baru"
              title="Mulai chat, grup, atau kanal baru"
              onClick={() => {
                setNewOpen(true);
                setCreateError("");
              }}
            >
              <Plus size={18} />
            </button>
          </div>
          <div style={{ padding: "0 6px 8px" }}>
            {listFilter === "unread" ? (
              visibleConversations.length === 0 ? (
                <div className="chat-empty-mini">
                  <MessageSquare size={26} aria-hidden />
                  <p className="chat-empty-title">Tidak ada chat belum dibaca</p>
                  <span className="chat-empty-sub">Chat dengan pesan baru akan muncul di sini.</span>
                </div>
              ) : (
                visibleConversations.map(renderConversation)
              )
            ) : listFilter === "channel" ? (
              visibleChannels.length === 0 ? (
                <div className="chat-empty-mini">
                  <Hash size={26} aria-hidden />
                  <p className="chat-empty-title">Belum ada kanal</p>
                  <span className="chat-empty-sub">Buat kanal baru dengan tombol +.</span>
                </div>
              ) : (
                visibleChannels.map(renderConversation)
              )
            ) : (
              <>
                {visibleChannels.length > 0 && (
                  <>
                    <p className="nav-group" style={{ padding: "8px 6px 4px" }}>Kanal</p>
                    {visibleChannels.map(renderConversation)}
                  </>
                )}
                <p className="nav-group" style={{ padding: "10px 6px 4px" }}>Pesan langsung</p>
                {visibleDms.length === 0 ? (
                  <p className="help" style={{ padding: "0 8px", margin: 0 }}>Belum ada pesan langsung.</p>
                ) : (
                  visibleDms.map(renderConversation)
                )}
              </>
            )}
          </div>
        </aside>

        <section className="chat-main">
          {active ? (
            <>
              <div className="chat-head" style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 9, minHeight: 52, position: "relative" }}>
                <button type="button" className="icon-btn chat-back" aria-label="Kembali ke daftar percakapan" onClick={() => router.push("/app/chat")}>
                  <ArrowLeft size={18} />
                </button>
                <ConversationGlyph conversation={active} size={16} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 650 }}>{active.name}</p>
                </div>
                <div style={{ position: "relative", marginLeft: "auto" }}>
                  <button type="button" className="icon-btn" aria-label="Opsi percakapan" aria-expanded={conversationMenu} onClick={() => setConversationMenu((value) => !value)}>
                    <MoreHorizontal size={18} />
                  </button>
                  {conversationMenu && (
                    <div className="popover" role="menu" aria-label="Opsi percakapan" style={{ width: 210 }}>
                      <button
                        type="button"
                        role="menuitem"
                        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", border: 0, background: "transparent", textAlign: "left", fontSize: 13, color: "var(--text)", cursor: "pointer" }}
                        onClick={() => {
                          setConversationMenu(false);
                          setMemberError("");
                          setAddMemberQuery("");
                          setMembersOpen(true);
                        }}
                      >
                        <Users size={14} /> Anggota
                      </button>
                      {(active.kind === "group" || active.kind === "channel") && (
                        <button
                          type="button"
                          role="menuitem"
                          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", border: 0, background: "transparent", textAlign: "left", fontSize: 13, color: "var(--text)", cursor: "pointer" }}
                          onClick={() => {
                            setConversationMenu(false);
                            setRenameValue(active.name);
                            setActionError("");
                            setRenameOpen(true);
                          }}
                        >
                          <Pencil size={14} /> Ganti nama
                        </button>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", border: 0, background: "transparent", textAlign: "left", fontSize: 13, color: "var(--danger)", cursor: "pointer" }}
                        onClick={() => {
                          setConversationMenu(false);
                          setActionError("");
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 size={14} /> Hapus percakapan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="chat-feed">
                {messages.length === 0 ? (
                  <div style={{ padding: 30, textAlign: "center" }}>
                    <MessageSquare size={28} style={{ color: "var(--text-muted)" }} />
                    <p style={{ margin: "8px 0 2px", fontSize: 13, fontWeight: 600 }}>Belum ada pesan</p>
                    <p className="help" style={{ margin: 0 }}>Mulai percakapan. Pesan dapat diubah menjadi tugas dari menu pesan.</p>
                  </div>
                ) : (
                  grouped.map((group) => (
                    <div key={group.day}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px" }}>
                        <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>{group.day}</span>
                        <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
                      </div>
                      {group.items.map((message) => {
                        const mine = message.authorId === currentUserId;
                        return (
                        <div key={message.id} className={`chat-msg ${mine ? "mine" : ""} ${message.body.includes(`@${currentUserId}`) ? "mentioned" : ""}`}>
                          <span className="chat-avatar"><Avatar name={message.authorName} color={message.authorColor} size={30} personId={message.authorId} /></span>
                          <div className="chat-body" style={{ minWidth: 0, flex: 1 }}>
                            <div className="chat-meta" style={{ display: "flex", gap: 7, alignItems: "baseline", flexWrap: "wrap" }}>
                              <strong style={{ fontSize: 12.5 }}>{message.authorName}</strong>
                              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{formatTime(message.createdAt)}</span>
                            </div>
                            {message.replyBody && (
                              <p className="chat-reply" style={{ margin: "2px 0 3px", padding: "3px 7px", borderLeft: "2px solid var(--border)", fontSize: 11.5, color: "var(--text-muted)" }}>
                                {message.replyBody}
                              </p>
                            )}
                            <p className={`chat-bubble ${editMessage?.id === message.id ? "editing" : ""}`} style={{ margin: 0 }}>{renderBody(message.body)}</p>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="chat-attachments">
                                {message.attachments.map((file) => {
                                  const isImage = /^(png|jpg|jpeg|gif|webp)$/.test(file.kind);
                                  const href = `/api/documents/${file.id}/file`;
                                  return isImage ? (
                                    <a key={file.id} href={href} target="_blank" rel="noreferrer" className="chat-attach-image" title={file.name}>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={href} alt={file.name} loading="lazy" />
                                    </a>
                                  ) : (
                                    <a key={file.id} href={href} target="_blank" rel="noreferrer" className="chat-attach-file" title={file.name}>
                                      <Paperclip size={13} />
                                      <span>{file.name}</span>
                                      <span className="chat-attach-size">{formatBytes(file.size)}</span>
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                            <div className="chat-actions" style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                              {message.reactions.map((reaction) => (
                                <button
                                  key={reaction.emoji}
                                  type="button"
                                  className={`reaction ${reaction.mine ? "mine" : ""}`}
                                  onClick={async () => {
                                    await reactToMessageAction(message.id, reaction.emoji);
                                    router.refresh();
                                  }}
                                >
                                  {reaction.emoji} {reaction.count}
                                </button>
                              ))}
                              <div className="reaction-wrap">
                                <button
                                  type="button"
                                  className="reaction"
                                  aria-label="Tambah reaksi"
                                  aria-expanded={reactionFor === message.id}
                                  onClick={() => setReactionFor(reactionFor === message.id ? null : message.id)}
                                >
                                  <Smile size={11} /> {message.reactions.length ? "" : "Reaksi"}
                                </button>
                                {reactionFor === message.id && (
                                  <div className="reaction-pop" role="menu" aria-label="Pilih reaksi">
                                    {["✅", "❌", "👍", "❤️", "⏳", "🎉"].map((emoji) => (
                                      <button
                                        key={emoji}
                                        type="button"
                                        role="menuitem"
                                        aria-label={`Reaksi ${emoji}`}
                                        onClick={async () => {
                                          setReactionFor(null);
                                          await reactToMessageAction(message.id, emoji);
                                          router.refresh();
                                        }}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                className="reaction"
                                onClick={() => setTaskFor(taskFor === message.id ? null : message.id)}
                                title="Jadikan tugas"
                              >
                                <Plus size={11} /> Tugas
                              </button>
                              <button
                                type="button"
                                className="reaction"
                                onClick={() => setReplyTo({ id: message.id, name: message.authorName, body: message.body })}
                                title="Balas pesan"
                              >
                                <Reply size={11} /> Balas
                              </button>
                              {mine && (
                                <button
                                  type="button"
                                  className="reaction"
                                  onClick={() => startEdit({ id: message.id, body: message.body })}
                                  title="Edit pesan"
                                >
                                  <Pencil size={11} /> Edit
                                </button>
                              )}
                              {mine && (
                                <button
                                  type="button"
                                  className="reaction"
                                  onClick={() => setDeleteMessageId(message.id)}
                                  title="Hapus pesan"
                                >
                                  <Trash2 size={11} /> Hapus
                                </button>
                              )}
                            </div>
                            {taskFor === message.id && (
                              <div className="panel" style={{ padding: 8, marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap", background: "var(--surface)" }}>
                                <select className="select" value={taskProject} onChange={(event) => setTaskProject(event.target.value)} style={{ width: "auto", height: 30, fontSize: 11.5 }} aria-label="Proyek untuk tugas baru">
                                  {projects.map((project) => <option key={project.id} value={project.id}>{project.code} · {project.name}</option>)}
                                </select>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  disabled={!taskProject || pending}
                                  onClick={async () => {
                                    setPending(true);
                                    const result = await messageToTaskAction(message.id, taskProject);
                                    setPending(false);
                                    if (result.ok && result.id) {
                                      setTaskFor(null);
                                      router.push(`/app/tasks?task=${result.id}`);
                                    } else setError(result.error ?? "Gagal membuat tugas.");
                                  }}
                                >
                                  Buat tugas
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <div className="chat-compose" style={{ position: "relative" }}>
                {editMessage && (
                  <div className="chat-reply-bar chat-edit-bar">
                    <Pencil size={13} aria-hidden />
                    <span>Edit pesan</span>
                    <button type="button" className="icon-btn" style={{ width: 24, height: 24 }} aria-label="Batalkan edit" onClick={cancelEdit}>
                      <X size={14} />
                    </button>
                  </div>
                )}
                {replyTo && (
                  <div className="chat-reply-bar">
                    <span>
                      Membalas <strong>{replyTo.name}</strong> · {replyTo.body.slice(0, 80)}
                    </span>
                    <button type="button" className="icon-btn" style={{ width: 24, height: 24 }} aria-label="Batalkan balasan" onClick={() => setReplyTo(null)}>
                      <X size={14} />
                    </button>
                  </div>
                )}
                {error && <p className="error-text" style={{ margin: "0 0 6px" }} role="alert">{error}</p>}
                {mentionOpen && mentionMatches.length > 0 && (
                  <div className="mention-pop" role="listbox" aria-label="Sebut anggota">
                    {mentionMatches.map((person, index) => (
                      <button
                        key={person.id}
                        type="button"
                        role="option"
                        aria-selected={index === mentionIndex}
                        className="mention-item"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          insertMention(person.name);
                        }}
                        onMouseEnter={() => setMentionIndex(index)}
                      >
                        <Avatar name={person.name} color={person.avatarColor} size={22} personId={person.id} />
                        <span style={{ minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {person.name}
                        </span>
                        {person.departmentName && (
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{person.departmentName}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {pendingFile && (
                  <div className="chat-attach-chip">
                    <Paperclip size={13} />
                    <span className="chat-attach-name">{pendingFile.name}</span>
                    <span className="chat-attach-size">{formatBytes(pendingFile.size)}</span>
                    <button type="button" className="icon-btn" style={{ width: 22, height: 22 }} aria-label="Hapus lampiran" onClick={() => setPendingFile(null)}>
                      <X size={13} />
                    </button>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <input
                    ref={fileRef}
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.zip,.txt,.csv,.md"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) setPendingFile(file);
                      event.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    className="icon-btn chat-attach-btn"
                    aria-label="Lampirkan file atau gambar"
                    title="Lampirkan file atau gambar"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Paperclip size={17} />
                  </button>
                  <textarea
                    ref={composerRef}
                    className="textarea"
                    style={{ minHeight: 40, maxHeight: 140, height: 40, resize: "none", padding: "9px 11px" }}
                    placeholder={editMessage ? "Edit pesan…" : `Tulis pesan ke ${active.name}…`}
                    value={body}
                    onChange={(event) => {
                      setBody(event.target.value);
                      updateMention(event.target.value, event.target.selectionStart ?? event.target.value.length);
                    }}
                    onPaste={(event) => {
                      const files = Array.from(event.clipboardData?.files ?? []);
                      const image = files.find((file) => file.type.startsWith("image/"));
                      if (image && !editMessage) {
                        event.preventDefault();
                        setPendingFile(image);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (mentionOpen && mentionMatches.length > 0) {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setMentionIndex((value) => Math.min(value + 1, mentionMatches.length - 1));
                          return;
                        }
                        if (event.key === "ArrowUp") {
                          event.preventDefault();
                          setMentionIndex((value) => Math.max(value - 1, 0));
                          return;
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setMentionOpen(false);
                          return;
                        }
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          insertMention(mentionMatches[mentionIndex]?.name ?? mentionMatches[0].name);
                          return;
                        }
                      }
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        if (editMessage) void saveEdit();
                        else void send();
                      }
                      if (event.key === "Escape") {
                        setMentionOpen(false);
                        if (editMessage) cancelEdit();
                      }
                    }}
                    aria-label={editMessage ? "Edit pesan" : "Tulis pesan"}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ height: 40 }}
                    disabled={pending || (editMessage ? !body.trim() : !body.trim() && !pendingFile)}
                    onClick={() => (editMessage ? void saveEdit() : void send())}
                  >
                    {pending ? <Loader2 size={15} className="animate-spin" /> : editMessage ? <Check size={15} /> : <Send size={15} />}
                    {editMessage ? "Simpan" : "Kirim"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 320, padding: 24 }}>
              <div style={{ textAlign: "center", display: "grid", justifyItems: "center" }}>
                <MessageSquare size={30} style={{ color: "var(--text-muted)" }} />
                <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 600 }}>
                  {conversations.length > 0 ? "Pilih percakapan" : "Belum ada percakapan"}
                </p>
                <p className="help" style={{ margin: 0 }}>
                  {conversations.length > 0
                    ? "Pilih kanal, grup, atau pesan langsung di sebelah kiri — atau mulai percakapan baru dengan tombol +."
                    : "Buat percakapan baru dengan tombol + di daftar percakapan."}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>

    {newOpen && (
      <div
        className="palette-backdrop"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setNewOpen(false);
        }}
      >
        <div className="palette" role="dialog" aria-modal="true" aria-label="Percakapan baru" style={{ maxWidth: 460 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <strong style={{ fontSize: 14 }}>Percakapan baru</strong>
            <button type="button" className="icon-btn" style={{ marginLeft: "auto", width: 30, height: 30 }} aria-label="Tutup" onClick={() => setNewOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: 12, display: "grid", gap: 8 }}>
            <div className="tab-row" role="tablist" aria-label="Jenis percakapan" style={{ padding: 0 }}>
              <button
                type="button"
                role="tab"
                aria-selected={createMode === "chat"}
                className={`tab ${createMode === "chat" ? "active" : ""}`}
                onClick={() => {
                  setCreateMode("chat");
                  setCreateError("");
                }}
              >
                Chat &amp; grup
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={createMode === "channel"}
                className={`tab ${createMode === "channel" ? "active" : ""}`}
                onClick={() => {
                  setCreateMode("channel");
                  setCreateError("");
                }}
              >
                Kanal
              </button>
            </div>

            {createMode === "chat" ? (
              <>
                <p className="help" style={{ margin: 0 }}>
                  Pilih satu orang untuk pesan langsung, atau beberapa orang untuk membuat grup.
                </p>
                <div style={{ position: "relative" }}>
                  <Search size={14} aria-hidden style={{ position: "absolute", left: 9, top: 10, color: "var(--text-muted)" }} />
                  <input
                    className="input"
                    style={{ paddingLeft: 30 }}
                    placeholder="Cari anggota…"
                    value={memberQuery}
                    onChange={(event) => setMemberQuery(event.target.value)}
                    aria-label="Cari anggota"
                  />
                </div>
                <div style={{ maxHeight: 260, overflowY: "auto", display: "grid", gap: 2 }}>
                  {candidates.length === 0 ? (
                    <p className="help" style={{ margin: 0, padding: 8 }}>Tidak ada anggota yang cocok.</p>
                  ) : (
                    candidates.map((person) => {
                      const on = selected.includes(person.id);
                      return (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => setSelected((value) => (on ? value.filter((id) => id !== person.id) : [...value, person.id]))}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "7px 8px",
                            borderRadius: 6,
                            border: 0,
                            background: on ? "var(--accent-soft)" : "transparent",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                          }}
                          aria-pressed={on}
                        >
                          <Avatar name={person.name} color={person.avatarColor} size={26} personId={person.id} />
                          <span style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{person.name}</span>
                            {person.departmentName && (
                              <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)" }}>{person.departmentName}</span>
                            )}
                          </span>
                          {on && <Check size={15} style={{ color: "var(--accent)" }} />}
                        </button>
                      );
                    })
                  )}
                </div>
                {selected.length > 1 && (
                  <input
                    className="input"
                    placeholder="Nama grup (opsional)"
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    aria-label="Nama grup"
                  />
                )}
                {createError && <p className="error-text" style={{ margin: 0 }} role="alert">{createError}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setNewOpen(false)}>Batal</button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={creating || selected.length === 0}
                    onClick={() => void createConversation()}
                  >
                    {creating ? "Membuat…" : selected.length > 1 ? "Buat grup" : "Mulai chat"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="help" style={{ margin: 0 }}>
                  Buat kanal baru. Anda menjadi admin dan bisa menambah anggota lewat menu Anggota.
                </p>
                <input
                  className="input"
                  placeholder="Nama kanal"
                  value={channelName}
                  onChange={(event) => setChannelName(event.target.value)}
                  aria-label="Nama kanal"
                />
                <span className="label" style={{ fontSize: 11 }}>Ikon kanal</span>
                <div role="group" aria-label="Ikon kanal" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {CHANNEL_ICON_OPTIONS.map(({ key, label, Icon }) => {
                    const on = channelIcon === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={on}
                        aria-label={`Ikon ${label}`}
                        title={label}
                        onClick={() => setChannelIcon(key)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          height: 34,
                          padding: "0 12px",
                          borderRadius: 7,
                          border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                          background: on ? "var(--accent-soft)" : "var(--bg)",
                          color: on ? "var(--accent-ink)" : "var(--text)",
                          fontSize: 12,
                          fontWeight: on ? 650 : 500,
                          cursor: "pointer",
                        }}
                      >
                        <Icon size={15} /> {label}
                      </button>
                    );
                  })}
                </div>
                {createError && <p className="error-text" style={{ margin: 0 }} role="alert">{createError}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setNewOpen(false)}>Batal</button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={creating || channelName.trim().length < 2}
                    onClick={() => void createChannel()}
                  >
                    {creating ? "Membuat…" : "Buat kanal"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )}
    {renameOpen && active && (
      <div
        className="palette-backdrop"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setRenameOpen(false);
        }}
      >
        <div className="palette" role="dialog" aria-modal="true" aria-label="Ganti nama percakapan" style={{ maxWidth: 380 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <strong style={{ fontSize: 14 }}>Ganti nama percakapan</strong>
            <button type="button" className="icon-btn" style={{ marginLeft: "auto", width: 30, height: 30 }} aria-label="Tutup" onClick={() => setRenameOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: 12, display: "grid", gap: 8 }}>
            <input
              className="input"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              aria-label="Nama percakapan baru"
              autoFocus
            />
            {actionError && <p className="error-text" style={{ margin: 0 }} role="alert">{actionError}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setRenameOpen(false)}>Batal</button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={actionBusy || renameValue.trim().length < 2}
                onClick={() => void saveRename()}
              >
                {actionBusy ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    {deleteOpen && active && (
      <div
        className="palette-backdrop"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDeleteOpen(false);
        }}
      >
        <div className="palette" role="dialog" aria-modal="true" aria-label="Hapus percakapan" style={{ maxWidth: 400 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <strong style={{ fontSize: 14 }}>Hapus percakapan?</strong>
            <button type="button" className="icon-btn" style={{ marginLeft: "auto", width: 30, height: 30 }} aria-label="Tutup" onClick={() => setDeleteOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: 12, display: "grid", gap: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              “{active.name}” beserta seluruh pesannya akan dihapus permanen dari organisasi ini.
            </p>
            {actionError && <p className="error-text" style={{ margin: 0 }} role="alert">{actionError}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setDeleteOpen(false)}>Batal</button>
              <button type="button" className="btn btn-danger btn-sm" disabled={actionBusy} onClick={() => void removeConversation()}>
                {actionBusy ? "Menghapus…" : "Hapus percakapan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    {deleteMessageId && (
      <div className="palette-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteMessageId(null); }}>
        <div className="palette" role="dialog" aria-modal="true" aria-label="Hapus pesan" style={{ maxWidth: 380 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <strong style={{ fontSize: 14 }}>Hapus pesan ini?</strong>
            <button type="button" className="icon-btn" style={{ marginLeft: "auto", width: 30, height: 30 }} aria-label="Tutup" onClick={() => setDeleteMessageId(null)}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: 12, display: "grid", gap: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Pesan akan dihapus permanen untuk semua peserta.</p>
            {actionError && <p className="error-text" style={{ margin: 0 }} role="alert">{actionError}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setDeleteMessageId(null)}>Batal</button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={actionBusy}
                onClick={async () => {
                  setActionBusy(true);
                  setActionError("");
                  const result = await deleteMessageAction(deleteMessageId);
                  setActionBusy(false);
                  if (!result.ok) {
                    setActionError(result.error ?? "Gagal menghapus pesan.");
                    return;
                  }
                  setDeleteMessageId(null);
                  toast("Pesan dihapus", "info");
                  router.refresh();
                }}
              >
                {actionBusy ? "Menghapus…" : "Hapus pesan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    {membersOpen && active && (
      <div className="palette-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMembersOpen(false); }}>
        <div className="palette" role="dialog" aria-modal="true" aria-label="Anggota percakapan" style={{ maxWidth: 460 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <strong style={{ fontSize: 14 }}>Anggota · {active.name}</strong>
            <button type="button" className="icon-btn" style={{ marginLeft: "auto", width: 30, height: 30 }} aria-label="Tutup" onClick={() => setMembersOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: 12, display: "grid", gap: 10 }}>
            {memberError && <p className="error-text" style={{ margin: 0 }} role="alert">{memberError}</p>}
            <p className="help" style={{ margin: 0 }}>
              {active.kind === "dm" ? "Peserta" : `Anggota (${activeMembers.length})`}
            </p>
            <div style={{ display: "grid", gap: 2, maxHeight: 220, overflowY: "auto" }}>
              {activeMembers.map((person) => {
                const role = active.roles?.[person.id] ?? "member";
                const isMe = person.id === currentUserId;
                return (
                  <div key={person.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", flexWrap: "wrap" }}>
                    <Avatar name={person.name} color={person.avatarColor} size={24} personId={person.id} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {person.name}
                        {isMe ? " (Anda)" : ""}
                      </span>
                      {active.kind !== "dm" && role === "admin" && (
                        <span className="badge badge-accent" style={{ height: 18, fontSize: 10 }}>Admin</span>
                      )}
                    </span>
                    {canManageMembers && !isMe && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={memberBusy}
                        onClick={() => void setRole(person.id, role === "admin" ? "member" : "admin")}
                        title={role === "admin" ? "Cabut admin" : "Jadikan admin kanal"}
                      >
                        {role === "admin" ? "Cabut admin" : "Jadikan admin"}
                      </button>
                    )}
                    {active.kind !== "dm" && (isMe || canManageMembers) && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={memberBusy}
                        onClick={() => void removeMember(person.id)}
                        title={isMe ? "Keluar dari percakapan" : "Keluarkan anggota"}
                      >
                        <UserMinus size={14} /> {isMe ? "Keluar" : "Keluarkan"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {canManageMembers ? (
              <>
                <p className="help" style={{ margin: "6px 0 0" }}>Tambah anggota</p>
                <div style={{ position: "relative" }}>
                  <Search size={14} aria-hidden style={{ position: "absolute", left: 9, top: 9, color: "var(--text-muted)" }} />
                  <input
                    className="input"
                    style={{ paddingLeft: 30, height: 34 }}
                    placeholder="Cari anggota untuk ditambahkan…"
                    value={addMemberQuery}
                    onChange={(event) => setAddMemberQuery(event.target.value)}
                    aria-label="Cari anggota untuk ditambahkan"
                  />
                </div>
                <div style={{ display: "grid", gap: 2, maxHeight: 180, overflowY: "auto" }}>
                  {filteredAddable.length === 0 ? (
                    <p className="help" style={{ margin: 0 }}>Tidak ada anggota yang cocok.</p>
                  ) : (
                    filteredAddable.map((person) => (
                      <div key={person.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px" }}>
                        <Avatar name={person.name} color={person.avatarColor} size={24} personId={person.id} />
                        <span style={{ flex: 1, minWidth: 0, fontSize: 13 }}>{person.name}</span>
                        <button type="button" className="btn btn-outline btn-sm" disabled={memberBusy} onClick={() => void addMember(person.id)}>
                          <UserPlus size={14} /> Tambah
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              active.kind !== "dm" && (
                <p className="help" style={{ margin: 0 }}>
                  Hanya admin yang dapat menambah, mengeluarkan, atau mengubah peran anggota.
                </p>
              )
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
