export const resolveProfileAvatarUrl = (
  ...sources: Array<string | null | undefined>
): string | undefined => {
  for (const source of sources) {
    if (source?.trim()) {
      return source;
    }
  }

  return undefined;
};
