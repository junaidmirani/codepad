/**
 * themes.js
 * Custom CodeMirror 6 themes for Codepad.
 * Hand-tuned token colors with proper contrast ratios.
 */

import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

/* =============================================================
   DARK THEME — "Codepad Night"
   Base: GitHub Dark inspired but warmer
   ============================================================= */
const darkEditorTheme = EditorView.theme({
  '&': {
    color: '#e6edf3',
    backgroundColor: '#0d1117',
  },
  '.cm-content': {
    caretColor: '#58a6ff',
    padding: '8px 0',
  },
  '.cm-cursor': {
    borderLeftColor: '#58a6ff',
    borderLeftWidth: '2px',
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(88, 166, 255, 0.15)',
  },
  '.cm-focused .cm-matchingBracket': {
    backgroundColor: 'rgba(88, 166, 255, 0.2)',
    borderBottom: '1px solid rgba(88, 166, 255, 0.6)',
  },
  '.cm-gutters': {
    backgroundColor: '#0d1117',
    color: '#484f58',
    borderRight: '1px solid #21262d',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: '#8b949e',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 10px 0 6px',
    fontSize: '11px',
    lineHeight: '1.6',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#8b949e',
  },
  '.cm-tooltip': {
    backgroundColor: '#1c2128',
    border: '1px solid #30363d',
    borderRadius: '6px',
  },
  '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: 'rgba(88, 166, 255, 0.15)',
  },
  '.cm-panels': {
    backgroundColor: '#161b22',
    borderColor: '#21262d',
  },
  '.cm-searchMatch': {
    backgroundColor: 'rgba(240, 136, 62, 0.2)',
    outline: '1px solid rgba(240, 136, 62, 0.4)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(88, 166, 255, 0.3)',
  },
}, { dark: true })

const darkHighlightStyle = HighlightStyle.define([
  { tag: t.comment,            color: '#6e7681', fontStyle: 'italic' },
  { tag: t.lineComment,        color: '#6e7681', fontStyle: 'italic' },
  { tag: t.blockComment,       color: '#6e7681', fontStyle: 'italic' },
  { tag: t.docComment,         color: '#6e7681', fontStyle: 'italic' },

  { tag: t.keyword,            color: '#ff7b72' },
  { tag: t.controlKeyword,     color: '#ff7b72' },
  { tag: t.operatorKeyword,    color: '#ff7b72' },
  { tag: t.definitionKeyword,  color: '#ff7b72' },
  { tag: t.moduleKeyword,      color: '#ff7b72' },

  { tag: t.string,             color: '#a5d6ff' },
  { tag: t.special(t.string),  color: '#a5d6ff' },
  { tag: t.regexp,             color: '#a5d6ff' },

  { tag: t.number,             color: '#79c0ff' },
  { tag: t.bool,               color: '#79c0ff' },
  { tag: t.null,               color: '#79c0ff' },

  { tag: t.name,               color: '#e6edf3' },
  { tag: t.variableName,       color: '#e6edf3' },
  { tag: t.definition(t.variableName), color: '#ffa657' },
  { tag: t.local(t.variableName),      color: '#e6edf3' },

  { tag: t.function(t.variableName),   color: '#d2a8ff' },
  { tag: t.function(t.propertyName),   color: '#d2a8ff' },
  { tag: t.definition(t.function(t.variableName)), color: '#d2a8ff' },

  { tag: t.typeName,           color: '#79c0ff' },
  { tag: t.className,          color: '#ffa657' },
  { tag: t.typeOperator,       color: '#ff7b72' },
  { tag: t.namespace,          color: '#ffa657' },

  { tag: t.propertyName,       color: '#79c0ff' },
  { tag: t.attributeName,      color: '#7ee787' },
  { tag: t.attributeValue,     color: '#a5d6ff' },

  { tag: t.operator,           color: '#ff7b72' },
  { tag: t.punctuation,        color: '#8b949e' },
  { tag: t.bracket,            color: '#e6edf3' },

  { tag: t.tagName,            color: '#7ee787' },

  { tag: t.meta,               color: '#8b949e' },
  { tag: t.invalid,            color: '#f85149', textDecoration: 'underline' },

  { tag: t.heading,            color: '#58a6ff', fontWeight: 'bold' },
  { tag: t.strong,             fontWeight: 'bold' },
  { tag: t.emphasis,           fontStyle: 'italic' },
  { tag: t.link,               color: '#58a6ff', textDecoration: 'underline' },
  { tag: t.strikethrough,      textDecoration: 'line-through' },
])

