import {JiraIssue} from '../jira-data';
import {IssueDragging} from './view-issue-dragging';

export enum ViewDirection {
    Vertical = 'vertical',
    Horizontal = 'horizontal',
}

export enum FilterType {
    Unique = 'Unique Field Values',
    Regex = 'RegExp String',
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

export function getFieldValue(value: any, fieldName: string | string[]): any {
    try {
        if (Array.isArray(fieldName)) {
            if (!fieldName.length) {
                return value;
            } else {
                return getFieldValue(value[fieldName[0]!], fieldName.slice(1));
            }
        } else {
            return getFieldValue(value.fields, fieldName.split('.'));
        }
    } catch (error) {
        return undefined;
    }
}

export function matchesSectionFilters(issue: JiraIssue, section: JiraViewSection): string[] {
    const sections = section.requirements.reduce((accum, filter) => {
        const fieldValue = getFieldValue(issue, filter.fieldName);
        if (!fieldValue) {
            return accum;
        }
        switch (filter.filterType) {
            case FilterType.Unique:
                accum.push(fieldValue);
                break;
            default:
                const filterRegExp = new RegExp(filter.filterRegExpString, 'i');
                const match = !!String(fieldValue).match(filterRegExp);
                if (match) {
                    accum.push(section.name);
                }
        }
        return accum;
    }, [] as string[]);
    return sections;
}
