import React, { createContext, useContext, useState } from 'react';
const LoaderContext = createContext();
export const LoaderProvider = ({ children }) => {
    const [showOverlay, setShowOverlay] = useState(false);
    const toggleOverlay = (val) => {
        setShowOverlay(val);
    };
    return (
        <LoaderContext.Provider value={{

            showOverlay,
            toggleOverlay
        }}>
            {children}
        </LoaderContext.Provider>
    );
};
export const useLoader = () => {
    const context = useContext(LoaderContext);
    if (!context) {
        throw new Error('useLoader must be used within a LoaderProvider');
    }
    return context;
};
export const LoaderDisplay = () => {
    const { showOverlay } = useLoader();

    return (
        <>

            {showOverlay && (
                <div className="fixed inset-0 bg-[rgba(169,169,169,0.5)] flex items-center justify-center z-50">
                    <div className="text-4xl font-bold text-center">
                        {/* <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="45" stroke="#f3f3f3" stroke-width="5" fill="none" />

                            <circle cx="50" cy="50" r="45" stroke="#4caf50" stroke-width="5" fill="none" stroke-linecap="round">
                                <animate
                                    attributeName="stroke-dashoffset"
                                    values="283;0"
                                    dur="1.5s"
                                    keyTimes="0;1"
                                    repeatCount="indefinite" />
                                <animate
                                    attributeName="stroke-dasharray"
                                    values="0, 283;283, 283"
                                    dur="1.5s"
                                    keyTimes="0;1"
                                    repeatCount="indefinite" />
                            </circle>
                        </svg> */}

                        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="mixedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#4caf50" />
                                    <stop offset="50%" stop-color="#FFA500" />
                                    <stop offset="100%" stop-color="#FF5733" />
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="50" r="45" stroke="#f3f3f3" stroke-width="5" fill="none" />
                            <circle cx="50" cy="50" r="45" stroke="url(#mixedGradient)" stroke-width="5" fill="none" stroke-linecap="round">
                                <animate
                                    attributeName="stroke-dashoffset"
                                    values="283;0"
                                    dur="1.5s"
                                    keyTimes="0;1"
                                    repeatCount="indefinite" />
                                <animate
                                    attributeName="stroke-dasharray"
                                    values="0, 283;283, 283"
                                    dur="1.5s"
                                    keyTimes="0;1"
                                    repeatCount="indefinite" />
                            </circle>
                        </svg>
                    </div>
                </div>
            )}
        </>
    );
};


export const loaderStart = (val) => {
    toggleOverlay(val)
}
export const LoaderControls = ({ val }) => {
    const { toggleOverlay } = useLoader();

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div className="flex justify-center gap-4">
                {toggleOverlay(val)}
            </div>

        </div>
    );
};
