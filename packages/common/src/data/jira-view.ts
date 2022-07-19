import {isEnumValue} from 'augment-vir';
import {JiraIssue} from './jira-data';
export function serializeJiraView(input: Readonly<JiraView>): string {
    try {
        return JSON.stringify(input);
    } catch (error) {
        console.error(error);
        return `ERROR: failed to serialize jira view.`;
    }
}

/**
 * Returns an empty string if no errors. If there are errors, they are returned as a string. Each
 * error will be separated by a new line.
 */
export function validateView(view: JiraView): string {
    const errors: string[] = [];
    if (!view.allIssuesJql) {
        errors.push('missing JQL input');
    }
    if (!isEnumValue(view.direction, ViewDirection)) {
        errors.push(`invalid direction: ${view.direction}`);
    }
    if (view.icon) {
        errors.push('icon field is not supported yet');
    }
    if (!view.id) {
        errors.push('view id is missing');
    }
    if (!view.name) {
        errors.push('view name is missing');
    }
    view.sections.forEach((section, sectionIndex) => {
        if (!section.id) {
            errors.push(`missing id on section at index ${sectionIndex}`);
        }
        if (!section.name) {
            errors.push(`missing name on section at index ${sectionIndex}`);
        }
        section.requirements.forEach((filter, filterIndex) => {
            const onFilter = `on filter at index ${filterIndex} in section at index ${sectionIndex}`;
            if (!filter.fieldName) {
                errors.push(`Missing field name ${onFilter}`);
            }
            if (!filter.id) {
                errors.push(`Missing id ${onFilter}`);
            }
            if (!filter.filterRegExpString) {
                errors.push(`Missing RegExp string ${onFilter}`);
            }
        });
    });

    return errors.join('\n');
}

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

function getFieldValue(value: any, fieldName: string | string[]): any {
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

export function matchesSectionFilters(issue: JiraIssue, section: JiraViewSection): boolean {
    return section.requirements.some((filter) => {
        const fieldValue = getFieldValue(issue, filter.fieldName);
        if (!fieldValue) {
            return false;
        }
        const filterRegExp = new RegExp(filter.filterRegExpString, 'i');
        const match = !!String(fieldValue).match(filterRegExp);
        console.log({fieldName: filter.fieldName, issue, fieldValue, filterRegExp, match});
        return match;
    });
}
