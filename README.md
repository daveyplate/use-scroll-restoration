# NextJS Scroll Restoration

This package enables custom Scroll Restoration for NextJS Pages Router.
You may supply a delay if you need to refetch data that isn't immediate,
and you may specify a selector to use an element instead of the window for restoration.

## Installation

```
npm install @daveyplate/use-scroll-restoration
```

## Usage

Simply call useScrollRestoration hook in a custom _app.js, parameters are all optional.

```
export function useScrollRestoration({ router = null, enabled = true, selector = null, delay = null } = {})
```