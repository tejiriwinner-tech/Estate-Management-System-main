export interface EstateMemberRecord {
  id: number;
  name: string;
  house_no: string;
  date_moved_in: string;
  avatar_url?: string;
}

export interface NewMemberInput {
  name: string;
  email: string;
  house_no: string;
  date_moved_in: string; // yyyy-mm-dd or empty
}
