import { styles } from './styles';

export const markdownStyles = {
  body: {
    ...styles.messageText,
    marginTop: 0,
    paddingTop: 0,
  },
  link: styles.markdownLink,
  code_inline: styles.markdownCodeInline,
  code_block: styles.markdownCodeBlock,
  fence: styles.markdownCodeBlock,
  bullet_list: styles.markdownList,
  ordered_list: styles.markdownList,
  bullet_list_icon: styles.markdownListIcon,
  strong: styles.markdownBold,
  em: styles.markdownItalic,
  heading1: styles.markdownH1,
  heading2: styles.markdownH2,
  heading3: styles.markdownH3,
  heading4: styles.markdownH4,
  heading5: styles.markdownH5,
  heading6: styles.markdownH6,
  paragraph: styles.markdownParagraph,
}; 