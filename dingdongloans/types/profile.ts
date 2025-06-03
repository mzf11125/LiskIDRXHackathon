export type UserProfile = {
  display_name: string;
  email: string;
  company_name: string;
  company_position: string;
  company_website: string;
  company_description: string;
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdateRequest = Omit<
  UserProfile,
  "created_at" | "updated_at"
>;