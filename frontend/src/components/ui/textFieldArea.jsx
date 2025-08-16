import * as React from 'react';
import { cn } from '@/lib/utils';

const TextFieldArea = React.forwardRef(
    (
        {
            className,
            value = '',
            onChange,
            label = 'Label',
            charLimit = 500, // Default character limit
            showCharCount = false, // Control whether to show character count
            ...props
        },
        ref
    ) => {
        const [charCount, setCharCount] = React.useState(value.length);
        const [errorMessage, setErrorMessage] = React.useState('');

        const handleInputChange = (e) => {
            const inputValue = e.target.value;
            setCharCount(inputValue.length);

            if (showCharCount && inputValue.length > charLimit) {
                setErrorMessage(`Character limit exceeded by ${inputValue.length - charLimit} characters.`);
            } else {
                setErrorMessage('');
            }

            if (onChange) {
                onChange(e);
            }
        };

        React.useEffect(() => {
            setCharCount(value.length);
            if (showCharCount && value.length > charLimit) {
                setErrorMessage(`Character limit exceeded by ${value.length - charLimit} characters.`);
            } else {
                setErrorMessage('');
            }
        }, [value, charLimit, showCharCount]);

        return (
            <div style={{ width: '100%' }} className="py-1">
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2px',
                    }}
                >   <label className="text-black font-medium text-[14px]">{label}</label>

                {/* Show character count only if showCharCount is true */}
                {showCharCount && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2px',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '12px',
                                color: errorMessage ? 'red' : '#7C7D7E',
                            }}
                        >
                            {charCount}/{charLimit}
                        </span>
                    </div>
                )}
                </div>
                <textarea
                    className={cn(
                        'flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-primary-200 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#e0e0e0] disabled:text-[#999999]',
                        className
                    )}
                    onChange={handleInputChange}
                    value={value}
                    ref={ref}
                    {...props}
                />

                {/* Show error message only if showCharCount is true */}
                {showCharCount && errorMessage && (
                    <div className="mt-1 text-red-500 text-[12px]">{errorMessage}</div>
                )}
            </div>
        );
    }
);


TextFieldArea.displayName = 'TextFieldArea';

export { TextFieldArea };
