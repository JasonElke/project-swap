import React, { useContext, useState } from "react";


export type SwapContext = {
    inputAmount: number;
    setInputAmount: (amount: number) => void;
};
const _SwapContext = React.createContext<null | SwapContext>(null);

export function SwapContextProvider(props: any) {
    const [inputAmount, _setInputAmount] = useState(props.inputAmount ?? 0);

    const setInputAmount = (amount: number) => {
        _setInputAmount(amount);
    };

    return (
        <_SwapContext.Provider
            value={{
                inputAmount,
                setInputAmount,
            }}
        >
            {props.children}
        </_SwapContext.Provider>
    );
}

export function useInputSwapContext(): SwapContext {
    const ctx = useContext(_SwapContext);
    if (ctx === null) {
        throw new Error("Context not available");
    }
    return ctx;
}