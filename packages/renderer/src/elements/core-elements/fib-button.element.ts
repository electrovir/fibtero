import {css, defineFunctionalElement, html} from 'element-vir';

export type TextInputTypes = 'email' | 'password' | 'search' | 'text' | 'url';

export const FibButton = defineFunctionalElement({
    tagName: 'fib-button',
    props: {
        label: '',
        disabled: false,
    },
    styles: css`
        button {
            padding: 8px 16px;
            font-size: 1.2em;
            border: 2px solid dodgerblue;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            flex-shrink: 0;
        }

        button:not(.disabled):hover {
            background: #c7e3ff;
        }

        button:not(.disabled):active {
            background: #ebf5ff;
        }

        .disabled {
            cursor: default;
            border-color: #ccc;
        }
    `,
    renderCallback: ({props}) => {
        return html`
            <button class="${props.disabled ? 'disabled' : ''}" ?disabled=${props.disabled}>
                ${props.label}
            </button>
        `;
    },
});
