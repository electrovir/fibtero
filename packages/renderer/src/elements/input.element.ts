import {
    css,
    defineElementEvent,
    defineFunctionalElement,
    html,
    listen,
    onDomCreated,
} from 'element-vir';

export type TextInputTypes = 'email' | 'password' | 'search' | 'text' | 'url';

export const FibInput = defineFunctionalElement({
    tagName: 'fib-input',
    props: {
        label: '',
        /** Use to programmatically fill out the input's value field. */
        value: '',
        /** Shown when no other text is present. Input restrictions do not apply to this property. */
        placeholder: '',
        /** Set to true to trigger disabled styles and to block all user input. */
        disabled: false,
        inputType: 'text' as TextInputTypes,
        /**
         * This is used to grab the "value" of user inputs. Warning: externally overriding this will
         * cause weird things to happen!
         */
        innerInputElement: undefined as undefined | HTMLInputElement,
    },
    events: {
        /**
         * Fires whenever a user input created a new value. Does not fire if all input letters are
         * filtered out due to input restrictions.
         */
        valueChange: defineElementEvent<string>(),
    },
    styles: css`
        label {
            display: flex;
            flex-direction: column;
            cursor: pointer;
        }

        .focus-border {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 8px;
            pointer-events: none;
        }
    `,
    renderCallback: ({props, setProps, dispatch, events}) => {
        return html`
            <label>
                ${props.label}
                <input
                    type=${props.inputType}
                    ?disabled=${props.disabled}
                    ${onDomCreated((element) => {
                        if (element instanceof HTMLInputElement) {
                            setProps({innerInputElement: element});
                        } else {
                            throw new Error(
                                `input element was created but didn't get an input element back: "${element.tagName}"`,
                            );
                        }
                    })}
                    .value=${props.value}
                    ${listen('input', (event) => {
                        if (!props.innerInputElement) {
                            throw new Error(`innerInputElement not defined yet`);
                        }
                        /**
                         * When attached to an input element (like here) this event type should
                         * always be InputEvent.
                         */
                        if (!(event instanceof InputEvent)) {
                            throw new Error(
                                `Input event type mismatch: "${event.constructor.name}"`,
                            );
                        }
                        const beforeChangeText = props.value;

                        const finalText = props.innerInputElement.value ?? '';

                        if (props.value !== finalText) {
                            setProps({value: finalText});
                        }
                        if (props.innerInputElement.value !== finalText) {
                            props.innerInputElement.value = finalText;
                        }
                        if (beforeChangeText !== finalText) {
                            dispatch(new events.valueChange(finalText));
                        }
                    })}
                    placeholder=${props.placeholder}
                />
                <div class="focus-border"></div>
            </label>
        `;
    },
});
