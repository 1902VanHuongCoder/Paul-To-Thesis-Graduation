function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-") // Replace spaces and non-word chars with -
      .replace(/^-+|-+$/g, "");  // Remove leading/trailing hyphens
  }

export default generateSlug;