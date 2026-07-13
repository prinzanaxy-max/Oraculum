import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Camera, Laptop, Monitor, Smartphone, Tablet } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { useCurrentAdminProfile } from '../hooks/useCurrentAdminProfile';
import { resolveProfileAvatarUrl } from '../utils/profileAvatar';
import {
  changePassword,
  getAuthSessions,
  revokeAuthSession,
  revokeOtherAuthSessions,
  toAdminProfile,
  updateCurrentAdmin,
  uploadProfilePicture,
  type AdminProfile,
  type AuthSession,
  type ChangePasswordPayload,
} from '../api/auth';
import {
  defaultLibraryPreferences,
  getLibraryPreferences,
  updateLibraryPreferences,
  type LibraryPreferences,
} from '../api/settings';

type SettingsTab = 'profile' | 'library' | 'security';

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: 'profile', label: 'Profile' },
  { id: 'library', label: 'Library Preferences' },
  { id: 'security', label: 'Security' },
];

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const formatSessionDate = (value: string) => format(new Date(value), 'MMM d, yyyy h:mm a');

const getSessionDeviceIcon = (deviceLabel?: string) => {
  switch (deviceLabel) {
    case 'Mobile device':
      return Smartphone;
    case 'Tablet':
      return Tablet;
    case 'Desktop browser':
      return Monitor;
    default:
      return Laptop;
  }
};

