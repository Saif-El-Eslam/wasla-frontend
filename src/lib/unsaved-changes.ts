export const unsavedChangesSelector = '[data-unsaved-changes="true"]';

export function hasUnsavedChanges() {
  return typeof document !== 'undefined' && Boolean(document.querySelector(unsavedChangesSelector));
}

export function confirmDiscardChanges(message: string) {
  return !hasUnsavedChanges() || window.confirm(message);
}
