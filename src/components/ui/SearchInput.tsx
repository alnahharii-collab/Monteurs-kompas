'use client';

import { Search, X } from 'lucide-react';
import { forwardRef } from 'react';

export const SearchInput = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
    autoFocus?: boolean;
    onSubmit?: () => void;
  }
>(function SearchInput({ value, onChange, placeholder, label, autoFocus, onSubmit }, ref) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="flex h-choice items-center gap-2 rounded-md border-2 border-line-strong bg-panel pl-4 transition-colors duration-(--duration-fast) focus-within:border-primary"
    >
      <Search aria-hidden size={22} className="shrink-0 text-ink-3" />
      <label className="sr-only" htmlFor="search">
        {label}
      </label>
      <input
        ref={ref}
        id="search"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Zoekveld leegmaken"
          className="flex size-touch shrink-0 items-center justify-center text-ink-3 active:text-ink"
        >
          <X aria-hidden size={20} />
        </button>
      ) : null}
    </form>
  );
});
