import { PostError } from '../errors/PostError.js';

export class Post {
  constructor({
    id,
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

  static validateTitle = title => {
    if (!title || title.trim().length < 5) {
        throw new PostError('Title must have at least 5 characters');
    }
    if (!content) {
        throw new PostError('Content is required');
    }
  }
}