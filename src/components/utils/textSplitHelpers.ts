export function wrapChars(selector: string | Element | Element[]): HTMLElement[] {
  const elements: Element[] = [];

  if (typeof selector === "string") {
    elements.push(...Array.from(document.querySelectorAll(selector)));
  } else if (selector instanceof Element) {
    elements.push(selector);
  } else {
    elements.push(...selector);
  }

  const chars: HTMLElement[] = [];

  elements.forEach((el) => {
    const node = el as HTMLElement;
    const text = node.textContent ?? "";
    node.textContent = "";

    text.split("").forEach((ch) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.style.display = "inline-block";
      node.appendChild(span);
      chars.push(span);
    });
  });

  return chars;
}

export function wrapWords(element: HTMLElement): HTMLElement[] {
  const node = element;
  const text = node.textContent ?? "";
  node.textContent = "";

  const wordSpans: HTMLElement[] = [];
  const parts = text.split(/(\s+)/); // keep spaces as separate parts

  parts.forEach((part) => {
    if (part.trim() === "") {
      // pure whitespace, keep as normal text so spacing is preserved
      node.appendChild(document.createTextNode(part));
    } else {
      const span = document.createElement("span");
      span.textContent = part;
      span.style.display = "inline-block";
      node.appendChild(span);
      wordSpans.push(span);
    }
  });

  return wordSpans;
}

