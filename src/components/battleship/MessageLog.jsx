import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function MessageLog({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="bg-card/50 border border-border/40 rounded-lg overflow-hidden">
      <div className="px-3 py-1.5 bg-muted/30 border-b border-border/30">
        <span className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground">
          Registro de batalla
        </span>
      </div>
      <ScrollArea className="h-28 sm:h-32">
        <div className="p-2 space-y-0.5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'text-xs py-0.5 px-1.5 rounded',
                msg.type === 'hit' && 'text-red-400',
                msg.type === 'miss' && 'text-blue-400',
                msg.type === 'sunk' && 'text-orange-400 font-semibold',
                msg.type === 'info' && 'text-muted-foreground',
                msg.type === 'system' && 'text-accent',
                msg.type === 'error' && 'text-destructive',
              )}
            >
              <span className="text-muted-foreground/60 mr-1 text-[10px] font-mono">
                {String(i + 1).padStart(2, '0')}
              </span>
              {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}