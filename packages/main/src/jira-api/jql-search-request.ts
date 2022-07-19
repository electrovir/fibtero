import {JiraIssue, JiraJqlSearchRequest, JiraSearchIssuesByLabelRequest} from '@packages/common/src/data/jira-data';
import {get} from '../axios-wrapper';
import {apiRoute} from './jira-routing';

type JiraJqlSearchResponse = {
    expand: string;
    issues: JiraIssue[];
    maxResults: number;
    startAt: number;
    total: number;
};

export async function runJiraJqlSearch(
    request: JiraJqlSearchRequest,
    startAt = 0,
): Promise<JiraIssue[]> {
    if (!request.jql) {
        throw new Error(`jql is required, other requests are not supported at this time.`);
    }

    const startParam = startAt > 0 ? `&startAt=${Number(startAt)}` : '';

    // this high value isn't actually respected by the API, the max seems to be 100
    const maxResults = `&maxResults=200`;

    const url = `https://${request.domain}${apiRoute}search?jql=${request.jql}${startParam}${maxResults}`;

    const result = await get(url, {
        auth: {
            password: request.credentials.apiKey,
            username: request.credentials.username,
        },
    });

    const data = result.data as JiraJqlSearchResponse;

    const allIssues = data.issues;
    // handle pagination
    if (startAt === 0 && allIssues.length < data.total) {
        console.info(`paginating jira request`);
        let lastStartAt = allIssues.length;
        const requests: Promise<JiraIssue[]>[] = [];
        while (lastStartAt < data.total) {
            console.info(`starting ${lastStartAt} / ${data.total}`);
            requests.push(runJiraJqlSearch(request, lastStartAt));
            lastStartAt += data.maxResults;
        }

        const newIssues: JiraIssue[] = (await Promise.all(requests)).flat();
        console.info(`All pagination requests finished`);
        allIssues.push(...newIssues);
    }

    return allIssues;
}


export async function getIssuesByLabel(
    request: JiraSearchIssuesByLabelRequest,
    startAt = 0,
): Promise<JiraIssue[]> {
    if (!request.project) {
        throw new Error(`project is required.`);
    }
    if (!request.label) {
        throw new Error(`label is required.`);
    }
    const jql = `project = ${request.project} AND labels = "${request.label}"`
    const newRequest = {
        domain: request.domain,
        credentials: {
            apiKey: request.credentials.apiKey,
            username: request.credentials.username,
        },
        jql: jql
    };
   
  

    return runJiraJqlSearch(newRequest);
}