const defaultProfile: Omit<AdminProfile, 'avatarUrl'> = {
  id: 'local-admin',
  name: 'Allison',
  email: 'allison@oraculum.edu',
  phone: '',
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const setAuth = useAuthStore((state) => state.setAuth);
  const authUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [profile, setProfile] = useState<Partial<AdminProfile>>({});
  const [preferences, setPreferences] = useState<Partial<LibraryPreferences>>({});
  const [passwords, setPasswords] = useState<ChangePasswordPayload>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  const profileQuery = useCurrentAdminProfile();

  const preferencesQuery = useQuery({
    queryKey: ['library-preferences'],
    queryFn: getLibraryPreferences,
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (
      preferencesQuery.error instanceof AxiosError &&
      preferencesQuery.error.response?.status === 401
    ) {
      logout();
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [preferencesQuery.error, logout, navigate, location]);

  const sessionsQuery = useQuery({
    queryKey: ['auth-sessions', refreshToken],
    queryFn: () => getAuthSessions(refreshToken),
    enabled: activeTab === 'security' && Boolean(token),
  });

  useEffect(() => {
    if (
      sessionsQuery.error instanceof AxiosError &&
      sessionsQuery.error.response?.status === 401
    ) {
      logout();
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [sessionsQuery.error, logout, navigate, location]);

  useEffect(() => {
    if (!successMessage) return;

    const timeout = window.setTimeout(() => setSuccessMessage(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const profileMutation = useMutation({
    mutationFn: updateCurrentAdmin,
    onSuccess: (updatedProfile) => {
      setProfile(updatedProfile);
      if (token) {
        setAuth(token, updatedProfile, refreshToken ?? undefined);
      }
      setErrorMessage(null);
      setSuccessMessage('Profile saved successfully.');
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error, 'Unable to save profile changes.'));
    },
  });

  const avatarUploadMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: (response) => {
      const updatedProfile = toAdminProfile(response.user);
      setProfile(updatedProfile);
      if (token) {
        setAuth(token, updatedProfile, refreshToken ?? undefined);
      }
      queryClient.setQueryData(['current-admin'], updatedProfile);
      setErrorMessage(null);
      setSuccessMessage('Profile picture updated.');
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error, 'Failed to upload profile picture.'));
    },
  });

  const validateAvatarFile = (file: File | undefined): string | null => {
    if (!file) {
      return 'Please select an image to upload.';
    }

    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file.';
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return 'Image must be 5MB or smaller.';
    }

    return null;
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!file) return;

    setErrorMessage(null);
    avatarUploadMutation.mutate(file);
  };

  const preferencesMutation = useMutation({
    mutationFn: updateLibraryPreferences,
    onSuccess: (updatedPreferences) => {
      setPreferences(updatedPreferences);
      queryClient.setQueryData(['library-preferences'], updatedPreferences);
      setErrorMessage(null);
      setSuccessMessage('Library preferences saved successfully.');
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        logout();
        navigate('/login', { state: { from: location }, replace: true });
        return;
      }

      setErrorMessage(getErrorMessage(error, 'Unable to save library preferences.'));
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrorMessage(null);
      setSuccessMessage('Password changed successfully.');
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        setErrorMessage('Current password is incorrect.');
        return;
      }

      setErrorMessage(getErrorMessage(error, 'Unable to update password.'));
    },
  });

  const handleUnauthorized = (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      logout();
      navigate('/login', { state: { from: location }, replace: true });
      return true;
    }

    return false;
  };

  const revokeSessionMutation = useMutation({
    mutationFn: revokeAuthSession,
    onMutate: (sessionId) => {
      setRevokingSessionId(sessionId);
    },
    onSuccess: (_, sessionId) => {
      const revokedSession = sessionsQuery.data?.find((session) => session.id === sessionId);

      if (revokedSession?.current) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      setErrorMessage(null);
      setSuccessMessage('Session revoked.');
      queryClient.invalidateQueries({ queryKey: ['auth-sessions'] });
    },
    onError: (error) => {
      if (handleUnauthorized(error)) return;

      if (error instanceof AxiosError && error.response?.status === 404) {
        setErrorMessage('Session not found or already revoked.');
        queryClient.invalidateQueries({ queryKey: ['auth-sessions'] });
        return;
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        setErrorMessage('Something went wrong. Please try again.');
        return;
      }

      setErrorMessage(getErrorMessage(error, 'Unable to revoke session.'));
    },
    onSettled: () => {
      setRevokingSessionId(null);
    },
  });

  const revokeOtherSessionsMutation = useMutation({
    mutationFn: revokeOtherAuthSessions,
    onSuccess: () => {
      setErrorMessage(null);
      setSuccessMessage('Signed out other sessions.');
      queryClient.invalidateQueries({ queryKey: ['auth-sessions'] });
    },
    onError: (error) => {
      if (handleUnauthorized(error)) return;

      if (error instanceof AxiosError && error.response?.status === 500) {
        setErrorMessage('Something went wrong. Please try again.');
        return;
      }

      setErrorMessage(getErrorMessage(error, 'Unable to revoke other sessions.'));
    },
  });

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentProfile = { ...defaultProfile, ...profileQuery.data, ...profile };
    profileMutation.mutate({
      name: currentProfile.name,
      email: currentProfile.email,
      phone: currentProfile.phone,
      avatarUrl: resolveProfileAvatarUrl(
        profile.avatarUrl,
        profileQuery.data?.avatarUrl,
        authUser?.avatarUrl
      ),
    });
  };

  const handlePreferencesSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const currentPreferences = {
      ...defaultLibraryPreferences,
      ...preferencesQuery.data,
      ...preferences,
    };

    const { loanPeriodDays, finePerDay, maxReservationsPerMember } = currentPreferences;

    if (!Number.isFinite(loanPeriodDays) || loanPeriodDays < 1) {
      setErrorMessage('Loan period must be at least 1 day.');
      return;
    }

    if (!Number.isFinite(finePerDay) || finePerDay < 0) {
      setErrorMessage('Fine per day must be 0 or greater.');
      return;
    }

    if (!Number.isFinite(maxReservationsPerMember) || maxReservationsPerMember < 0) {
      setErrorMessage('Max reservations per member must be 0 or greater.');
      return;
    }

    setErrorMessage(null);
    preferencesMutation.mutate({
      loanPeriodDays,
      finePerDay,
      maxReservationsPerMember,
    });
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwords.currentPassword.trim()) {
      setErrorMessage('Current password is required.');
      return;
    }

    if (!passwords.newPassword.trim()) {
      setErrorMessage('New password is required.');
      return;
    }

    if (passwords.newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (!passwords.confirmPassword.trim()) {
      setErrorMessage('Please confirm your new password.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    setErrorMessage(null);
    passwordMutation.mutate(passwords);
  };

  const handleRevokeOtherSessions = () => {
    if (!refreshToken) {
      setErrorMessage('Unable to identify the current session. Please sign in again.');
      return;
    }

    setErrorMessage(null);
    revokeOtherSessionsMutation.mutate(refreshToken);
  };

  const renderSessionRow = (session: AuthSession) => {
    const SessionIcon = getSessionDeviceIcon(session.deviceLabel);
    const isRevoking = revokingSessionId === session.id;

    return (
      <div
        key={session.id}
        className="flex flex-col gap-3 rounded-xl border border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <SessionIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[14px] font-semibold text-charcoal">
                {session.current ? 'Current session' : 'Active session'}
              </p>
              {session.current && (
                <span className="rounded-full bg-amber-gold/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-gold">
                  CURRENT
                </span>
              )}
            </div>
            {session.deviceLabel && (
              <p className="mt-1 text-[13px] text-gray-600">{session.deviceLabel}</p>
            )}
            <p className="mt-1 text-[12px] text-gray-500">
              Last used {formatSessionDate(session.lastUsedAt)}
            </p>
            <p className="text-[12px] text-gray-400">
              Created {formatSessionDate(session.createdAt)} · Expires{' '}
              {formatSessionDate(session.expiresAt)}
            </p>
          </div>
        </div>

        {!session.current && (
          <button
            type="button"
            onClick={() => revokeSessionMutation.mutate(session.id)}
            disabled={isRevoking}
            className="rounded-full border border-red-200 px-4 py-2 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-70"
          >
            {isRevoking ? 'Signing out...' : 'Sign out'}
          </button>
        )}
      </div>
    );
  };

  const renderContent = () => {
    const currentProfile = { ...defaultProfile, ...profileQuery.data, ...profile };
    const profileAvatarUrl = resolveProfileAvatarUrl(
      profile.avatarUrl,
      profileQuery.data?.avatarUrl,
      authUser?.avatarUrl
    );
    const profileInitial = (currentProfile.name || authUser?.name || 'A').charAt(0).toUpperCase();
    const currentPreferences = {
      ...defaultLibraryPreferences,
      ...preferencesQuery.data,
      ...preferences,
    };

    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="relative">
                {profileAvatarUrl ? (
                  <img
                    src={profileAvatarUrl}
                    alt={currentProfile.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-gold/15 text-[24px] font-semibold text-amber-gold">
                    {profileInitial}
                  </div>
                )}
                {avatarUploadMutation.isPending && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-[11px] font-semibold text-white">
                    Uploading...
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploadMutation.isPending}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-gold text-white shadow-sm transition-colors hover:bg-amber-gold/90 disabled:opacity-70"
                  aria-label="Upload profile picture"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-charcoal">Profile</h2>
                <p className="mt-1 text-[13px] text-gray-500">Update your visible admin details.</p>
                <p className="mt-2 text-[12px] text-gray-400">PNG, JPG, or GIF up to 5MB.</p>
              </div>
            </div>

            <div className="grid gap-5">
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  Full Name
                </span>
                <input
                  required
                  value={currentProfile.name}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, name: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={currentProfile.email}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, email: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  Phone
                </span>
                <input
                  value={currentProfile.phone ?? ''}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                  placeholder="+1 555 0100"
                />
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileMutation.isPending}
                className="rounded-full bg-amber-gold px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-amber-gold/90 disabled:opacity-70"
              >
                {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        );

      case 'library':
        return (
          <form onSubmit={handlePreferencesSubmit} className="space-y-6">
            <div>
              <h2 className="text-[18px] font-bold text-charcoal">Library Preferences</h2>
              <p className="mt-1 text-[13px] text-gray-500">
                Configure loan rules and reservation limits.
              </p>
            </div>

            {preferencesQuery.isLoading && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-[13px] text-gray-500">
                Loading library preferences...
              </div>
            )}

            {preferencesQuery.isError && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                {getErrorMessage(preferencesQuery.error, 'Unable to load library preferences.')}
              </div>
            )}

            {preferencesQuery.isSuccess && (
              <>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  Loan Period (days)
                </span>
                <input
                  type="number"
                  min={1}
                  value={currentPreferences.loanPeriodDays}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      loanPeriodDays: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  Fine Per Day
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={currentPreferences.finePerDay}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      finePerDay: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  Max Reservations Per Member
                </span>
                <input
                  type="number"
                  min={0}
                  value={currentPreferences.maxReservationsPerMember}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      maxReservationsPerMember: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                />
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={preferencesMutation.isPending}
                className="rounded-full bg-amber-gold px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-amber-gold/90 disabled:opacity-70"
              >
                {preferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
              </>
            )}
          </form>
        );

      case 'security':
        return (
          <div className="space-y-8">
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <h2 className="text-[18px] font-bold text-charcoal">Change Password</h2>
                <p className="mt-1 text-[13px] text-gray-500">
                  Use at least 8 characters for your new password.
                </p>
              </div>

              <div className="grid gap-5">
                {[
                  ['currentPassword', 'Current Password'],
                  ['newPassword', 'New Password'],
                  ['confirmPassword', 'Confirm New Password'],
                ].map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                      {label}
                    </span>
                    <input
                      required
                      type="password"
                      value={passwords[key as keyof ChangePasswordPayload]}
                      onChange={(event) =>
                        setPasswords((current) => ({ ...current, [key]: event.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                    />
                  </label>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordMutation.isPending}
                  className="rounded-full bg-amber-gold px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-amber-gold/90 disabled:opacity-70"
                >
                  {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>

            <section className="space-y-4 border-t border-gray-100 pt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[18px] font-bold text-charcoal">Active Sessions</h2>
                  <p className="mt-1 text-[13px] text-gray-500">
                    Review devices signed in to your account and sign out sessions you no longer
                    recognize.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRevokeOtherSessions}
                  disabled={
                    revokeOtherSessionsMutation.isPending ||
                    !refreshToken ||
                    (sessionsQuery.data?.filter((session) => !session.current).length ?? 0) === 0
                  }
                  className="rounded-full border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:bg-gray-50 disabled:opacity-70"
                >
                  {revokeOtherSessionsMutation.isPending
                    ? 'Signing out...'
                    : 'Sign out all other sessions'}
                </button>
              </div>

              {sessionsQuery.isLoading && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-[13px] text-gray-500">
                  Loading active sessions...
                </div>
              )}

              {sessionsQuery.isError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                  {getErrorMessage(sessionsQuery.error, 'Unable to load active sessions.')}
                </div>
              )}

              {sessionsQuery.isSuccess && sessionsQuery.data.length === 0 && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-[13px] text-gray-500">
                  No active sessions found.
                </div>
              )}

              {sessionsQuery.isSuccess && sessionsQuery.data.length > 0 && (
                <div className="space-y-3">{sessionsQuery.data.map(renderSessionRow)}</div>
              )}
            </section>
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8 font-sans">
      {successMessage && (
        <div className="fixed right-6 top-24 z-50 rounded-xl border border-amber-gold/20 bg-amber-gold/10 px-4 py-3 text-sm font-medium text-charcoal shadow-lg">
          {successMessage}
        </div>
      )}

      <div>
        <h1 className="text-[20px] font-bold text-charcoal">Settings</h1>
        <p className="mt-1 text-[13px] text-gray-500">
          Manage your account and library preferences
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="grid overflow-hidden rounded-2xl border border-gray-50 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:grid-cols-[220px_1fr]">
        <aside className="border-b border-gray-100 p-4 lg:border-b-0 lg:border-r">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setErrorMessage(null);
                }}
                className={clsx(
                  'whitespace-nowrap rounded-xl px-4 py-3 text-left text-[14px] font-semibold transition-colors lg:border-l-4',
                  activeTab === tab.id
                    ? 'border-amber-gold bg-amber-gold/10 text-charcoal'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-charcoal'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="p-4 sm:p-6 lg:p-8">
          {(profileQuery.isLoading && activeTab === 'profile') && (
            <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">
              Loading saved settings...
            </div>
          )}
          {renderContent()}
        </section>
      </div>
    </div>
  );
};
