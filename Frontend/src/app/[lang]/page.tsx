// app/[lang]/page.tsx

import { dictionaries } from '@/lib/dictionaries'; // Adjust this path as needed

export default async function HomePage({ params }: { params: { lang: 'en' | 'vi' } }) {
    const t = await dictionaries[params.lang](); // ✅ correct usage
    return (
        <main>
            <h1>{t.title}</h1>
        </main>
    );
}
