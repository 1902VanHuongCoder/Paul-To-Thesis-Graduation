import PayPalButton from '@/components/ui/button/paypal-button';
import { dictionaries } from '@/lib/dictionaries';

export default async function HomePage({ params }: { params: { lang: string } }) {
    const t = await dictionaries[params.lang as 'en' | 'vi']();

    return (
        <main>
            <h1>{t.title}</h1>
            <p>{t.description}</p>
            <PayPalButton />
            <h1>Hello</h1>
        </main>
    );
}
