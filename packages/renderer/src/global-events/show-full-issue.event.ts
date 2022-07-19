import {JiraIssue} from '@packages/common/src/data/jira-data';
import {defineTypedEvent} from 'element-vir';

export const ShowFullIssueEvent = defineTypedEvent<JiraIssue | undefined>()('show-full-issue');
