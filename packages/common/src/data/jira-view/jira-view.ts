import {IssueDragging} from './view-issue-dragging';

export enum ViewDirection {
    Vertical = 'vertical',
    Horizontal = 'horizontal',
}

export enum FilterType {
    Unique = 'Unique Field Values',
    Regex = 'RegExp String',
    Includes = 'Includes',
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
    dragIn: IssueDragging[];
    dragOut: IssueDragging[];
    requirements: JiraViewSectionFilter[];
};

export type JiraViewSectionFilter = {
    fieldName: string;
    id: string;
    filterRegExpString: string;
    filterType: FilterType;
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
                filterType: FilterType.Regex,
            },
        ],
        dragIn: [],
        dragOut: [],
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
        filterType: FilterType.Regex,
    };
}

export function getFieldValue(fields: any, fieldName: string | string[]): any {
    try {
        if (Array.isArray(fieldName)) {
            if (!fieldName.length) {
                return fields;
            } else {
                return getFieldValue(fields[fieldName[0]!], fieldName.slice(1));
            }
        } else {
            return getFieldValue(fields.fields, fieldName.split('.'));
        }
    } catch (error) {
        return undefined;
    }
}

export function createFieldValue(issue: any, value: any, fieldName: string | string[]): any {
    try {
        if (Array.isArray(fieldName)) {
            if (!fieldName.length) {
                return value;
            } else {
                return {
                    [fieldName[0]!]: createFieldValue(
                        issue[fieldName[0]!],
                        value,
                        fieldName.slice(1),
                    ),
                };
            }
        } else {
            return createFieldValue(issue.fields, value, fieldName.split('.'));
        }
    } catch (error) {
        return;
    }
}
