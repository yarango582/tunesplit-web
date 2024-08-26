/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_TUNESPLIT_API_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

/* This TypeScript code is declaring an interface named `Window` with a property `webkitAudioContext`
of type `typeof AudioContext`. This interface declaration is extending the global `Window` interface
to add a new property `webkitAudioContext` which is expected to be of the same type as
`AudioContext`. This can be useful for type checking and ensuring that the `webkitAudioContext`
property exists on the `Window` object with the correct type when working with audio contexts in a
TypeScript project. */
interface Window {
    webkitAudioContext: typeof AudioContext
}