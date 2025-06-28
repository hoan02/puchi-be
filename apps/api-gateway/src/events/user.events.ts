export interface GetUserProfileEvent {
  userId: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  username?: string;
} 