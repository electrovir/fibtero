import {isEnumValue, isObject} from 'augment-vir';
import {hasProperty} from '../../augments/object';
import {FilterType, JiraView, ViewDirection} from './jira-view';
import {IssueDragging, IssueDragOperation} from './view-issue-dragging';

export function serializeJiraView(input: Readonly<JiraView>): string {
    try {
        return JSON.stringify(input);
    } catch (error) {
        console.error(error);
        return `ERROR: failed to serialize jira view.`;
    }
}

function validateDragging(draggingDefinitions: IssueDragging[], propName: string): string[] {
    const errors: string[] = [];
    if (!Array.isArray(draggingDefinitions)) {
        return [`invalid issue dragging definition for ${propName}`];
    }

    draggingDefinitions.forEach((dragging) => {
        if (!isObject(dragging)) {
            errors.push(`${propName} should be an object`);
        }
        const props = [
            'operation',
            'fieldName',
            'value',
        ];

        props.forEach((prop) => {
            if (!hasProperty(dragging, prop)) {
                errors.push(`${propName} missing ${prop} property`);
            }
        });

        if (!isEnumValue(dragging.operation, IssueDragOperation)) {
            errors.push(`${propName} operation is not valid.`);
        }
    });

    return errors;
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
        errors.push(...validateDragging(section.dragIn, 'dragIn'));
        errors.push(...validateDragging(section.dragOut, 'dragOut'));

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
            if (!filter.filterType) {
                errors.push(`missing filter type`);
            }
            if (filter.filterType === FilterType.Regex && !filter.filterRegExpString) {
                errors.push(`Missing RegExp string ${onFilter}`);
            }
        });
    });

    return errors.join('\n');
}
