import {JiraAuth} from '@packages/common/src/data/jira-data';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {assign, defineElementEvent, defineFunctionalElement, html, listen} from 'element-vir';
import {css} from 'lit';
import {getCachedData, setCachedData} from '../../cache/cached-auth';
import {FibInput} from '../core-elements/fib-input.element';

function makeJiraAuth(props: typeof FibAuthPage['init']['props']): JiraAuth {
    const auth: JiraAuth = {
        credentials: {
            apiKey: props.apiKey,
            username: props.username,
        },
        domain: props.domain,
    };

    return auth;
}

async function testLogin(jiraAuth: JiraAuth, electronApi: ElectronWindowInterface) {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.GetCustomFieldNames,
        data: jiraAuth,
    });

    if (response.success) {
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

export const FibAuthPage = defineFunctionalElement({
    tagName: 'fib-auth-page',
    props: {
        loginOnLoad: false,
        useCachedData: false,
        electronApi: undefined as undefined | ElectronWindowInterface,
        username: getCachedData()?.credentials.username ?? '',
        apiKey: getCachedData()?.credentials.apiKey ?? '',
        domain: getCachedData()?.domain ?? '',
        message: '',
        authLoaded: false,
        tryingToLogin: undefined as any,
    },
    events: {
        authLoaded: defineElementEvent<void>(),
        jiraAuthSubmit: defineElementEvent<JiraAuth>(),
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            padding: 16px;
        }
    `,
    initCallback({props, setProps, dispatch, events}) {
        if (!props.useCachedData) {
            setProps({
                apiKey: '',
                domain: '',
                username: '',
            });
        }
        dispatch(new events.authLoaded());
    },
    renderCallback: ({props, setProps, dispatch, events}) => {
        async function tryLogin() {
            setProps({message: ''});
            if (!props.electronApi) {
                return;
            }
            if (props.authLoaded) {
                setProps({message: 'logging in...'});
            }

            try {
                await testLogin(makeJiraAuth(props), props.electronApi);
                setProps({message: ''});
                dispatch(new events.jiraAuthSubmit(makeJiraAuth(props)));
            } catch (error) {
                if (props.authLoaded) {
                    setProps({message: `Failed to login: ${error}`});
                }
            }
        }

        if (!props.authLoaded && props.electronApi && !props.tryingToLogin) {
            if (props.loginOnLoad) {
                setProps({
                    tryingToLogin: tryLogin().finally(() => {
                        dispatch(new events.authLoaded());
                        setProps({authLoaded: true, tryingToLogin: undefined});
                    }),
                });
            } else {
                dispatch(new events.authLoaded());
            }
        } else if (!props.electronApi || !props.authLoaded || props.tryingToLogin) {
            return html`
                loading...
            `;
        }

        return html`
            <h2>
                Login
            </h2>
            <form
                ${listen('submit', async (event) => {
                    // prevent page navigation
                    event.preventDefault();
                    tryLogin();
                })}
            >
                <${FibInput}
                    ${listen(FibInput.events.valueChange, (event) => {
                        setProps({domain: event.detail});
                        setCachedData(makeJiraAuth(props));
                    })}
                    ${assign(FibInput.props.label, 'Jira Cloud domain')}
                    ${assign(FibInput.props.value, props.domain)}
                ></${FibInput}>
                <${FibInput}
                    ${listen(FibInput.events.valueChange, (event) => {
                        setProps({username: event.detail});
                        setCachedData(makeJiraAuth(props));
                    })}
                    ${assign(FibInput.props.label, 'Jira username')}
                    ${assign(FibInput.props.value, props.username)}
                ></${FibInput}>
                <${FibInput}
                    ${listen(FibInput.events.valueChange, (event) => {
                        setProps({apiKey: event.detail});
                        setCachedData(makeJiraAuth(props));
                    })}
                    ${assign(FibInput.props.label, 'Jira API key')}
                    ${assign(FibInput.props.value, props.apiKey)}
                    ${assign(FibInput.props.inputType, 'password')}
                ></${FibInput}>
                <br>
                <input class="submit" type="submit" value="Login" />
                <span>${props.message}</span>
            </form>
        `;
    },
});
