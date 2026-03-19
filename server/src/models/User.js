export class User {
  constructor({ username, password, email = null, createdAt = new Date() }) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.createdAt = createdAt;
  }
}