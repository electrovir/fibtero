import {FullJiraIssue} from '@packages/common/src/data/jira-data';
import {defineTypedEvent} from 'element-vir';

export const ShowFullIssueEvent = defineTypedEvent<FullJiraIssue | undefined>()('show-full-issue');
