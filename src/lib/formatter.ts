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

  // Replace bullet points (lines starting with "- ") with bullet character
  const lines = safeText.split("\n");
  const processedLines = lines.map(line => {
    // Check if line starts with "- "
    if (line.trim().startsWith("- ")) {
      const indent = line.match(/^(\s*)/)?.[1] || "";
      const content = line.trim().substring(2);
      return `${indent}• ${content}`;
    }
    return line;
  });

  return processedLines.join("<br />");
}
