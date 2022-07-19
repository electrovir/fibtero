import {
    FilterType,
    JiraView,
    JiraViewSection,
    JiraViewSectionFilter,
} from '@packages/common/src/data/jira-view/jira-view';

/** WARNING: this mutates the input! Returns true if mutations happened */
export function updateJiraViews(views: JiraView[]): boolean {
    let didMutate = false;
    views.forEach((view) => {
        if (updateJiraView(view)) {
            didMutate = true;
        }
    });
    views.map((v) => {
        v.sections.map((s) => {
            s.requirements.map((r) => {
                if (!r.filterType) {
                    r.filterType = FilterType.Regex;
                }
            });
        });
    });

    return didMutate;
}

function updateJiraView(view: JiraView): boolean {
    let didMutate = false;

    view.sections.forEach((section) => {
        if (updateJiraViewSection(section)) {
            didMutate = true;
        }
    });

    return didMutate;
}

function updateJiraViewSection(section: JiraViewSection): boolean {
    let didMutate = false;
    section.requirements.forEach((filter) => {
        if (updateJiraViewSectionFilter(filter)) {
            didMutate = true;
        }
    });

    if (!section.dragIn) {
        section.dragIn = [];
        didMutate = true;
    }
    if (!section.dragOut) {
        section.dragOut = [];
        didMutate = true;
    }

    return didMutate;
}

function updateJiraViewSectionFilter(filter: JiraViewSectionFilter): boolean {
    let didMutate = false;

    if (!filter.filterType) {
        filter.filterType = FilterType.Regex;
        didMutate = true;
    }

    return didMutate;
}
