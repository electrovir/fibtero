import {defineFunctionalElement, html} from 'element-vir';
import {BasicJiraTest} from '../test-elements/basic-jira-test.element';

export const FibHomePage = defineFunctionalElement({
    tagName: 'fib-home-page',
    props: {},
    renderCallback: () => {
        return html`
            <${BasicJiraTest}></${BasicJiraTest}>
        `;
    },
});
