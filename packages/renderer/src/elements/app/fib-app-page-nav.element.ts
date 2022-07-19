import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {capitalizeFirstLetter} from 'augment-vir';
import {defineFunctionalElement, html, listen} from 'element-vir';
import {css} from 'lit';
import {ChangePageEvent} from '../../global-events/change-page.event';

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
        currentPage: MainRendererPage.Auth,
        showBackButton: true,
    },
    styles: css`
        :host {
            justify-content: space-between;
        }

        :host,
        div {
            display: flex;
            box-sizing: border-box;
            gap: 32px;
            flex-wrap: wrap;
        }

        div {
            justify-content: flex-end;
        }

        .gear-icon {
            border-radius: 8px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px 8px;
        }

        .gear-icon:hover {
            background-color: #efefef;
        }
    `,
    renderCallback: ({props, genericDispatch}) => {
        return html`
            ${![
                MainRendererPage.MyViews,
                MainRendererPage.Auth,
            ].includes(props.currentPage) && props.showBackButton
                ? html`
                      <button
                          ${listen('click', () => {
                              genericDispatch(new ChangePageEvent(MainRendererPage.MyViews));
                          })}
                      >
                          Back
                      </button>
                  `
                : html`
                      <div></div>
                  `}
            <div>
                <button
                    ${listen('click', () => {
                        genericDispatch(new ChangePageEvent(MainRendererPage.Test));
                    })}
                >
                    Test Page
                </button>
                <button
                    class="gear-icon"
                    ${listen('click', () => {
                        genericDispatch(new ChangePageEvent(MainRendererPage.Settings));
                    })}
                >
                    ⚙️
                </button>
            </div>
        `;
    },
});
