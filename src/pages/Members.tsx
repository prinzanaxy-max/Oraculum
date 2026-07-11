import { useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus, Upload, X } from 'lucide-react';
import { createMember, deleteMember, getMembers, updateMember } from '../api/members';
import type { MemberPayload } from '../api/members';
import { useDebounce } from '../hooks/useDebounce';
import type { Member } from '../types';

const emptyForm: MemberPayload = {
  name: '',
  studentId: '',
  email: '',
  phone: '',
  department: '',
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

const getMemberDisplayId = (member: Member) => member.memberId || member.studentId || member.id;
const getRegisterId = (member: Member) => member.registerId || member.studentId || 'N/A';

export const Members = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form, setForm] = useState<MemberPayload>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const {
    data: members = [],
    isLoading,
    isFetching,
    error: listError,
  } = useQuery({
    queryKey: ['members', debouncedSearch],
    queryFn: () => getMembers(debouncedSearch),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: MemberPayload) =>
      editingMember ? updateMember(editingMember.id, payload) : createMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setIsModalOpen(false);
      setEditingMember(null);
      setForm(emptyForm);
      setFormError(null);
    },
    onError: (error) => {
      setFormError(getErrorMessage(error, 'Unable to save member. Please try again.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (member: Member) => deleteMember(member.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setDeleteTarget(null);
      setToastError(null);
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 409) {
        setToastError('This member has active borrows and cannot be removed.');
      } else {
        setToastError(getErrorMessage(error, 'Unable to remove member. Please try again.'));
      }
      setDeleteTarget(null);
    },
  });

  useEffect(() => {
    if (!toastError) return;

    const timeout = window.setTimeout(() => {
      setToastError(null);
    }, 4500);

    return () => window.clearTimeout(timeout);
  }, [toastError]);

  const openAddModal = () => {
    setEditingMember(null);
    setForm(emptyForm);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      studentId: member.studentId || member.memberId,
      email: member.email,
      phone: member.phone ?? '',
      department: member.department ?? '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    saveMutation.mutate(form);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('CSV import selected:', file.name);
    setToastError(`CSV import selected: ${file.name}. Bulk import is not wired yet.`);
    event.target.value = '';
  };

  const listErrorMessage = listError
    ? getErrorMessage(listError, 'Unable to load members. Please try again.')
    : null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-8 font-sans">
      {toastError && (
        <div className="fixed right-6 top-24 z-50 max-w-sm rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-lg">
          {toastError}
        </div>
      )}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-charcoal">Members</h1>
          <p className="mt-1 text-[13px] text-gray-500">
            To create a member and view the member report
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[300px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="search"
              placeholder="Search Member"
              className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-4 pr-11 text-[14px] text-charcoal outline-none transition-all placeholder:text-gray-400 focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
            />
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-gold px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm shadow-amber-gold/20 transition-colors hover:bg-amber-gold/90"
          >
            <UserPlus className="h-4 w-4" />
            Add Members
          </button>

          <button
            type="button"
            onClick={handleImportClick}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-gray-500 transition-colors hover:border-amber-gold/40 hover:text-charcoal"
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImportChange}
          />
        </div>
      </div>

      {listErrorMessage && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {listErrorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-50 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Member ID</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Register ID</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Member</th>
                <th className="px-5 py-4 text-[12px] font-bold text-charcoal">Email ID</th>
                <th className="px-5 py-4 text-right text-[12px] font-bold text-charcoal">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading &&
                Array.from({ length: 7 }).map((_, index) => (
                  <tr key={index} className="border-b border-gray-50 last:border-0">
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-5 py-5">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && members.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <p className="text-[15px] font-semibold text-charcoal">No members yet</p>
                    <p className="mt-1 text-[13px] text-gray-500">add your first member</p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                members.map((member) => (
                  <tr
                    key={member.id}
                    className="group border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/80"
                  >
                    <td className="px-5 py-4 text-[13px] text-gray-600">
                      {getMemberDisplayId(member)}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">
                      {getRegisterId(member)}
                    </td>
                    <td className="px-5 py-4 text-[13px] font-medium text-gray-700">
                      {member.name}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">{member.email}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={() => openEditModal(member)}
                          className="rounded-md bg-gray-500 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-gray-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(member)}
                          className="rounded-md bg-red-400 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-red-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {isFetching && !isLoading && (
          <div className="border-t border-gray-50 px-5 py-3 text-[12px] font-medium text-gray-400">
            Refreshing members...
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-[20px] font-bold text-charcoal">
                  {editingMember ? 'Edit Member' : 'Add Member'}
                </h2>
                <p className="mt-1 text-[13px] text-gray-500">
                  {editingMember
                    ? 'Update this member profile.'
                    : 'Create a new library member profile.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-charcoal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  Full Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                  placeholder="Alfredo Bergson"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                    Student ID
                  </label>
                  <input
                    required
                    value={form.studentId}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, studentId: event.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                    placeholder="3234"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                    placeholder="+1 555 0184"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                  placeholder="alfredo@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  Department
                </label>
                <input
                  required
                  value={form.department}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, department: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none transition-all focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
                  placeholder="Humanities"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-gray-200 px-5 py-2.5 text-[14px] font-semibold text-gray-500 transition-colors hover:text-charcoal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="inline-flex min-w-28 items-center justify-center rounded-full bg-amber-gold px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-amber-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saveMutation.isPending ? 'Saving...' : editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-[18px] font-bold text-charcoal">Remove this member?</h2>
            <p className="mt-2 text-[14px] text-gray-500">
              This action removes {deleteTarget.name} from the members list.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-gray-200 px-5 py-2.5 text-[14px] font-semibold text-gray-500 transition-colors hover:text-charcoal"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget)}
                disabled={deleteMutation.isPending}
                className="rounded-full bg-red-400 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleteMutation.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
