export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown
    // Headers
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-8 first:mt-0">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2 mt-4">$1</h3>')
    
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-[var(--dash-text)]">$1</strong>')
    
    // Italic (avoiding conflict with bullet points)
    .replace(/(?<!^[\*\s])\*(?![\*\s])(.*?)\*(?![\*])/gim, '<em class="italic">$1</em>')
    
    // Task lists (custom for [ ] and [x])
    .replace(/^[ \t]*- \[ \] (.*$)/gim, '<li class="ml-4 list-none flex items-start gap-2 mb-2"><span class="inline-block mt-1 w-4 h-4 rounded border border-gray-300 flex-shrink-0 bg-white"></span> <span>$1</span></li>')
    .replace(/^[ \t]*- \[x\] (.*$)/gim, '<li class="ml-4 list-none flex items-start gap-2 mb-2"><span class="inline-block mt-1 w-4 h-4 rounded bg-indigo-500 border border-indigo-500 flex items-center justify-center flex-shrink-0 text-white"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span class="line-through text-gray-400">$1</span></li>')
    
    // Unordered Lists (* or -) - supporting leading whitespace
    .replace(/^[ \t]*[\*\-] (.*$)/gim, '<li class="ml-6 list-disc mb-1">$1</li>')
    
    // Numbered Lists (1.) - supporting leading whitespace
    .replace(/^[ \t]*\d+\. (.*$)/gim, '<li class="ml-6 list-decimal mb-1 font-semibold text-[var(--dash-text)]">$1</li>')
    
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-indigo-600 hover:underline font-medium" target="_blank">$1</a>');

  // Process line by line for paragraphs and list wrapping
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('<li')) {
      if (!inList) {
        const isDecimal = trimmed.includes('list-decimal');
        processedLines.push(`<ul class="mb-4 space-y-1 ${isDecimal ? '' : 'list-none'}">`);
        inList = true;
      }
      processedLines.push(line);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      
      if (!trimmed) {
        processedLines.push('<div class="h-4"></div>');
      } else if (trimmed.startsWith('<h')) {
        processedLines.push(line);
      } else {
        processedLines.push(`<p class="mb-4 leading-relaxed text-[var(--dash-text)] text-sm md:text-base">${line}</p>`);
      }
    }
  }

  if (inList) processedLines.push('</ul>');

  return processedLines.join('\n');
}
