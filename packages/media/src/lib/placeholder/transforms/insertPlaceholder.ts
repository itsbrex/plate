import type {
  InsertNodesOptions,
  SlateEditor,
  TPlaceholderElement,
} from 'platejs';

import { KEYS } from 'platejs';

export const insertPlaceholder = (
  editor: SlateEditor,
  mediaType: string,
  options?: InsertNodesOptions
) => {
  editor.tf.withoutNormalizing(() =>
    editor.tf.insertNodes<TPlaceholderElement>(
      {
        children: [{ text: '' }],
        mediaType,
        type: editor.getType(KEYS.placeholder),
      },
      options as any
    )
  );
};

export const insertImagePlaceholder = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => insertPlaceholder(editor, KEYS.img, options);

export const insertVideoPlaceholder = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => insertPlaceholder(editor, KEYS.video, options);

export const insertAudioPlaceholder = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => insertPlaceholder(editor, KEYS.audio, options);

export const insertFilePlaceholder = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => insertPlaceholder(editor, KEYS.file, options);
