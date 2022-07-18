import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {capitalizeFirstLetter, getEnumTypedValues} from 'augment-vir';
import {defineElementEvent, defineFunctionalElement, html, listen} from 'element-vir';
import {css} from 'lit';

function prettifyMainPageValue(value: MainRendererPage): string {
    return capitalizeFirstLetter(
        value.replace(/\-(.)/g, (fullMatch, captureGroup) => {
            return ` ${captureGroup.toUpperCase()}`;
        }),
    );
}

export const FibAppPageNav = defineFunctionalElement({
    tagName: 'fib-app-page-nav',
    props: {
        currentPage: MainRendererPage.Home,
        currentView: [],
    },
    events: {
        pageChange: defineElementEvent<MainRendererPage>(),
    },
    styles: css`
        :host {
            display: flex;
            box-sizing: border-box;
            justify-content: center;
            gap: 32px;
            flex-wrap: wrap;
        }

        button {
            padding: 8px 16px;
            font-size: 1.2em;
            border: 2px solid dodgerblue;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            flex-shrink: 0;
        }

        button:not(.selected):hover {
            background: #c7e3ff;
        }

        button:not(.selected):active {
            background: #ebf5ff;
        }

        .selected {
            cursor: default;
            border-color: #ccc;
        }
    `,
    renderCallback: ({props, dispatch, events}) => {
        return html`
            ${getEnumTypedValues(MainRendererPage).map((pageValue) => {
                const pageName = prettifyMainPageValue(pageValue);
                const isThisPage = pageValue === props.currentPage;

                return html`
                    <button
                        class="${isThisPage ? 'selected' : ''}"
                        ?disabled=${isThisPage}
                        ${listen('click', () => {
                            if (!isThisPage) {
                                dispatch(new events.pageChange(pageValue));
                            }
                        })}
                    >
                        ${pageName}
                    </button>
                `;
            })}
        `;
    },
});
