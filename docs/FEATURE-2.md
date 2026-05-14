# React implemented as vanilla javascript to learn how react works

## overview

I want to "recreate" react with vanilla javascript to better understand the use cases and implementations for each core concept and component that react solves. Let's start with these react basics and create a straightforward implementation in vanilla js to teach the basics of how it's done by scratch.

React core concepts to implement:

- useState
- useEffect
- useRef
- createContext
- useReducer
- useMemo/useCallback
- useSyncExternalStore
- useLayoutEffect
- useEffectEvent
- A custom hook


## details


Structure each react feature as a lesson that steps through the code progressively, instead of simply providing the code. Start with a shell or skeleton of the implementation, then progressively add more code in a series of steps to show the vanilla implementation could be structured. At the top of each lesson section, provide a checklist of the details of what the react concept does to review the react feature to implement. Then breakdown that feature component into smaller details that need to be implemented, almost like a recipe to check off as we go along. Label each code step with a number to visually alert the reader the process flow.

Provide an analysis of possible design pattern or code approach to implement that could be used. The idea is to get me to think about the code and architectural approaches that are being used behind the scenes. 

At the end of each feature lesson, provide the full solution. It would be ideal if all these vanilla components worked together to mock how react works.


## questions

We should answer these questions before starting.

0. is my plan above an effective way of learning the workings of react?
1. should we use a class based approach or a module that returns functions?
2. can we feasibly show these concepts with vanilla javascript at basic to medium level of implementation?
3. can we actually then take all of our implementations and create a fully working vanilla "reacty" app that is not a super mess of code to use?
4. do you see any other problems or challenges that we should identify before proceeding?

## Project plan (agreed scope)

Decisions and implementation details (render vs commit, effect flushing, scheduler / paint notes, core vs appendix hooks, phased slice folders + `mini-react/`, todo capstone, “breaks for learning”) live in:

**[src/content/05-vanilla-react/REQUIREMENTS.md](../src/content/05-vanilla-react/REQUIREMENTS.md)**

In the dev app, Lesson 01 also mounts at **`/labs/vanilla-react/lesson-01`** (see `VanillaReactLesson01.tsx`).
