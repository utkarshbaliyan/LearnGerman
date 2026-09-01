"use client";

import { MousePointer2 } from "lucide-react";

import { cleanWord, meaningFor } from "@/app/curriculum";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function TranslatedWord({ token }: { token: string }) {
  const word = cleanWord(token);
  const isNumber = /\d/.test(token);
  if (!word && !isNumber) return <>{token}</>;

  const meaning = meaningFor(token);
  if (!meaning) return <span className="story-word no-gloss">{token}</span>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="story-word" aria-label={`${word}: ${meaning}`}>
          {token}
        </button>
      </TooltipTrigger>
      <TooltipContent
        className="story-word-gloss"
        side="top"
        sideOffset={10}
        collisionPadding={12}
      >
        <span lang="de">{word}</span>
        <strong lang="en">{meaning}</strong>
      </TooltipContent>
    </Tooltip>
  );
}

function TranslatedParagraph({ text }: { text: string }) {
  return text.split(/(\s+)/).map((token, index) => {
    if (/^\s+$/.test(token)) return <span key={index}>{token}</span>;
    return <TranslatedWord key={index} token={token} />;
  });
}

export function TranslatedStoryText({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={120} skipDelayDuration={80}>
      <div className="chapter-word-help">
        <MousePointer2 />
        <span>Hover, tap, or focus an underlined word to see its English meaning.</span>
      </div>
      <div className="chapter-story-copy">
        {text.split(/\n\n/).map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>
            <TranslatedParagraph text={paragraph} />
          </p>
        ))}
      </div>
    </TooltipProvider>
  );
}
