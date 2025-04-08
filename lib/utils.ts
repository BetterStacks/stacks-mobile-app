export function getEmojiFromCode(code: string) {
  const defaultEmoji = "📁";
  try {
    const codePoint = parseInt(code, 16);
    return String.fromCodePoint(codePoint);
  } catch (e) {
    return defaultEmoji;
  }
}

export const selectStackName = (stack: string) => {
  switch (stack) {
    case "Articles":
      return "article";
    case "Products":
      return "product";
    case "Jobs":
      return "job";
    case "Books":
      return "book";
    case "Media":
      return "media";
    case "Documents":
      return "document";
    case "Profiles":
      return "profile";
    case "Stocks":
      return "stock";
    case "Others":
      return "other";
    default:
      return "link";
  }
};
