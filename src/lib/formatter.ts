export function parseFormattedText(text: string): string {
  if (!text) return "";

  // Replace HTML tag characters to prevent arbitrary script execution
  let safeText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Re-allow <u> tags since we specifically support them
  safeText = safeText.replace(/&lt;u&gt;/g, "<u>").replace(/&lt;\/u&gt;/g, "</u>");

  // Bold (**text** or __text__)
  safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic (*text* or _text_)
  safeText = safeText.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Parse Lists (bullet and numbered) line by line
  const lines = safeText.split("\n");
  let inUnorderedList = false;
  let inOrderedList = false;
  const parsedLines: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();
    
    // Bullet list match (e.g. "- Poin")
    if (trimmed.startsWith("- ")) {
      if (inOrderedList) {
        parsedLines.push("</ol>");
        inOrderedList = false;
      }
      if (!inUnorderedList) {
        parsedLines.push('<ul class="list-disc pl-5 space-y-1.5 my-1.5">');
        inUnorderedList = true;
      }
      parsedLines.push(`<li>${trimmed.substring(2)}</li>`);
      continue;
    }
    
    // Numbered list match (e.g. "1. Poin")
    const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      if (inUnorderedList) {
        parsedLines.push("</ul>");
        inUnorderedList = false;
      }
      if (!inOrderedList) {
        parsedLines.push('<ol class="list-decimal pl-5 space-y-1.5 my-1.5">');
        inOrderedList = true;
      }
      parsedLines.push(`<li>${numMatch[2]}</li>`);
      continue;
    }

    // Regular line
    if (inUnorderedList) {
      parsedLines.push("</ul>");
      inUnorderedList = false;
    }
    if (inOrderedList) {
      parsedLines.push("</ol>");
      inOrderedList = false;
    }
    
    parsedLines.push(line);
  }

  if (inUnorderedList) parsedLines.push("</ul>");
  if (inOrderedList) parsedLines.push("</ol>");

  return parsedLines.join("\n").replace(/\n/g, "<br />");
}
