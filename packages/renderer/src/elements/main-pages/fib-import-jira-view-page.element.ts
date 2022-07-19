import {JiraView, validateView} from '@packages/common/src/data/jira-view';
import {emptyUserPreferences, UserPreferences} from '@packages/common/src/data/user-preferences';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {isTruthy} from 'augment-vir';
import {assign, css, defineFunctionalElement, html, listen, onDomCreated} from 'element-vir';
import {ReloadUserPreferencesEvent} from '../../global-events/reload-user-preferences.event';
import {FibButton} from '../core-elements/fib-button.element';

export const FibImportJiraViewPage = defineFunctionalElement({
    tagName: 'fib-import-jira-view-page',
    props: {
        importedString: '',
        electronApi: undefined as undefined | ElectronWindowInterface,
        userPreferences: emptyUserPreferences as UserPreferences,
        innerTextAreaElement: undefined as undefined | HTMLTextAreaElement,
        error: '',
        successMessage: '',
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        textarea {
            flex-grow: 1;
            max-width: 500px;
            max-height: 300px;
        }

        .error-message {
            color: red;
        }

        .success-message {
            color: green;
            font-size: 1.2em;
        }
    `,
    renderCallback: ({setProps, props, genericDispatch}) => {
        if (!props.electronApi) {
            return html`
                Loading...
            `;
        }
        const electronApi = props.electronApi;

        return html`
            <br />
            Paste in an exported Jira view JSON to import it:
            <div class="error-message">
                ${props.error
                    .split('\n')
                    .filter(isTruthy)
                    .map(
                        (line) =>
                            html`
                                • ${line}
                                <br />
                            `,
                    )}
            </div>
            <textarea
                ${onDomCreated((element) => {
                    if (!(element instanceof HTMLTextAreaElement)) {
                        throw new Error(`Failed to get text area element`);
                    }
                    setProps({
                        innerTextAreaElement: element,
                    });
                })}
                ${listen('input', () => {
                    const value = props.innerTextAreaElement?.value ?? '';
                    setProps({
                        importedString: value,
                        successMessage: '',
                    });
                })}
            ></textarea>
            <${FibButton}
                ${assign(FibButton.props.label, 'Import')}
                ${assign(FibButton.props.disabled, !props.importedString.trim())}
                ${listen('click', async () => {
                    if (props.importedString) {
                        setProps({
                            error: '',
                            successMessage: '',
                        });
                        let currentJiraView: JiraView | undefined;
                        let errorMessage = '';
                        try {
                            currentJiraView = JSON.parse(props.importedString) as JiraView;
                            errorMessage += validateView(currentJiraView);
                        } catch (tryError) {
                            console.error(tryError);
                            errorMessage += 'JSON parse failed.';
                        }
                        if (currentJiraView) {
                            // for types this is getting reassigned
                            const definedJiraView = currentJiraView;

                            if (
                                props.userPreferences.views.find((existingView) => {
                                    return existingView.id === definedJiraView.id;
                                })
                            ) {
                                errorMessage += `\ncannot use id ${definedJiraView.id} for a Jira view, it's already in use!`;
                            }
                            if (
                                props.userPreferences.views.find((existingView) => {
                                    return existingView.name === definedJiraView.name;
                                })
                            ) {
                                errorMessage += `\nCannot use name ${definedJiraView.name} for a Jira view, it's already in use!`;
                            }
                        }

                        if (errorMessage) {
                            console.error(errorMessage);
                            setProps({
                                error: errorMessage,
                            });
                        } else if (currentJiraView) {
                            const result = await electronApi.apiRequest({
                                type: ApiRequestType.SavePreferences,
                                data: {
                                    ...props.userPreferences,
                                    views: [
                                        ...props.userPreferences.views,
                                        currentJiraView,
                                    ],
                                },
                            });
                            if (result.success) {
                                if (!props.innerTextAreaElement) {
                                    throw new Error(`no text area yet`);
                                }
                                props.innerTextAreaElement.value = '';
                                setProps({
                                    importedString: '',
                                    successMessage: 'success!',
                                });
                                genericDispatch(new ReloadUserPreferencesEvent());
                            } else {
                                setProps({
                                    error: result.error,
                                });
                            }
                        }
                    }
                })}
            ></${FibButton}>
            <div class="success-message">${props.successMessage}</div>
        `;
    },
});
