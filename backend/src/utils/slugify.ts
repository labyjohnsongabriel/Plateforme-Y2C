export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word characters
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

export const generateUniqueSlug = async (
  baseSlug: string,
  model: any,
  field: string = 'slug'
): Promise<string> => {
  let slug = slugify(baseSlug);
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const existing = await model.findFirst({
      where: {
        [field]: uniqueSlug,
      },
    });

    if (!existing) {
      break;
    }

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};