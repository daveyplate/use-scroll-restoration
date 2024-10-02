import { useEffect, useState } from 'react'
import { useRouter, NextRouter } from 'next/router'

/**
 * Save the scroll position of the specified element or window to session storage.
 * @param {string} key - The key to save the scroll position under.
 * @param {string} [selector] - The CSS selector of the element to save the scroll position for. If not provided, the window scroll position is saved.
 */
export const saveScrollPos = (key, selector) => {
    let scrollPos = { x: window.scrollX, y: window.scrollY }

    if (selector) {
        const element = document.querySelector(selector)
        scrollPos = { x: element.scrollLeft, y: element.scrollTop }
    }

    sessionStorage.setItem(`scrollPos:${key}`, JSON.stringify(scrollPos))
}

/**
 * Restore the scroll position of the specified element or window from session storage.
 * @param {string} key - The key to retrieve the scroll position from.
 * @param {string} [selector] - The CSS selector of the element to restore the scroll position for. If not provided, the window scroll position is restored.
 */
export const restoreScrollPos = (key, selector) => {
    const json = sessionStorage.getItem(`scrollPos:${key}`)
    const scrollPos = json ? JSON.parse(json) : { x: 0, y: 0 }

    if (selector) {
        const element = document.querySelector(selector)
        element.scrollTo(scrollPos.x, scrollPos.y)
    } else {
        window.scrollTo(scrollPos.x, scrollPos.y)
    }
}

/**
 * Delete the saved scroll position from session storage.
 * @param {string} key - The key to delete the scroll position from.
 */
export const deleteScrollPos = (key) => {
    sessionStorage.removeItem(`scrollPos:${key}`)
}

/**
 * Custom hook to manage scroll restoration for the Next.js Pages Router.
 * @param {Object} [options] - Options for configuring the scroll restoration.
 * @param {NextRouter} [options.router] - Custom router object. If not provided, the Next.js router is used.
 * @param {boolean} [options.enabled=true] - Flag to enable or disable the scroll restoration.
 * @param {string} [options.selector] - CSS selector of the element to manage scroll restoration for. If not provided, the window scroll position is managed.
 * @param {number} [options.delay] - Delay in milliseconds before restoring scroll position. If not provided, restoration is immediate.
 */
export function useScrollRestoration({ router = null, enabled = true, selector = null, delay = null } = {}) {
    const nextRouter = useRouter()
    if (!router) {
        router = nextRouter
    }

    const [key, setKey] = useState(null)

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
                    restoreScrollPos(window.history.state.key, selector, delay)
                    deleteScrollPos(window.history.state.key)
                }, delay)
            } else {
                restoreScrollPos(window.history.state.key, selector, delay)
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