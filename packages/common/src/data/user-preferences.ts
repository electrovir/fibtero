import {JiraView} from './jira-view';
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
    lastViewId: string;
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
    lastPage: MainRendererPage.Home,
    lastViewId: '',
} as const;

export function isValidUserPreferences(input: any): input is UserPreferences {
    if (!matchesShallowObjectSignature(input, emptyUserPreferences)) {
        return false;
    }

    return true;
}
