"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

interface Props {
  html: string;
  className?: string;
}

export function SafeHtmlRenderer({ html, className = "" }: Props) {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          "p", "br", "strong", "em", "u", "s", "a", "img", "ul", "ol", "li",
          "h1", "h2", "h3", "h4", "h5", "h6",
          "table", "thead", "tbody", "tr", "th", "td",
          "blockquote", "pre", "code", "span", "div", "hr",
          "font", "b", "i", "center", "sub", "sup",
        ],
        ALLOWED_ATTR: [
          "href", "src", "alt", "style", "class", "target",
          "width", "height", "cellpadding", "cellspacing", "border",
          "bgcolor", "color", "face", "size", "align", "valign",
        ],
        ALLOW_DATA_ATTR: false,
      }),
    [html],
  );

  return (
    <div
      className={`prose prose-sm max-w-none prose-a:text-blue-600 break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
