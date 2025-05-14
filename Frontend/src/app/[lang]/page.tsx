import VNPayButton from '@/components/ui/button/vnpay-button';
import { dictionaries } from '@/lib/dictionaries';

export default async function HomePage({ params }: { params: { lang: string } }) {
    const t = await dictionaries[params.lang as 'en' | 'vi']();
    const orderId = "123456"; // Unique order ID
    const amount = 500000; // Amount in VND
    const orderInfo = "Thanh toan don hang 123456"; // Order description
    const bankCode = "VNPAYQR"; // Optional bank code
    const locale = "vn"; // Language (default is "vn")
    return (
        <main>
            <h1>{t.title}</h1>
            <p>{t.description}</p>
            {/* <PayPalButton /> */}
            <VNPayButton orderId={orderId} amount={amount} orderInfo={orderInfo} bankCode={bankCode} locale={locale} />
            <h1>Hello</h1>
        </main>
    );
}
