"use client";

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      className="mt-2 rounded-full bg-[#FF7F3B] px-3 py-1 text-sm text-black"
      onClick={() => navigator.clipboard.writeText(text || "")}
    >
      Копировать
    </button>
  );
}
