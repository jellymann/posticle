import {
  matchUrlTemplate,
  findMatchingRoute
} from '../../src/renderer/javascripts/urlTemplate';

describe('urlTemplate', () => {
  describe('matchUrlTemplate', () => {
    it('matches empty url', () => {
      expect(matchUrlTemplate('', '')).toBeTruthy();
    });

    it('matches basic url', () => {
      expect(matchUrlTemplate('foo', 'foo')).toBeTruthy();
    });

    it('matches multi-part url', () => {
      expect(matchUrlTemplate('foo/bar', 'foo/bar')).toBeTruthy();
    });

    it('matches url with params', () => {
      let result = matchUrlTemplate('foo/asdf/baz/qwer', 'foo/:bar/baz/:qux');
      expect(result).toBeTruthy();
      expect(result.bar).toBe('asdf');
      expect(result.qux).toBe('qwer');
    });

    it('rejects url with wrong number of parts', () => {
      expect(matchUrlTemplate('foo/bar', 'foo/bar/baz')).toBeFalsy();
      expect(matchUrlTemplate('foo/bar/baz', 'foo/bar')).toBeFalsy();
      expect(matchUrlTemplate('foo/asdf/baz', 'foo/:bar')).toBeFalsy();
    });

    it('rejects url with mismatched part', () => {
      expect(matchUrlTemplate('foo/baz', 'foo/bar')).toBeFalsy();
      expect(matchUrlTemplate('foo/asdf/wat', 'foo/:bar/baz')).toBeFalsy();
    });
  });

  describe('findMatchingRoute', () => {
    const routes = {
      '': 'EMPTY',
      'foo': 'ONE',
      'foo/bar': 'MULTI',
      'foo/:id/bar/:thing': 'PARAMS'
    }

    it('returns the matching route and params', () => {
      expect(findMatchingRoute('', routes)).toStrictEqual(['EMPTY', {}]);
      expect(findMatchingRoute('foo', routes)).toStrictEqual(['ONE', {}]);
      expect(findMatchingRoute('foo/bar', routes)).toStrictEqual(['MULTI', {}]);
      expect(findMatchingRoute('foo/42/bar/99', routes)).toStrictEqual(['PARAMS', { id: '42', thing: '99' }]);
    });

    it('returns null if not route is found', () => {
      expect(findMatchingRoute('not/a/route')).toStrictEqual([null, {}])
    });
  });
});
