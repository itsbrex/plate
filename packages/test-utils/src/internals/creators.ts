import {
  type Descendant,
  type Editor,
  type TElement,
  type TNode,
  type TRange,
  type TText,
  ElementApi,
  NodeApi,
  RangeApi,
  TextApi,
} from '@platejs/slate';

import {
  addAnchorToken,
  addFocusToken,
  AnchorToken,
  FocusToken,
  getAnchorOffset,
  getFocusOffset,
  Token,
} from './tokens';

/**
 * Resolve the descedants of a node by normalizing the children that can be
 * passed into a hyperscript creator function.
 */

const STRINGS = new WeakSet<TText>();

const resolveDescendants = (children: any[]): Descendant[] => {
  const nodes: Descendant[] = [];

  const addChild = (child: TNode | Token): void => {
    if (child == null) {
      return;
    }

    const prev = nodes.at(-1);

    if (typeof child === 'string') {
      const text = { text: child };
      STRINGS.add(text);
      child = text;
    }
    if (TextApi.isText(child)) {
      const c = child; // HACK: fix typescript complaining

      if (
        TextApi.isText(prev) &&
        STRINGS.has(prev) &&
        STRINGS.has(c) &&
        TextApi.equals(prev, c, { loose: true })
      ) {
        prev.text += c.text;
      } else {
        nodes.push(c);
      }
    } else if (ElementApi.isElement(child)) {
      nodes.push(child);
    } else if (child instanceof Token) {
      let n = nodes.at(-1);

      if (!TextApi.isText(n)) {
        addChild('');
        n = nodes.at(-1) as TText;
      }
      if (child instanceof AnchorToken) {
        addAnchorToken(n, child);
      } else if (child instanceof FocusToken) {
        addFocusToken(n, child);
      }
    } else {
      throw new TypeError(
        `Unexpected hyperscript child object: ${child as any}`
      );
    }
  };

  for (const child of children.flat(Number.POSITIVE_INFINITY)) {
    addChild(child);
  }

  return nodes;
};

/** Create an anchor token. */
export const createAnchor = (
  tagName: string,
  attributes: Record<string, any>
): AnchorToken => new AnchorToken(attributes);

/** Create an anchor and a focus token. */
export const createCursor = (
  tagName: string,
  attributes: Record<string, any>
): Token[] => [new AnchorToken(attributes), new FocusToken(attributes)];

/** Create an `TElement` object. */
export const createElement = (
  tagName: string,
  attributes: Record<string, any>,
  children: any[]
): TElement => ({
  ...(attributes as any),
  children: resolveDescendants(children),
});

/** Create a focus token. */
export const createFocus = (
  tagName: string,
  attributes: Record<string, any>
): FocusToken => new FocusToken(attributes);

/** Create a fragment. */
export const createFragment = (
  tagName: string,
  attributes: Record<string, any>,
  children: any[]
): Descendant[] => resolveDescendants(children);

/** Create a `Selection` object. */
export const createSelection = (
  tagName: string,
  attributes: Record<string, any>,
  children: any[]
): TRange => {
  const anchor: AnchorToken = children.find((c) => c instanceof AnchorToken)!;
  const focus: FocusToken = children.find((c) => c instanceof FocusToken)!;

  if (!anchor?.offset || !anchor.path) {
    throw new Error(
      `The <selection> hyperscript tag must have an <anchor> tag as a child with \`path\` and \`offset\` attributes defined.`
    );
  }
  if (!focus?.offset || !focus.path) {
    throw new Error(
      `The <selection> hyperscript tag must have a <focus> tag as a child with \`path\` and \`offset\` attributes defined.`
    );
  }

  return {
    anchor: {
      offset: anchor.offset,
      path: anchor.path,
    },
    focus: {
      offset: focus.offset,
      path: focus.path,
    },
    ...attributes,
  };
};

/** Create a `TText` object. */
export const createText = (
  tagName: string,
  attributes: Record<string, any>,
  children: any[]
): TText => {
  const nodes = resolveDescendants(children);

  if (nodes.length > 1) {
    throw new Error(
      `The <text> hyperscript tag must only contain a single node's worth of children.`
    );
  }

  let [node] = nodes;

  if (node == null) {
    node = { text: '' };
  }
  if (!TextApi.isText(node)) {
    throw new Error(`
    The <text> hyperscript tag can only contain text content as children.`);
  }

  // COMPAT: If they used the <text> tag we want to guarantee that it won't be
  // merge with other string children.
  STRINGS.delete(node);

  Object.assign(node, attributes);

  return node;
};

/** Create a top-level `Editor` object. */
export const createEditor =
  (makeEditor: () => Editor) =>
  (
    tagName: string,
    attributes: Record<string, any>,
    children: any[]
  ): Editor => {
    const otherChildren: any[] = [];
    let selectionChild: TRange | undefined;

    for (const child of children) {
      if (RangeApi.isRange(child)) {
        selectionChild = child;
      } else {
        otherChildren.push(child);
      }
    }

    const descendants = resolveDescendants(otherChildren) as TElement[];
    const selection: Partial<TRange> = {};
    const editor = makeEditor();
    Object.assign(editor, attributes);
    editor.children = descendants;

    // Search the document's texts to see if any of them have tokens associated
    // that need incorporated into the selection.
    for (const [node, path] of NodeApi.texts(editor)) {
      const anchor = getAnchorOffset(node);
      const focus = getFocusOffset(node);

      if (anchor != null) {
        const [offset] = anchor;
        selection.anchor = { offset, path };
      }
      if (focus != null) {
        const [offset] = focus;
        selection.focus = { offset, path };
      }
    }

    if (selection.anchor && !selection.focus) {
      throw new Error(
        `Slate hyperscript ranges must have both \`<anchor />\` and \`<focus />\` defined if one is defined, but you only defined \`<anchor />\`. For collapsed selections, use \`<cursor />\` instead.`
      );
    }
    if (!selection.anchor && selection.focus) {
      throw new Error(
        `Slate hyperscript ranges must have both \`<anchor />\` and \`<focus />\` defined if one is defined, but you only defined \`<focus />\`. For collapsed selections, use \`<cursor />\` instead.`
      );
    }
    if (selectionChild != null) {
      editor.selection = selectionChild;
    } else if (RangeApi.isRange(selection)) {
      editor.selection = selection;
    }

    return editor;
  };
