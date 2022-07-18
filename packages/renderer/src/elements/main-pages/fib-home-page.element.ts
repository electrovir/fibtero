import {defineFunctionalElement, html} from 'element-vir';

export const FibHomePage = defineFunctionalElement({
    tagName: 'fib-home-page',
    props: {},
    renderCallback: () => {
        return html`
            Hello there
        `;
    },
});
