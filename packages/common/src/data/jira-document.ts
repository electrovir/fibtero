export type JiraDocument =
    | JiraDocumentDoc
    | JiraDocumentWithContent
    | JiraDocumentWithText
    | JiraDocumentMediaSingle
    | JiraDocumentMedia
    | JiraDocumentInlineCard;

export type JiraDocumentDoc = {
    version: number;
    type: 'doc';
    content: JiraDocument[];
};

export type JiraDocumentWithContent = {
    type: 'paragraph' | 'orderedList' | 'listItem' | 'bulletList';
    content: JiraDocument[];
};

export type JiraDocumentWithText = {
    type: 'text';
    text: string;
    marks?: (
        | {
              type: 'code';
          }
        | JiraDocumentLink
    )[];
};

export type JiraDocumentMediaSingle = {
    type: 'mediaSingle';
    attrs: {
        layout: 'align-start' | string;
    };
};

export type JiraDocumentInlineCard = {
    type: 'inlineCard';
    attrs: {
        url: string;
    };
};

export type JiraDocumentMedia = {
    type: 'media';
    attrs: {
        id: string;
        type: 'file' | string;
        collection: string;
        width: number;
        height: number;
    };
};

export type JiraDocumentLink = {
    type: 'link';
    attrs: {
        href: string;
    };
};
