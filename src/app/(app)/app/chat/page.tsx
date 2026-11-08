import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { getConversation, getProjectOptions } from "@/lib/data";
import { ChatClient } from "@/components/app/ChatClient";
import { PageHeader } from "@/components/app/ui";

export const metadata: Metadata = { title: "Chat" };

type SearchParams = Promise<{ c?: string }>;

export default async function ChatPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await requireApp();
  const { c } = await searchParams;
  const { list, active, messages } = getConversation(ctx, c);
  const projects = getProjectOptions(ctx.org.id);
  const unread = list.reduce((sum, conversation) => sum + conversation.unread, 0);

  return (
    <>
      <PageHeader
        eyebrow="Kolaborasi"
        title="Chat"
        subtitle={`${list.length} percakapan · ${unread} pesan belum dibaca · pesan dapat diubah jadi tugas`}
      />
      <ChatClient
        conversations={list}
        active={active}
        messages={messages}
        projects={projects.map((project) => ({ id: project.id, name: project.name, code: project.code }))}
        currentUserId={ctx.user.id}
      />
    </>
  );
}
