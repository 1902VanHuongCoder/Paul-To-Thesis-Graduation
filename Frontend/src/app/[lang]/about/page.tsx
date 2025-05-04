import { dictionaries } from '@/lib/dictionaries';
export default async function AboutPage({ params }: { params: { lang: string } }) {
    const t = await dictionaries[params.lang as 'en' | 'vi'](); 

    return (
        <main>
            <h1>{t.topabout}</h1>
            <p>{t.bottomabout}</p>
        </main>
    );
}