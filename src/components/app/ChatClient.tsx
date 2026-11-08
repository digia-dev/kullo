"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, Loader2, MessageSquare, Plus, Send, Smile, Sparkles, Users } from "lucide-react";
import { Avatar } from "./ui";
import { markConversationReadAction, messageToTaskAction, reactToMessageAction, sendMessageAction } from "@/app/(app)/actions";
import { formatTime } from "@/lib/utils";

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
};

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
};

function renderBody(body: string) {
  const parts = body.split(/(@[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)?)/g);
  return parts.map((part, index) =>
    part.startsWith("@") ? (
      <span key={index} style={{ color: "var(--accent)", fontWeight: 600 }}>{part}</span>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
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
  currentUserId,
}: {
  conversations: Conversation[];
  active: Conversation | null;
  messages: ChatMessage[];
  projects: Array<{ id: string; name: string; code: string }>;
  currentUserId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [taskFor, setTaskFor] = useState<string | null>(null);
  const [taskProject, setTaskProject] = useState(projects[0]?.id ?? "");
  const bottomRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, active?.id]);

  useEffect(() => {
    if (!active || readRef.current === active.id || active.unread === 0) return;
    readRef.current = active.id;
    void markConversationReadAction(active.id);
  }, [active]);

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
    if (!active || !body.trim()) return;
    setPending(true);
    setError("");
    const result = await sendMessageAction(active.id, body);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Pesan gagal dikirim.");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <div className="panel" style={{ overflow: "hidden" }}>
      <div className="chat-layout">
        <aside className="chat-side" aria-label="Daftar percakapan">
          <div style={{ padding: "12px 12px 8px", display: "flex", alignItems: "center", gap: 7 }}>
            <strong style={{ fontSize: 12.5 }}>Percakapan</strong>
            <span className="badge">{conversations.length}</span>
          </div>
          <div style={{ padding: "0 6px 8px" }}>
            <p className="nav-group" style={{ padding: "8px 6px 4px" }}>Kanal</p>
            {conversations.filter((conversation) => conversation.kind !== "dm").map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={`chat-channel ${active?.id === conversation.id ? "active" : ""}`}
                onClick={() => router.push(`/app/chat?c=${conversation.id}`)}
              >
                {conversation.kind === "project" ? <Sparkles size={14} /> : <Hash size={14} />}
                <span style={{ minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conversation.name}</span>
                {conversation.unread > 0 && <span className="nav-count">{conversation.unread}</span>}
              </button>
            ))}
            <p className="nav-group" style={{ padding: "10px 6px 4px" }}>Pesan langsung</p>
            {conversations.filter((conversation) => conversation.kind === "dm").length === 0 ? (
              <p className="help" style={{ padding: "0 8px", margin: 0 }}>Belum ada pesan langsung.</p>
            ) : (
              conversations.filter((conversation) => conversation.kind === "dm").map((conversation) => (
                <button key={conversation.id} type="button" className={`chat-channel ${active?.id === conversation.id ? "active" : ""}`} onClick={() => router.push(`/app/chat?c=${conversation.id}`)}>
                  <MessageSquare size={14} />
                  <span style={{ minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conversation.name}</span>
                  {conversation.unread > 0 && <span className="nav-count">{conversation.unread}</span>}
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="chat-main">
          {active ? (
            <>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 9, minHeight: 52 }}>
                {active.kind === "project" ? <Sparkles size={16} style={{ color: "var(--accent)" }} /> : active.kind === "dm" ? <MessageSquare size={16} /> : <Hash size={16} />}
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 650 }}>{active.name}</p>
                  <p style={{ margin: 0, fontSize: 10.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active.description ?? "Percakapan"}</p>
                </div>
                <span className="badge" style={{ marginLeft: "auto" }}><Users size={11} /> {active.kind === "dm" ? "2" : "anggota"}</span>
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
                      {group.items.map((message) => (
                        <div key={message.id} className={`chat-msg ${message.body.includes(`@${currentUserId}`) ? "mentioned" : ""}`}>
                          <Avatar name={message.authorName} color={message.authorColor} size={30} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: "flex", gap: 7, alignItems: "baseline", flexWrap: "wrap" }}>
                              <strong style={{ fontSize: 12.5 }}>{message.authorName}</strong>
                              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{formatTime(message.createdAt)}</span>
                            </div>
                            {message.replyBody && (
                              <p style={{ margin: "2px 0 3px", padding: "3px 7px", borderLeft: "2px solid var(--border)", fontSize: 11.5, color: "var(--text-muted)" }}>
                                {message.replyBody}
                              </p>
                            )}
                            <p className="chat-bubble" style={{ margin: 0 }}>{renderBody(message.body)}</p>
                            <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
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
                              <div style={{ position: "relative" }}>
                                <button
                                  type="button"
                                  className="reaction"
                                  aria-label="Tambah reaksi"
                                  onClick={async () => {
                                    await reactToMessageAction(message.id, "👍");
                                    router.refresh();
                                  }}
                                >
                                  <Smile size={11} /> {message.reactions.length ? "" : "Reaksi"}
                                </button>
                              </div>
                              <button
                                type="button"
                                className="reaction"
                                onClick={() => setTaskFor(taskFor === message.id ? null : message.id)}
                                title="Jadikan tugas"
                              >
                                <Plus size={11} /> Tugas
                              </button>
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
                      ))}
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <div className="chat-compose">
                {error && <p className="error-text" style={{ margin: "0 0 6px" }} role="alert">{error}</p>}
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <textarea
                    className="textarea"
                    style={{ minHeight: 40, maxHeight: 140, height: 40, resize: "none", padding: "9px 11px" }}
                    placeholder={`Tulis pesan ke ${active.name}…`}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void send();
                      }
                    }}
                    aria-label="Tulis pesan"
                  />
                  <button type="button" className="btn btn-primary" style={{ height: 40 }} disabled={pending || !body.trim()} onClick={() => void send()}>
                    {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Kirim
                  </button>
                </div>
                <p className="help" style={{ margin: "4px 0 0" }}>Enter untuk kirim · Shift+Enter untuk baris baru. Mention memakai @nama.</p>
              </div>
            </>
          ) : (
            <div style={{ display: "grid", placeItems: "center", height: "100%", padding: 24 }}>
              <div style={{ textAlign: "center" }}>
                <MessageSquare size={30} style={{ color: "var(--text-muted)" }} />
                <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 600 }}>Belum ada percakapan</p>
                <p className="help" style={{ margin: 0 }}>Kanal dibuat saat organisasi pertama kali didirikan.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
