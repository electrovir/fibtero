import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {assign, defineFunctionalElement, html} from 'element-vir';
import {BasicJiraTest} from '../test-elements/basic-jira-test.element';

export const FibHomePage = defineFunctionalElement({
    tagName: 'fib-home-page',
    props: {
        electronApi: undefined as undefined | ElectronWindowInterface,
    },
    renderCallback: ({props}) => {
        return html`
            <${BasicJiraTest} 
                ${assign(BasicJiraTest.props.useCachedData, true)}
                ${assign(BasicJiraTest.props.electronApi, props.electronApi)}
            ></${BasicJiraTest}>
        `;
    },
});
