import {serializeJiraView} from '@packages/common/src/data/jira-view';
import {emptyUserPreferences, UserPreferences} from '@packages/common/src/data/user-preferences';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {FibButton} from '../core-elements/fib-button.element';

export const FibExportJiraViewPage = defineFunctionalElement({
    tagName: 'fib-export-jira-view-page',
    props: {
        userPreferences: emptyUserPreferences as UserPreferences,
        selectedViewIndex: undefined as undefined | number,
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .view-names-wrapper {
            display: flex;
            gap: 8px;
        }

        textarea {
            flex-grow: 1;
            max-width: 500px;
            max-height: 300px;
        }
    `,
    renderCallback: ({props, setProps}) => {
        if (!props.userPreferences.views.length) {
            return html`
                No views to export. Use "Create Jira View" or "Import Jira View" to make some!
            `;
        }
        // automatically select the only view if there's only one
        else if (props.userPreferences.views.length === 1) {
            setProps({selectedViewIndex: 0});
        }

        const selectedView =
            props.selectedViewIndex === undefined
                ? undefined
                : props.userPreferences.views[props.selectedViewIndex];

        const serializedViewTemplate = selectedView
            ? html`
                  Copy the following:
                  <textarea readonly .value=${serializeJiraView(selectedView)}></textarea>
              `
            : '';

        return html`
            <br />
            Choose a view to export:
            <div class="view-names-wrapper">
                ${props.userPreferences.views.map((view, index) => {
                    return html`
                        <${FibButton}
                            ${assign(FibButton.props.label, view.name)}
                            ${assign(FibButton.props.disabled, index === props.selectedViewIndex)}
                            ${listen('click', () => {
                                setProps({selectedViewIndex: index});
                            })}
                        ></${FibButton}>
                    `;
                })}
            </div>
            ${serializedViewTemplate}
        `;
    },
});
