import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {capitalizeFirstLetter, getEnumTypedValues} from 'augment-vir';
import {assign, defineElementEvent, defineFunctionalElement, html, listen} from 'element-vir';
import {css} from 'lit';
import {FibButton} from '../core-elements/fib-button.element';

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
    `,
    renderCallback: ({props, dispatch, events}) => {
        return html`
            ${getEnumTypedValues(MainRendererPage).map((pageValue) => {
                const pageName = prettifyMainPageValue(pageValue);
                const isThisPage = pageValue === props.currentPage;

                return html`
                    <${FibButton}
                        ${assign(FibButton.props.disabled, isThisPage)}
                        ${assign(FibButton.props.label, pageName)}
                        ${listen('click', () => {
                            if (!isThisPage) {
                                dispatch(new events.pageChange(pageValue));
                            }
                        })}
                    >
                    </${FibButton}>
                `;
            })}
        `;
    },
});
