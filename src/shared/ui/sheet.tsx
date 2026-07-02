"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@shared/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;
const SheetPortal = Dialog.Portal;

function SheetOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Overlay>) {
  return (
    <Dialog.Overlay
      className={cn("fixed inset-0 z-40 bg-slate-950/18 backdrop-blur-[2px]", className)}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Content>) {
  const { t } = useTranslation();
  return (
    <SheetPortal>
      <SheetOverlay />
      <Dialog.Content
        className={cn(
          // Полноэкранный на телефонах (без скруглений/отступов), карточка
          // справа на sm+. pb под safe-area для iOS-индикатора.
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col rounded-none border border-white/70 bg-white/96 pb-[env(safe-area-inset-bottom)] shadow-[0_24px_80px_rgba(16,35,48,0.24)] outline-none sm:inset-y-4 sm:right-4 sm:max-w-xl sm:rounded-[28px] sm:pb-0",
          className,
        )}
        {...props}
      >
        {children}
        <SheetClose className="absolute top-5 right-5 rounded-full border border-border bg-white/90 p-2 text-slate-500 transition hover:text-slate-900">
          <X className="h-4 w-4" />
          <span className="sr-only">{t("common.close")}</span>
        </SheetClose>
      </Dialog.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-border p-6", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof Dialog.Title>) {
  return (
    <Dialog.Title
      className={cn("font-display text-2xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Description>) {
  return (
    <Dialog.Description
      className={cn("mt-2 text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger };
