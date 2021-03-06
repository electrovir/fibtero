import {JiraIssueFields} from './jira-data';
import {JiraView} from './jira-view/jira-view';
import {MainRendererPage} from './main-renderer-page';
import {matchesShallowObjectSignature} from './object-validator';

export type WindowPosition = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type UserPreferences = {
    startupWindowPosition: WindowPosition & {
        useLast: boolean;
    };
    views: Readonly<Readonly<JiraView>[]>;
    lastPage: MainRendererPage;
    lastViewIndex: number;
    fieldMapping: Record<string, string>;
    fieldVisibility: Record<keyof JiraIssueFields, boolean>;
    knownTypes: string[];
};

export const emptyUserPreferences: UserPreferences = {
    startupWindowPosition: {
        x: -1,
        y: -1,
        width: -1,
        height: -1,
        useLast: true,
    },
    views: [],
    lastPage: MainRendererPage.Auth,
    lastViewIndex: 0,
    fieldMapping: {},
    fieldVisibility: {},
    knownTypes: [] as string[],
} as const;

export function isValidUserPreferences(input: any): input is UserPreferences {
    if (!matchesShallowObjectSignature(input, emptyUserPreferences)) {
        return false;
    }

    return true;
}
