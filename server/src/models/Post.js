export class Post {
  constructor({
    title,
    content,
    authorUsername,
    createdAt = new Date(),
    published = false,
  }) {
    this.title = title;
    this.content = content;
    this.authorUsername = authorUsername;
    this.createdAt = createdAt;
    this.published = published;
  }
}