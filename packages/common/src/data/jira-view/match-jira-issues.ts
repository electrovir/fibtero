import {JiraIssue} from '../jira-data';
import {FilterType, getFieldValue, JiraViewSection} from './jira-view';

export type MatchResult = {
    sectionName: string;
    priority: number;
};

export function matchesSectionFilters(issue: JiraIssue, section: JiraViewSection): MatchResult[] {
    const sectionNames = section.requirements.reduce((accum, filter, filterIndex) => {
        const fieldValue = getFieldValue(issue, filter.fieldName);
        if (!fieldValue) {
            return accum;
        }
        switch (filter.filterType) {
            case FilterType.Unique: {
                accum.push({sectionName: fieldValue, priority: Infinity});
                break;
            }
            case FilterType.Regex: {
                const filterRegExp = new RegExp(filter.filterRegExpString, 'i');
                const match = !!String(fieldValue).match(filterRegExp);
                if (match) {
                    accum.push({sectionName: section.name, priority: filterIndex});
                }
                break;
            }
            case FilterType.Includes: {
                let match = false;
                if (Array.isArray(fieldValue)) {
                    match = fieldValue.includes(filter.filterRegExpString);
                } else {
                    match = String(fieldValue).includes(filter.filterRegExpString);
                }

                if (match) {
                    accum.push({sectionName: section.name, priority: filterIndex});
                }
            }
        }

        return accum;
    }, [] as MatchResult[]);

    return sectionNames;
}
