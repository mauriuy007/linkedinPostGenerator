export const formatPostContent = (content) =>
  content
    .split('\n')
    .filter(Boolean)
    .map((paragraph, index) => ({ key: `${paragraph}-${index}`, text: paragraph }));
