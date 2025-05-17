import VNPayButton from '@/components/ui/button/vnpay-button';
import { dictionaries } from '@/lib/dictionaries';

export default async function HomePage({ params }: { params: { lang: string } }) {
    const t = await dictionaries[params.lang as 'en' | 'vi']();
    const orderId = "15"; // Unique order ID
    const amount = 600000; // Amount in VND
    const orderInfo = "Thanh toan don hang 123456"; // Order description
    const bankCode = "NCB"; // Optional bank code
    const locale = "vn"; // Language (default is "vn")
    return (
        <main>
            <h1>{t.title}</h1>
            <p>{t.description}</p>
            {/* <PayPalButton /> */}
            <VNPayButton orderId={orderId} amount={amount} orderDescription={orderInfo} bankCode={bankCode} language={locale} />
            <h1>Hello</h1>
        </main>
    );
}
