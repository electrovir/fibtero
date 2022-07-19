import {
    JiraAuth,
    JiraCustomFieldDefinitions,
    JiraSimplifiedField,
} from '@packages/common/src/data/jira-data';
import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {emptyUserPreferences} from '@packages/common/src/data/user-preferences';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {css, defineFunctionalElement, html, listen} from 'element-vir';
import {getMaybeCachedFields} from '../../cache/jira-fields-cache';
import {ChangePageEvent} from '../../global-events/change-page.event';

function mapCustomFieldNames(fields: JiraSimplifiedField[]) {
    return fields.reduce((map, entry) => {
        if (entry.key.startsWith('customfield')) {
            map[entry.key] = entry.name;
        }
        return map;
    }, {} as JiraCustomFieldDefinitions);
}

function guessLikelyTypeMappings(simplifiedFields: JiraSimplifiedField[], knownTypes: string[]) {
    const customFieldNames = mapCustomFieldNames(simplifiedFields);
    const mappings: Record<string, string> = {};

    simplifiedFields.forEach((field) => {
        let type: string = 'string';
        if (field.schema) {
            type = field.schema['type']?.toString() ?? 'string';
        }

        if (!knownTypes.includes(type)) {
            knownTypes.push(type);
        }

        mappings[customFieldNames[field.key] ?? field.key] = type;
    });

    knownTypes = knownTypes.sort();
    return mappings;
}

export const FibFieldMappingPage = defineFunctionalElement({
    tagName: 'fib-field-mapping-page',
    props: {
        electronApi: undefined as undefined | ElectronWindowInterface,
        currentPreferences: emptyUserPreferences,
        jiraAuth: undefined as undefined | JiraAuth,
        fieldMapping: {} as Record<string, string>,
        knownTypes: [] as string[],
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

        form {
            display: flex;
            align-items: center;
            flex-direction: column;
        }

        .submit {
            margin: 16px;
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
                fieldMapping: guessLikelyTypeMappings(cachedSimplifiedFields, props.knownTypes),
            });
        }
    },
    renderCallback: ({props, genericDispatch}) => {
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
            <form
                ${listen('submit', () => {
                    electronApi.apiRequest({
                        type: ApiRequestType.SavePreferences,
                        data: {
                            ...props.currentPreferences,
                            fieldMapping: props.fieldMapping,
                        },
                    });

                    genericDispatch(new ChangePageEvent(MainRendererPage.MyViews));
                })}
            >
                <table>
                    <tr>
                        <th>Field</th>
                        <th>Type</th>
                    </tr>
                    ${Object.keys(props.fieldMapping)
                        .map((key) => key[0]?.toUpperCase() + key.slice(1))
                        .sort()
                        .map((key) => {
                            return html`
                                <tr>
                                    <td>${key}</td>
                                    <td>
                                        <select name="${key}">
                                            ${props.knownTypes.map((type) => {
                                                if (type === props.fieldMapping[key]) {
                                                    return html`
                                                        <option value="${type}" selected>
                                                            ${type}
                                                        </option>
                                                    `;
                                                } else {
                                                    return html`
                                                        <option value="${type}">${type}</option>
                                                    `;
                                                }
                                            })}
                                        </select>
                                    </td>
                                </tr>
                            `;
                        })}
                </table>
                <input class="submit" type="submit" value="Save" />
            </form>
        `;
    },
});
