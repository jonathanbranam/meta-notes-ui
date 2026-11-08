import { Fragment } from "react";
import { inlineSegments, type RenderContext } from "./markdown";

/** One line of text with its wiki links and URLs as links; a wiki link opens its note in the app. */
export function Inline({ text, ctx, open }: { text: string; ctx: RenderContext; open: (p: string) => void }) {
  return (
    <>
      {inlineSegments(text, ctx).map((s, i) => {
        const node = s.url ? (
          <a href={s.url} target="_blank" rel="noopener noreferrer">{s.text}</a>
        ) : s.href ? (
          <a href={s.href} className="wikilink" onClick={() => open(decodeURIComponent(s.href!.slice(1).split("#")[0]))}>{s.text}</a>
        ) : s.missing ? (
          <span className="wikilink missing" title="No such note">{s.text}</span>
        ) : (
          s.text
        );
        return s.struck ? <del key={i}>{node}</del> : <Fragment key={i}>{node}</Fragment>;
      })}
    </>
  );
}
