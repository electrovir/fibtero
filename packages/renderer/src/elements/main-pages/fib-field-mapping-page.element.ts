import {
    JiraAuth,
    JiraCustomFieldDefinitions,
    JiraSimplifiedField,
} from '@packages/common/src/data/jira-data';
import {emptyUserPreferences} from '@packages/common/src/data/user-preferences';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {css, defineFunctionalElement, html} from 'element-vir';
import {getMaybeCachedFields} from '../../cache/jira-fields-cache';

function mapCustomFieldNames(fields: JiraSimplifiedField[]) {
    return fields.reduce((map, entry) => {
        if (entry.key.startsWith('customfield')) {
            map[entry.key] = entry.name;
        }
        return map;
    }, {} as JiraCustomFieldDefinitions);
}

function guessLikelyTypeMappings(simplifiedFields: JiraSimplifiedField[]) {
    const customFieldNames = mapCustomFieldNames(simplifiedFields);
    const mappings: Record<string, string> = {};

    simplifiedFields.forEach((field) => {
        let type: string = 'string';
        if (field.schema) {
            type = field.schema['type']?.toString() ?? 'string';
        }
        mappings[customFieldNames[field.key] ?? field.key] = type;
    });

    console.log({mappings: mappings});
    return mappings;
}

function makeJiraRequestData(props: typeof FibFieldMappingPage['init']['props']) {
    return {
        domain: props.jiraAuth?.domain || '',
        credentials: props.jiraAuth?.credentials || {
            apiKey: '',
            username: '',
        },
    };
}

function makeSearchRequestData(props: typeof FibFieldMappingPage['init']['props']) {
    return {
        domain: props.jiraAuth?.domain || '',
        jql: 'project = "UX Engineering"',
        credentials: props.jiraAuth?.credentials || {
            apiKey: '',
            username: '',
        },
    };
}

export const FibFieldMappingPage = defineFunctionalElement({
    tagName: 'fib-field-mapping-page',
    props: {
        electronApi: undefined as undefined | ElectronWindowInterface,
        currentPreferences: emptyUserPreferences,
        jiraAuth: undefined as undefined | JiraAuth,
        fieldMappings: {} as Record<string, string>,
    },
    styles: css`
        :host {
            display: flex;
            align-items: center;
            flex-direction: column;
        }

        table {
            border: none;
            border-collapse: collapse;
        }

        td,
        th {
            border-right: 1px solid black;
            padding: 8px;
        }

        td:last-child,
        th:last-child {
            border-right: none;
        }

        th {
            border-bottom: 1px solid black;
        }
    `,
    initCallback: async ({props, setProps}) => {
        if (props.electronApi && props.jiraAuth) {
            const cachedSimplifiedFields = await getMaybeCachedFields(
                props.electronApi,
                props.jiraAuth,
                () => {},
            );
            setProps({
                fieldMappings: guessLikelyTypeMappings(cachedSimplifiedFields),
            });
        }
    },
    renderCallback: ({props, setProps, genericDispatch}) => {
        if (!props.electronApi) {
            return html`
                loading...
            `;
        }

        const electronApi: ElectronWindowInterface = props.electronApi;

        return html`
            <h2>Jira Field Mappings</h2>
            <p>
                Please review the auto-generated field type mappings. If there are any corrections
                you would like to make, feel free to make them now. There will be the option to
                return and edit these mappings later.
            </p>
            <table>
                <tr>
                    <th>Field</th>
                    <th>Type</th>
                </tr>
                ${Object.keys(props.fieldMappings).map((key) => {
                    return html`
                        <tr>
                            <td>${key}</td>
                            <td>${props.fieldMappings[key]}</td>
                        </tr>
                    `;
                })}
            </table>
        `;
    },
});
