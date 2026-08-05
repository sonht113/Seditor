---
"seditor-core": minor
"seditor-react": minor
---

react: keep the editor instance alive when autoFocus toggles; report value/valueFormat mismatches and editable transitions via onError/onEditableChange instead of crashing or firing on mount; flush debounced onChange on unmount. core: setJSON + onError config.
