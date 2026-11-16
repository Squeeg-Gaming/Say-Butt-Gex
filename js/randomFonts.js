const fonts = [
    'Arial, sans-serif',
    'Georgia, serif',
    '"Courier New", monospace',
    'Verdana, sans-serif',
    '"Trebuchet MS", sans-serif',
    '"Comic Sans MS", cursive',
    'Impact, fantasy',
    '"Times New Roman", serif',
    '"Lucida Console", monospace',
    '"Palatino Linotype", serif',
    '"Lexend Deca", sans-serif',
];

const assignedElements = new WeakSet();

function randomizeElementFont(element) {
    if (!(element instanceof HTMLElement) || assignedElements.has(element)) {
        return;
    }

    const hasText = Array.from(element.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
    );
    const hasInputText =
        (element instanceof HTMLInputElement &&
            ![
                'checkbox',
                'color',
                'file',
                'hidden',
                'image',
                'radio',
                'range',
            ].includes(element.type) &&
            (element.value || element.placeholder)) ||
        (element instanceof HTMLTextAreaElement &&
            (element.value || element.placeholder));

    if (hasText || hasInputText) {
        element.style.fontFamily =
            fonts[Math.floor(Math.random() * fonts.length)];
        assignedElements.add(element);
    }
}

function randomizeTextFonts(root) {
    if (root instanceof Text) {
        randomizeElementFont(root.parentElement);
        return;
    }

    if (root instanceof HTMLElement) {
        randomizeElementFont(root);
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
        randomizeElementFont(node.parentElement);
    }

    if (root instanceof HTMLElement) {
        root.querySelectorAll('input, textarea').forEach(randomizeElementFont);
    }
}

export function enableRandomTextFonts() {
    randomizeTextFonts(document.body);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'characterData') {
                randomizeElementFont(mutation.target.parentElement);
                return;
            }

            mutation.addedNodes.forEach(randomizeTextFonts);
        });
    });

    observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true,
    });
}
