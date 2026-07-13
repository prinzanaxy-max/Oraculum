import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import {
  changePassword,
  getCurrentAdmin,
  toAdminProfile,
  updateCurrentAdmin,
  uploadProfilePicture,
  type AdminProfile,
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

const defaultProfile: AdminProfile = {
  id: 'local-admin',
  name: 'Allison',
  email: 'allison@oraculum.edu',
  phone: '',
  avatarUrl: 'https://i.pravatar.cc/150?u=allison',
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

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={clsx(
      'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors',
      checked ? 'bg-amber-gold' : 'bg-gray-200'
    )}
    aria-pressed={checked}
  >
    <span
      className={clsx(
        'absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
        checked ? 'translate-x-6' : 'translate-x-1'
      )}
    />
  </button>
);

export const Settings = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
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

  const profileQuery = useQuery({
    queryKey: ['current-admin'],
    queryFn: getCurrentAdmin,
    retry: false,
  });

  const preferencesQuery = useQuery({
    queryKey: ['library-preferences'],
    queryFn: getLibraryPreferences,
    retry: false,
  });

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
      setErrorMessage(null);
      setSuccessMessage('Library preferences saved successfully.');
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error, 'Unable to save library preferences.'));
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrorMessage(null);
      setSuccessMessage('Password updated successfully.');
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error, 'Unable to update password.'));
    },
  });

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentProfile = { ...defaultProfile, ...profileQuery.data, ...profile };
    profileMutation.mutate({
      name: currentProfile.name,
      email: currentProfile.email,
      phone: currentProfile.phone,
      avatarUrl: currentProfile.avatarUrl,
    });
  };

  const handlePreferencesSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    preferencesMutation.mutate({
      ...defaultLibraryPreferences,
      ...preferencesQuery.data,
      ...preferences,
    });
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwords.newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    passwordMutation.mutate(passwords);
  };

  const renderContent = () => {
    const currentProfile = { ...defaultProfile, ...profileQuery.data, ...profile };
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
                <img
                  src={currentProfile.avatarUrl || defaultProfile.avatarUrl}
                  alt={currentProfile.name}
                  className="h-20 w-20 rounded-full object-cover"
                />
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
                Configure loan rules and overdue notifications.
              </p>
            </div>

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

              <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                <div>
                  <p className="text-[14px] font-semibold text-charcoal">Auto-notify on overdue</p>
                  <p className="mt-1 text-[12px] text-gray-500">
                    Send reminders when loans expire.
                  </p>
                </div>
                <Toggle
                  checked={currentPreferences.autoNotifyOverdue}
                  onChange={(checked) =>
                    setPreferences((current) => ({ ...current, autoNotifyOverdue: checked }))
                  }
                />
              </div>
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

            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-[13px] text-gray-500">
              Active session management will appear here once the backend exposes session endpoints.
            </div>
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
          {(profileQuery.isLoading || preferencesQuery.isLoading) && (
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
