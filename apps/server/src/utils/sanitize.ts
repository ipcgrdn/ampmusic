import sanitizeHtml from 'sanitize-html';

export const sanitizeContent = (content: string): string => {
  return sanitizeHtml(content, {
    allowedTags: [], // HTML 태그 모두 제거
    allowedAttributes: {}, // 모든 속성 제거
    disallowedTagsMode: 'recursiveEscape',
    allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
    parser: {
      decodeEntities: true
    }
  });
}; 