import { useEffect, useState } from 'react'
import { useRouter, NextRouter } from 'next/router'

/**
 * Save the scroll position of the specified element or window to session storage.
 */
export function saveScrollPos(key: string, selector?: string) {
    let scrollPos = { x: window.scrollX, y: window.scrollY }

    if (selector) {
        const element = document.querySelector(selector)

        if (element) {
            scrollPos = { x: element.scrollLeft, y: element.scrollTop }
        }
    }

    sessionStorage.setItem(`scrollPos:${key}`, JSON.stringify(scrollPos))
}

/**
 * Restore the scroll position of the specified element or window from session storage.
 */
export function restoreScrollPos(key: string, selector?: string) {
    const json = sessionStorage.getItem(`scrollPos:${key}`)
    const scrollPos = json ? JSON.parse(json) : { x: 0, y: 0 }

    if (selector) {
        const element = document.querySelector(selector)

        if (element) {
            element.scrollTo(scrollPos.x, scrollPos.y)
        }
    } else {
        window.scrollTo(scrollPos.x, scrollPos.y)
    }
}

/**
 * Delete the saved scroll position from session storage.
 */
export function deleteScrollPos(key: string) {
    sessionStorage.removeItem(`scrollPos:${key}`)
}

interface ScrollRestorationOptions {
    router?: NextRouter
    enabled?: boolean
    selector?: string
    delay?: number
}

/**
 * Custom hook to manage scroll restoration for the Next.js Pages Router.
 * @param {ScrollRestorationOptions} [options]
 * @param {NextRouter} [options.router] - Custom router object. If not provided, the Next.js router is used.
 * @param {boolean} [options.enabled=true] - Flag to enable or disable the scroll restoration.
 * @param {string} [options.selector] - CSS selector of the element to manage scroll restoration for. If not provided, the window scroll position is managed.
 * @param {number} [options.delay] - Delay in milliseconds before restoring scroll position. If not provided, restoration is immediate.
 */
export function useScrollRestoration({ router, enabled = true, selector, delay }: ScrollRestorationOptions) {
    const nextRouter = useRouter()
    if (!router) {
        router = nextRouter
    }

    const [key, setKey] = useState("")

    useEffect(() => setKey(window.history.state.key), [])

    useEffect(() => {
        if (!enabled) return

        // Delete the saved scroll position when the window unloads.
        const onBeforeUnload = () => {
            deleteScrollPos(key)
            deleteScrollPos(window.history.state.key)
        }

        // Save the scroll position when the route changes.
        const onRouteChangeStart = () => {
            saveScrollPos(key, selector)
        }

        // Restore the scroll position when a route change is complete.
        const onRouteChangeComplete = () => {
            setKey(window.history.state.key)

            if (delay != null) {
                setTimeout(() => {
                    restoreScrollPos(window.history.state.key, selector)
                    deleteScrollPos(window.history.state.key)
                }, delay)
            } else {
                restoreScrollPos(window.history.state.key, selector)
                deleteScrollPos(window.history.state.key)
            }
        }

        window.addEventListener('beforeunload', onBeforeUnload)
        router.events.on('routeChangeStart', onRouteChangeStart)
        router.events.on('routeChangeComplete', onRouteChangeComplete)

        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload)
            router.events.off('routeChangeStart', onRouteChangeStart)
            router.events.off('routeChangeComplete', onRouteChangeComplete)
        }
    }, [enabled, key, selector])
}