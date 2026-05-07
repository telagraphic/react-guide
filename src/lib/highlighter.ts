/**
 * Shiki highlighter — singleton, lazy.
 *
 * We use the synchronous "core" entry point and hand-pick the languages
 * and themes we actually need. The JavaScript regex engine is plenty for
 * this set of languages and avoids shipping the WASM Oniguruma payload.
 */

import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import dracula from 'shiki/themes/dracula.mjs';
import githubLight from 'shiki/themes/github-light.mjs';

import jsLang from 'shiki/langs/javascript.mjs';
import tsLang from 'shiki/langs/typescript.mjs';
import jsxLang from 'shiki/langs/jsx.mjs';
import tsxLang from 'shiki/langs/tsx.mjs';
import htmlLang from 'shiki/langs/html.mjs';
import cssLang from 'shiki/langs/css.mjs';
import bashLang from 'shiki/langs/bash.mjs';
import jsonLang from 'shiki/langs/json.mjs';
import mdLang from 'shiki/langs/markdown.mjs';

const highlighter = createHighlighterCoreSync({
  themes: [dracula, githubLight],
  langs: [jsLang, tsLang, jsxLang, tsxLang, htmlLang, cssLang, bashLang, jsonLang, mdLang],
  engine: createJavaScriptRegexEngine(),
});

const SUPPORTED_LANGS = new Set([
  'js',
  'javascript',
  'ts',
  'typescript',
  'jsx',
  'tsx',
  'html',
  'css',
  'bash',
  'sh',
  'shell',
  'json',
  'md',
  'markdown',
]);

export function highlight(code: string, lang: string | undefined, isDark: boolean): string {
  const language =
    lang && SUPPORTED_LANGS.has(lang.toLowerCase()) ? lang.toLowerCase() : 'plaintext';
  return highlighter.codeToHtml(code, {
    lang: language,
    theme: isDark ? 'dracula' : 'github-light',
  });
}
