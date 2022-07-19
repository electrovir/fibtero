import {formatDate, isValidDate} from '@packages/common/src/augments/date';
import {JiraIssueType, JiraUser} from '@packages/common/src/data/jira-data';
import {isObject} from 'augment-vir';
import {html} from 'element-vir';
import {TemplateResult} from 'lit';
import {formatDescription} from './description-formatting';

type FieldMapping = {
    shouldUse: (fieldName: string, value: unknown) => boolean;
    formatValue: (value: any, fieldName: string) => string | TemplateResult;
};

const fieldMappings: FieldMapping[] = [
    // user formatting
    {
        shouldUse(fieldName, value) {
            const possibleFieldNames = [
                'assignee',
                'reporter',
                'creator',
            ];
            return (
                possibleFieldNames.includes(fieldName.toLowerCase()) ||
                (isObject(value) && 'accountId' in value && 'avatarUrls' in value)
            );
        },
        formatValue(value: JiraUser | undefined) {
            const imageUrl = value?.avatarUrls['32x32'] ?? '';
            return imageUrl
                ? html`
                      <img
                          title=${value?.displayName}
                          style="height: 32px; width: 32px; border-radius: 50%;"
                          src=${imageUrl}
                      />
                      ${value?.displayName}
                  `
                : html`
                      <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          role="presentation"
                          style="background-color: grey; border-radius: 50%;"
                      >
                          <g fill="white" fill-rule="evenodd">
                              <path
                                  d="M6 14c0-1.105.902-2 2.009-2h7.982c1.11 0 2.009.894 2.009 2.006v4.44c0 3.405-12 3.405-12 0V14z"
                              ></path>
                              <circle cx="12" cy="7" r="4"></circle>
                          </g>
                      </svg>
                  `;
        },
    },
    // description formatting
    {
        shouldUse(fieldName, value) {
            return isObject(value) && (value as any).type === 'doc' && !!(value as any).content;
        },
        formatValue(value) {
            console.log({description: value});
            return formatDescription(value);
        },
    },
    // null formatting
    {
        shouldUse(name, value) {
            return value === null;
        },
        formatValue() {
            return '';
        },
    },
    // number formatting
    {
        shouldUse(name, value) {
            return !isNaN(Number(value));
        },
        formatValue(value: number) {
            return String(value);
        },
    },
    // issue type
    {
        shouldUse(name) {
            return name.toLowerCase() === 'issuetype';
        },
        formatValue(value: JiraIssueType) {
            const typeImageUrl = value.iconUrl;
            return html`
                <img style="height: 16px; width: 16px;" src=${typeImageUrl} />
                ${value.name}
            `;
        },
    },
    // status
    {
        shouldUse(name) {
            const possibleNames = [
                'status',
                'resolution',
            ];
            return possibleNames.includes(name.toLowerCase());
        },
        formatValue(value) {
            return value.name;
        },
    },
    // date formatting
    {
        shouldUse(fieldName, value) {
            const tryDate = new Date(value as any);
            return isValidDate(tryDate);
        },
        formatValue(value) {
            const tryDate = new Date(value);
            return formatDate(tryDate);
        },
    },
    // development formatting
    {
        shouldUse(fieldName, value) {
            return fieldName.toLowerCase() === 'development';
        },
        formatValue(value) {
            return null;
        },
    },
    // generic string formatting
    {
        shouldUse(fieldName, value) {
            return typeof value === 'string';
        },
        formatValue(value) {
            return value;
        },
    },
];

export function getFieldFormatting(
    fieldName: string,
    value: unknown,
): string | TemplateResult | undefined {
    const matchedMapping = fieldMappings.find((mapping) => {
        return mapping.shouldUse(fieldName, value);
    });

    if (matchedMapping) {
        return matchedMapping.formatValue(value, fieldName);
    } else {
        return undefined;
    }
}
