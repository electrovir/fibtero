import {serializeJiraView} from '@packages/common/src/data/jira-view';
import {emptyUserPreferences, UserPreferences} from '@packages/common/src/data/user-preferences';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {FibViewSelector} from '../fib-view-selector.element';

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
            <${FibViewSelector}
                ${assign(FibViewSelector.props.views, props.userPreferences.views)}
                ${assign(FibViewSelector.props.selectedViewIndex, props.selectedViewIndex)}
                ${listen(FibViewSelector.events.selectedViewChange, (event) => {
                    setProps({selectedViewIndex: event.detail});
                })}
            ></${FibViewSelector}>
            ${serializedViewTemplate}
        `;
    },
});
