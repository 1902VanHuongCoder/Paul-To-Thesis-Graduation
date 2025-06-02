function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD") // Decompose accents
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except space and hyphen
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }
  
  export default generateSlug;