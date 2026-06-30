import { useLayoutEffect, useRef, useState } from "react";

import type { Suggestion } from "../autocomplete/types";
import type { SuggestionResultStatus } from "../autocomplete/AutocompleteService";

export interface PopupPosition {
  anchorTop: number;
  anchorBottom: number;
  top: number;
  left: number;
}

interface SuggestionPopupProps {
  suggestions: Suggestion[];
  selectedIndex: number;
  status: SuggestionResultStatus;
  position: PopupPosition;
  visible: boolean;
}

export function SuggestionPopup({
  suggestions,
  selectedIndex,
  status,
  position,
  visible,
}: SuggestionPopupProps) {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [resolvedPosition, setResolvedPosition] = useState(position);

  useLayoutEffect(() => {
    if (!visible || !popupRef.current) {
      return;
    }

    const viewportPadding = 16;
    const popupGap = 8;
    const popupRect = popupRef.current.getBoundingClientRect();
    const maxTop = window.innerHeight - viewportPadding - popupRect.height;
    const maxLeft = window.innerWidth - viewportPadding - popupRect.width;
    const topBelow = position.anchorBottom + popupGap;
    const canFitBelow =
      topBelow + popupRect.height <= window.innerHeight - viewportPadding;
    const topAbove = position.anchorTop - popupGap - popupRect.height;
    const canFitAbove = topAbove >= viewportPadding;
    const nextTop =
      canFitBelow || !canFitAbove
        ? Math.min(Math.max(topBelow, viewportPadding), maxTop)
        : topAbove;
    const nextLeft = Math.min(
      Math.max(position.left, viewportPadding),
      Math.max(viewportPadding, maxLeft),
    );

    setResolvedPosition({
      ...position,
      top: nextTop,
      left: nextLeft,
    });
  }, [position, suggestions.length, status, visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={popupRef}
      className="suggestion-popup"
      style={{
        top: resolvedPosition.top,
        left: resolvedPosition.left,
      }}
      role="listbox"
      aria-label="Подсказки автодополнения"
    >
      {suggestions.length === 0 ? (
        <div className="suggestion-empty">
          {status === "error" ? "Provider error" : "No suggestions"}
        </div>
      ) : (
        <ul className="suggestion-list">
          {suggestions.map((suggestion, index) => (
            <li
              className={`suggestion-item${index === selectedIndex ? " is-selected" : ""}`}
              key={suggestion.id}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <span>{suggestion.text}</span>
              <span className="suggestion-kind">{suggestion.kind}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