export const darkTheme = [darkEditorTheme, syntaxHighlighting(darkHighlightStyle)]


/* =============================================================
   LIGHT THEME — "Codepad Day"
   Clean, high-contrast, easy on the eyes
   ============================================================= */
const lightEditorTheme = EditorView.theme({
  '&': {
    color: '#24292f',
    backgroundColor: '#ffffff',
  },
  '.cm-content': {
    caretColor: '#0969da',
    padding: '8px 0',
  },
  '.cm-cursor': {
    borderLeftColor: '#0969da',
    borderLeftWidth: '2px',
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(9, 105, 218, 0.1)',
  },
  '.cm-focused .cm-matchingBracket': {
    backgroundColor: 'rgba(9, 105, 218, 0.1)',
    borderBottom: '1px solid rgba(9, 105, 218, 0.4)',
  },
  '.cm-gutters': {
    backgroundColor: '#ffffff',
    color: '#9aa0a6',
    borderRight: '1px solid #d0d7de',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: '#656d76',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0, 0, 0, 0.025)',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 10px 0 6px',
    fontSize: '11px',
    lineHeight: '1.6',
  },
  '.cm-tooltip': {
    backgroundColor: '#ffffff',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
  },
  '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: 'rgba(9, 105, 218, 0.08)',
  },
  '.cm-panels': {
    backgroundColor: '#f6f8fa',
    borderColor: '#d0d7de',
  },
  '.cm-searchMatch': {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    outline: '1px solid rgba(255, 152, 0, 0.4)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(9, 105, 218, 0.2)',
  },
}, { dark: false })

const lightHighlightStyle = HighlightStyle.define([
  { tag: t.comment,            color: '#6e7781', fontStyle: 'italic' },
  { tag: t.lineComment,        color: '#6e7781', fontStyle: 'italic' },
  { tag: t.blockComment,       color: '#6e7781', fontStyle: 'italic' },
  { tag: t.docComment,         color: '#6e7781', fontStyle: 'italic' },

  { tag: t.keyword,            color: '#cf222e' },
  { tag: t.controlKeyword,     color: '#cf222e' },
  { tag: t.operatorKeyword,    color: '#cf222e' },
  { tag: t.definitionKeyword,  color: '#cf222e' },
  { tag: t.moduleKeyword,      color: '#cf222e' },

  { tag: t.string,             color: '#0a3069' },
  { tag: t.special(t.string),  color: '#0a3069' },
  { tag: t.regexp,             color: '#116329' },

  { tag: t.number,             color: '#0550ae' },
  { tag: t.bool,               color: '#0550ae' },
  { tag: t.null,               color: '#0550ae' },

  { tag: t.name,               color: '#24292f' },
  { tag: t.variableName,       color: '#24292f' },
  { tag: t.definition(t.variableName), color: '#953800' },
  { tag: t.local(t.variableName),      color: '#24292f' },

  { tag: t.function(t.variableName),   color: '#8250df' },
  { tag: t.function(t.propertyName),   color: '#8250df' },

  { tag: t.typeName,           color: '#0550ae' },
  { tag: t.className,          color: '#953800' },
  { tag: t.typeOperator,       color: '#cf222e' },
  { tag: t.namespace,          color: '#953800' },

  { tag: t.propertyName,       color: '#0550ae' },
  { tag: t.attributeName,      color: '#116329' },
  { tag: t.attributeValue,     color: '#0a3069' },

  { tag: t.operator,           color: '#cf222e' },
  { tag: t.punctuation,        color: '#57606a' },
  { tag: t.bracket,            color: '#24292f' },

  { tag: t.tagName,            color: '#116329' },

  { tag: t.meta,               color: '#6e7781' },
  { tag: t.invalid,            color: '#82071e', textDecoration: 'underline' },

  { tag: t.heading,            color: '#0550ae', fontWeight: 'bold' },
  { tag: t.strong,             fontWeight: 'bold' },
  { tag: t.emphasis,           fontStyle: 'italic' },
  { tag: t.link,               color: '#0550ae', textDecoration: 'underline' },
  { tag: t.strikethrough,      textDecoration: 'line-through' },
])

export const lightTheme = [lightEditorTheme, syntaxHighlighting(lightHighlightStyle)]
