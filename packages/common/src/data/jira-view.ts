export enum ViewDirection {
    Vertical = 'vertical',
    Horizontal = 'horizontal',
}

export type JiraView = {
    name: string;
    id: string;
    icon: string;
    direction: ViewDirection;
    allIssuesJql: string;
    sections: JiraViewSection[];
};

export type JiraViewSection = {
    name: string;
    id: string;
    requirements: JiraViewSectionFilter[];
};

export type JiraViewSectionFilter = {
    fieldName: string;
    id: string;
    filterRegExpString: string;
};

export function createNewView(
    // this is an input because Node and the browser use different functions here
    randomStringFunction: () => string,
): JiraView {
    return {
        allIssuesJql: '',
        direction: ViewDirection.Horizontal,
        icon: '',
        id: randomStringFunction(),
        name: '',
        sections: [createEmptyViewSection(randomStringFunction)],
    };
}

export function createEmptyViewSection(
    // this is an input because Node and the browser use different functions here
    randomStringFunction: () => string,
): JiraViewSection {
    return {
        id: randomStringFunction(),
        name: '',
        requirements: [
            {
                fieldName: '',
                filterRegExpString: '',
                id: randomStringFunction(),
            },
        ],
    };
}

export function createEmptyViewSectionFilter(
    // this is an input because Node and the browser use different functions here
    randomStringFunction: () => string,
): JiraViewSectionFilter {
    return {
        fieldName: '',
        filterRegExpString: '',
        id: randomStringFunction(),
    };
}
