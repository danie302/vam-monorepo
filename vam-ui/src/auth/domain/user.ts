/** The signed-in user, as the UI knows it. Plain data: no framework. */
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
