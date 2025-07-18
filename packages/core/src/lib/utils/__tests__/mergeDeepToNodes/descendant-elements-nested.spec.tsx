/** @jsx jsxt */

import { ListItemPlugin } from '@platejs/list-classic/react';
import { jsxt } from '@platejs/test-utils';
import { NodeApi } from '@platejs/slate';

import { BaseParagraphPlugin } from '../../../plugins';
import { mergeDeepToNodes } from '../../../utils';

jsxt;

const node = (
  <hli>
    test
    <hp>test</hp>test
  </hli>
) as any;

const props = { a: 1 };

const output = (
  <element a={1} type={ListItemPlugin.key}>
    <htext a={1}>test</htext>
    <element a={1} type={BaseParagraphPlugin.key}>
      <htext a={1}>test</htext>
    </element>
    <htext a={1}>test</htext>
  </element>
) as any;

it('should set props to all descendants', () => {
  mergeDeepToNodes({
    node,
    query: {
      filter: ([n]) => NodeApi.isDescendant(n),
    },
    source: props,
  });
  expect(node).toEqual(output);
});
