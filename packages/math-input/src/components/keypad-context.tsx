/**
 * KeypadContext provides a way to the Keypad and Perseus Renderers to
 * communicate.
 *
 * The StatefulKeypadContextProvider wraps the application
 * while KeypadContext.Consumer wraps things that need this state:
 * - mobile keypad usages
 * - Perseus Renderers (Server/Item/Article)
 */
import * as React from "react";
import {useState} from "react";

import type {KeypadAPI, KeypadContextType} from "../types";
import type {KeypadContextRendererInterface} from "@khanacademy/perseus-core";

// @ts-expect-error - TS2322 - Type 'Context<{ setKeypadElement: (keypadElement: HTMLElement | null | undefined) => void; keypadElement: null; setRenderer: (renderer: RendererInterface | null | undefined) => void; renderer: null; setScrollableElement: (scrollableElement: HTMLElement | ... 1 more ... | undefined) => void; scrollableElement: null; }>' is not assignable to type 'Context<KeypadContext>'.
export const KeypadContext: React.Context<KeypadContextType> =
    React.createContext({
        setKeypadActive: (keypadActive) => {},
        keypadActive: false,
        setKeypadElement: (keypadElement) => {},
        keypadElement: null,
        setRenderer: (renderer) => {},
        renderer: null,
        setScrollableElement: (scrollableElement) => {},
        scrollableElement: null,
    });

type Props = React.PropsWithChildren<unknown>;

export function StatefulKeypadContextProvider(props: Props) {
    // whether or not to display the keypad
    const [keypadActive, setKeypadActive] = useState<boolean>(false);
    // used to communicate between the keypad and the Renderer
    const [keypadElement, setKeypadElement] = useState<KeypadAPI | null>();
    // this is a KeypadContextRendererInterface from Perseus
    const [renderer, setRenderer] =
        useState<KeypadContextRendererInterface | null>();
    const [scrollableElement, setScrollableElement] =
        useState<HTMLElement | null>();

    return (
        <KeypadContext.Provider
            value={{
                setKeypadActive,
                keypadActive,
                setKeypadElement,
                keypadElement,
                setRenderer,
                renderer,
                // The scrollableElement options can likely be removed after
                // the exercises-package is officially deprecated. They don't appear
                // to be used anywhere except for the exercises-package and tests.
                setScrollableElement,
                scrollableElement,
            }}
        >
            {props.children}
        </KeypadContext.Provider>
    );
}
