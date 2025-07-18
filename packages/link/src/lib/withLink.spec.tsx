/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createEditor } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BaseLinkPlugin } from './BaseLinkPlugin';

jsxt;

/**
 * TODO: test react: https://github.com/udecode/editor-protocol/issues/44
 * https://github.com/udecode/editor-protocol/issues/45
 * https://github.com/udecode/editor-protocol/issues/49
 * https://github.com/udecode/editor-protocol/issues/51
 * https://github.com/udecode/editor-protocol/issues/54
 * https://github.com/udecode/editor-protocol/issues/55
 * https://github.com/udecode/editor-protocol/issues/57
 * https://github.com/udecode/editor-protocol/issues/61
 *
 * SubmitFloatingLink: https://github.com/udecode/editor-protocol/issues/48
 *
 * Selection: https://github.com/udecode/editor-protocol/issues/52
 * https://github.com/udecode/editor-protocol/issues/53
 *
 * UnwrapLink https://github.com/udecode/editor-protocol/issues/56
 */

const url = 'http://google.com';

const createTestEditor = (editor: any) =>
  createPlateEditor({
    editor,
    plugins: [BaseLinkPlugin],
  });

describe('withLink', () => {
  describe('insertData', () => {
    describe('when inserting url text', () => {
      // https://github.com/udecode/editor-protocol/issues/34
      describe('when in a paragraph', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                test
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        const data: any = { getData: () => 'http://google.com' };

        const output = (
          <editor>
            <hp>
              test
              <ha url="http://google.com">http://google.com</ha>
              <htext />
            </hp>
          </editor>
        ) as any;

        it('should insert link', () => {
          const editor = createTestEditor(input);

          editor.tf.insertData(data);

          expect(editor.children).toEqual(output.children);
        });
      });

      // https://github.com/udecode/editor-protocol/issues/36
      describe('when only one edge in a link', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                test{' '}
                <ha url="http://google.com">
                  please
                  <anchor />
                  click
                </ha>{' '}
                here
                <focus />.
              </hp>
            </editor>
          ) as any
        );

        const data: any = { getData: () => 'http://google.com/test' };

        const output = (
          <editor>
            <hp>
              test <ha url="http://google.com">please</ha>
              <htext />
              <ha url="http://google.com/test">click here</ha>.
            </hp>
          </editor>
        ) as any;

        it('should insert link', () => {
          jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>docs</fragment>);

          const editor = createTestEditor(input);

          editor.tf.insertData(data);

          expect(editor.children).toEqual(output.children);
        });
      });

      // https://github.com/udecode/editor-protocol/issues/37
      describe('when selection contains a link without the edges inside', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                insert <anchor />
                link <ha url={url}>here</ha>
                <focus />.
              </hp>
            </editor>
          ) as any
        );

        const urlOutput = 'http://output.com';

        const output = (
          <editor>
            <hp>
              insert <ha url={urlOutput}>link here</ha>.
            </hp>
          </editor>
        ) as any;

        it('should delete and insert link', () => {
          const editor = createTestEditor(input);

          const data: any = { getData: () => urlOutput };
          editor.tf.insertData(data);

          expect(editor.children).toEqual(output.children);
        });
      });
    });

    describe('when inserting non-url text', () => {
      // https://github.com/udecode/editor-protocol/issues/38
      describe('when in a link', () => {
        it('should run default insertText', () => {
          const input = createEditor(
            (
              <editor>
                <hp>
                  test
                  <ha url="http://google.com">
                    http://
                    <cursor />
                    google.com
                  </ha>
                  <htext />
                </hp>
              </editor>
            ) as any
          );

          const data: any = { getData: () => 'docs' };

          const output = (
            <editor>
              <hp>
                test
                <ha url="http://google.com">http://docsgoogle.com</ha>
                <htext />
              </hp>
            </editor>
          ) as any;

          jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>docs</fragment>);

          const editor = createTestEditor(input);

          editor.tf.insertData(data);

          expect(editor.children).toEqual(output.children);
        });
      });
    });

    describe('when inserting space', () => {
      // https://github.com/udecode/editor-protocol/issues/41
      describe('when after link', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                link: <ha url="http://google.com">http://google.com</ha>
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        const text = ' ';

        const output = (
          <editor>
            <hp>
              link: <ha url="http://google.com">http://google.com</ha>{' '}
            </hp>
          </editor>
        ) as any;

        it('should insert text', () => {
          const editor = createTestEditor(input);

          editor.tf.insertText(text);

          expect(editor.children).toEqual(output.children);
        });
      });

      // https://github.com/udecode/editor-protocol/issues/40
      describe('when after non-url text', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                google.com
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        const text = ' ';

        const output = (
          <editor>
            <hp>google.com </hp>
          </editor>
        ) as any;

        it('should insert text', () => {
          const editor = createTestEditor(input);

          editor.tf.insertText(text);

          expect(editor.children).toEqual(output.children);
        });
      });

      // https://github.com/udecode/editor-protocol/issues/39
      describe('when after url text', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                link: http://google.com
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        const text = ' ';

        const output = (
          <editor>
            <hp>
              link: <ha url="http://google.com">http://google.com</ha>{' '}
            </hp>
          </editor>
        ) as any;

        it('should wrap the url with a link', () => {
          const editor = createTestEditor(input);

          editor.tf.insertText(text);

          expect(editor.children).toEqual(output.children);
        });
      });

      describe('when cursor is after link in next block', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                link: <ha url="http://google.com">http://google.com</ha>
              </hp>
              <hp>
                test
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        const text = ' ';

        const output = (
          <editor>
            <hp>
              link: <ha url="http://google.com">http://google.com</ha>
            </hp>
            <hp>
              {'test '}
              {/* keep above as string in quotes to force trailing space */}
              <cursor />
            </hp>
          </editor>
        ) as any;

        it('should run default insertText', () => {
          const editor = createTestEditor(input);

          editor.tf.insertText(text);

          expect(editor.children).toEqual(output.children);
        });
      });

      describe('when creating new block', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                http://google.com
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        const output = (
          <editor>
            <hp>
              <htext />
              <ha url="http://google.com">http://google.com</ha>
              <htext />
            </hp>
            <hp>
              <cursor />
            </hp>
          </editor>
        ) as any;

        it('should wrap the url with a link ha', () => {
          const editor = createTestEditor(input);

          editor.tf.insertBreak();

          expect(editor.children).toEqual(output.children);
        });
      });

      // https://github.com/udecode/editor-protocol/issues/42
      describe('when after url at start of block', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                http://google.com
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        const text = ' ';

        const output = (
          <editor>
            <hp>
              <htext />
              <ha url="http://google.com">http://google.com</ha>{' '}
            </hp>
          </editor>
        ) as any;

        it('should wrap the url with a link ha', () => {
          const editor = createTestEditor(input);

          editor.tf.insertText(text);

          expect(editor.children).toEqual(output.children);
        });
      });

      describe('when getUrlHref', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                google.com
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        const text = ' ';

        const output = (
          <editor>
            <hp>
              <htext />
              <ha url="http://google.com">google.com</ha>{' '}
            </hp>
          </editor>
        ) as any;

        it('should insert link', () => {
          const editor = createPlateEditor({
            plugins: [
              BaseLinkPlugin.configure({
                options: {
                  getUrlHref: (_url) => {
                    return 'http://google.com';
                  },
                },
              }),
            ],
            selection: input.selection,
            value: input.children,
          });

          editor.tf.insertText(text);

          expect(editor.children).toEqual(output.children);
        });
      });
    });

    // https://github.com/udecode/editor-protocol/issues/62
    describe('when url with bold mark', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              link: http://<htext bold>google</htext>.com
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      const text = ' ';

      const output = (
        <editor>
          <hp>
            link:{' '}
            <ha url="http://google.com">
              http://<htext bold>google</htext>.com
            </ha>{' '}
          </hp>
        </editor>
      ) as any;

      it('should wrap the url with a link', () => {
        const editor = createTestEditor(input);

        editor.tf.insertText(text);

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('pasting a link keeps the selected text but turns it into a link', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              start <anchor />
              of regular text
              <focus />
            </hp>
          </editor>
        ) as any
      );

      const data: any = { getData: () => 'https://google.com' };

      const output = (
        <editor>
          <hp>
            start <ha url="https://google.com">of regular text</ha>
            <htext />
          </hp>
        </editor>
      ) as any;

      it('should insert link', () => {
        const editor = createTestEditor(input);

        editor.tf.insertData(data);

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('pasting a link do not keep the selected text and turns it into a link', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              start <anchor />
              of regular text
              <focus />
            </hp>
          </editor>
        ) as any
      );

      const data: any = { getData: () => 'https://google.com' };

      const output = (
        <editor>
          <hp>
            start <ha url="https://google.com">https://google.com</ha>
            <htext />
          </hp>
        </editor>
      ) as any;

      it('should insert link', () => {
        const createModifiedEditor = (editor: any) =>
          createPlateEditor({
            editor,
            plugins: [
              BaseLinkPlugin.configure({
                options: { keepSelectedTextOnPaste: false },
              }),
            ],
          });
        const editor = createModifiedEditor(input);

        editor.tf.insertData(data);

        expect(editor.children).toEqual(output.children);
      });
    });
  });

  describe('withRemoveEmptyNodes', () => {
    describe('when link becomes empty', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              Before <ha url="http://example.com">link text</ha> after
            </hp>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>Before {` `}after</hp>
        </editor>
      ) as any;

      it('should remove the empty link node', () => {
        const editor = createTestEditor(input);

        // Select the entire link text
        editor.tf.select({
          anchor: { offset: 0, path: [0, 1, 0] },
          focus: { offset: 9, path: [0, 1, 0] },
        });

        // Delete the selected text
        editor.tf.deleteFragment();

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when link becomes empty but contains zero-width space', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              Before <ha url="http://example.com">link text</ha> after
            </hp>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            Before <ha url="http://example.com">{'\u200B'}</ha> after
          </hp>
        </editor>
      ) as any;

      it('should not remove the link node', () => {
        const editor = createTestEditor(input);

        // Select the entire link text
        editor.tf.select({
          anchor: { offset: 0, path: [0, 1, 0] },
          focus: { offset: 9, path: [0, 1, 0] },
        });

        // Replace the selected text with a zero-width space
        editor.tf.insertText('\u200B');

        // Trigger normalization
        editor.tf.normalize();

        expect(editor.children).toEqual(output.children);
      });
    });
  });
});
