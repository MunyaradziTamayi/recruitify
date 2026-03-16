import { Injectable } from '@angular/core';

export type UserRole = 'recruiter' | 'employee' | string;

export interface LoggedInUser {
  name?: string;
  email?: string;
  picture?: string;
  role?: UserRole;
  [key: string]: unknown;
}

export interface AccountProfile {
  name: string;
  email: string;
  roleLabel: string;
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  getLoggedInUser(): LoggedInUser | null {
    const raw = sessionStorage.getItem('loggedInUser');
    if (!raw) return null;

    try {
      return JSON.parse(raw) as LoggedInUser;
    } catch {
      return null;
    }
  }

  getAccountProfile(user: LoggedInUser | null): AccountProfile | null {
    if (!user) return null;

    const name = typeof user.name === 'string' && user.name.trim() ? user.name.trim() : 'User';
    const email = typeof user.email === 'string' ? user.email : '';
    const roleLabel =
      typeof user.role === 'string' && user.role.trim()
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : 'User';
    const imageUrl =
      typeof user.picture === 'string' && user.picture.trim()
        ? user.picture
        : 'https://i.pravatar.cc/150?img=33';

    return { name, email, roleLabel, imageUrl };
  }

  logout() {
    sessionStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('pendingGoogleUser');
  }
}

