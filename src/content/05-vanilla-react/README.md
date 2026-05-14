# Vanilla React (learning track)

This folder holds the **teaching-first** vanilla JavaScript lessons and, in a later phase, a small **TSX** “mini runtime” that wires the same ideas together. It lives under `src/content/` next to the rest of the guide content so lesson demos can be mounted from the Vite app without importing real React into the lesson kernels.

- **Requirements, concepts, and build plan:** [REQUIREMENTS.md](./REQUIREMENTS.md)
- **Phase 1 (slices):** [01 useState](./01-instance-and-useState/LESSON.md) · [02 useEffect](./02-use-effect/LESSON.md) · [03 useRef](./03-use-ref/LESSON.md) · [04 createContext](./04-create-context/LESSON.md) · [05 useReducer](./05-use-reducer/LESSON.md) · [06 useMemo/useCallback](./06-use-memo-callback/LESSON.md) · [07 useSyncExternalStore](./07-use-sync-external-store/LESSON.md) · [08 useLayoutEffect](./08-use-layout-effect/LESSON.md) · [09 useEffectEvent](./09-use-effect-event/LESSON.md) · [10 custom hook](./10-custom-hook/LESSON.md)
- **Phase 2:** [`mini-react/`](./mini-react/README.md) — coherent kernel in TSX + todo demo.
- **In-app demos:** **`/labs/vanilla-react/lesson-01`** through **`lesson-10`** (`VanillaReactLesson01.tsx` … `VanillaReactLesson10.tsx`; lessons **05–10** use [`VanillaReactLabShell.tsx`](../../app/routes/VanillaReactLabShell.tsx)).

See REQUIREMENTS.md for definitions (“render then flush effects,” scheduler phases, paint timing), non-goals, and the hook scope split (core vs appendix).
