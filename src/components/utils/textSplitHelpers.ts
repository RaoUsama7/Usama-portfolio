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

