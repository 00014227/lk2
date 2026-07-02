"use client";

import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";

import { quickGroups, type QuickGroup } from "../lib/quick-questions";

interface QuickQuestionsProps {
  status: string;
  text: string;
  setText: (v: string) => void;
  selectedGroup: QuickGroup | null;
  setSelectedGroup: (g: QuickGroup | null) => void;
  sending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function QuickQuestions({
  status,
  text,
  setText,
  selectedGroup,
  setSelectedGroup,
  sending,
  onSubmit,
}: QuickQuestionsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      {!selectedGroup ? (
        <>
          <p className="text-center text-sm font-semibold text-slate-700">
            {t("chat.quick.prompt")}
          </p>
          <div className="flex flex-col gap-2">
            {quickGroups(status, t).map((g) => (
              <button
                key={g.icon}
                type="button"
                onClick={() => setSelectedGroup(g)}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3.5 text-left transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]"
              >
                <span className="text-2xl">{g.icon}</span>
                <span className="text-sm font-semibold text-slate-800">{g.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setSelectedGroup(null);
              setText("");
            }}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ArrowLeft className="h-3 w-3" /> {t("common.back")}
          </button>
          <p className="text-sm font-semibold text-slate-700">
            {selectedGroup.icon} {selectedGroup.label}
          </p>
          {selectedGroup.templates.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {selectedGroup.templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setText(tpl)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    text === tpl
                      ? "border-primary bg-primary/8 font-semibold text-primary"
                      : "border-border bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {tpl}
                </button>
              ))}
            </div>
          )}
          <form className="flex gap-2 pt-1" onSubmit={onSubmit}>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("chat.quick.customPlaceholder")}
              disabled={sending}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={sending || !text.trim()}
              className="h-12 w-12 shrink-0"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
