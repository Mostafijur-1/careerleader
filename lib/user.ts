export type UserType = 'student' | 'mentor' | 'admin';

export interface BaseUser {
  _id?: string;
  email: string;
  password: string;
  type: UserType;
  name: string;
}

export interface StudentUser extends BaseUser {
  type: 'student';
}

export type MentorEducation = {
  degree: string;
  institution: string;
  year?: string;
};

export type MentorExperience = {
  title: string;
  organization: string;
  period: string;
  summary?: string;
};

export type MentorCurrentJob = {
  title: string;
  company: string;
};

export interface MentorUser extends BaseUser {
  type: 'mentor';
  expertise: string[];
  active: boolean;
  /** Matches ids in `data/careers.json` (e.g. c1, c2). Used to show mentors per career track. */
  careerIds?: string[];
  headline?: string;
  education?: MentorEducation[];
  currentJob?: MentorCurrentJob | null;
  experience?: MentorExperience[];
  bio?: string;
  rating?: number;
  reviewCount?: number;
  recommended?: boolean;
}

export interface AdminUser extends BaseUser {
  type: 'admin';
  role: string;
}

export type User = StudentUser | MentorUser | AdminUser;
