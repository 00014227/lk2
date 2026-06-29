"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import type { OrderMessage } from "@entities/order-message";
import type { Shipment } from "@entities/shipment";
import type { QuickGroup } from "../lib/quick-questions";
import { ManagerContact } from "./manager-contact";
import { MessageBubble } from "./message-bubble";
import { QuickQuestions } from "./quick-questions";

interface ChatPanelProps {
  shipment: Shipment;
  messages: OrderMessage[];
  loading: boolean;
  onSend: (body: string) => Promise<void>;
  /** Hide the in-body manager contact block (e.g. when the dock header shows it). */
  showContacts?: boolean;
  /** Fill the parent height — message list grows instead of fixed 256px (dock mode). */
  fill?: boolean;
}

export function ChatPanel({ shipment, messages, loading, onSend, showContacts = true, fill = false }: ChatPanelProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<QuickGroup | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await onSend(body);
      setText("");
      setSelectedGroup(null);
    } catch { /* ignore */ }
    finally { setSending(false); }
  }

  const hasContacts = showContacts && (shipment.responsibleName || shipment.kamName);

  return (
    <div className={`flex flex-col gap-3 px-5 py-4 ${fill ? "h-full" : ""}`}>
      {/* Manager contacts */}
      {hasContacts && (
        <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-2">
          {shipment.responsibleName && (
            <ManagerContact role="Ответственный" name={shipment.responsibleName} phone={shipment.responsiblePhone} email={shipment.responsibleEmail} />
          )}
          {shipment.kamName && (
            <ManagerContact role="Менеджер" name={shipment.kamName} phone={shipment.kamPhone} email={shipment.kamEmail} />
          )}
        </div>
      )}

      {/* EMPTY CHAT: Quick Questions (prefill only) */}
      {!hasMessages && !loading && (
        <QuickQuestions
          status={shipment.status}
          text={text}
          setText={setText}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          sending={sending}
          onSubmit={handleSend}
        />
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Загрузка...
        </div>
      )}

      {/* CHAT WITH HISTORY — no topic selection anywhere */}
      {hasMessages && (
        <>
          <div ref={listRef} className={`flex flex-col gap-2 overflow-y-auto rounded-2xl bg-slate-50/60 p-3 ${fill ? "min-h-0 flex-1" : "h-64"}`}>
            {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
          </div>

          <form className="flex gap-2" onSubmit={handleSend}>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Сообщение..."
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={sending || !text.trim()} className="h-12 w-12 shrink-0">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
