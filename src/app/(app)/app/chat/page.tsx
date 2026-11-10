import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { getConversation, getPeople, getProjectOptions } from "@/lib/data";
import { ChatClient } from "@/components/app/ChatClient";

export const metadata: Metadata = { title: "Chat" };

type SearchParams = Promise<{ c?: string; new?: string }>;

export default async function ChatPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await requireApp();
  const { c, new: startNew } = await searchParams;
  const { list, active, messages } = getConversation(ctx, c);
  const projects = getProjectOptions(ctx.org.id);
  const people = getPeople(ctx.org.id);

  return (
    <ChatClient
      conversations={list}
      active={active}
      messages={messages}
      projects={projects.map((project) => ({ id: project.id, name: project.name, code: project.code }))}
      people={people.map((person) => ({ id: person.id, name: person.name, avatarColor: person.avatarColor, departmentName: person.departmentName }))}
      currentUserId={ctx.user.id}
      startNew={startNew === "1"}
    />
  );
}
