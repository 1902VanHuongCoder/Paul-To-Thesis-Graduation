import { Breadcrumb, CheckoutPage } from "@/components";

const Checkout = () => {
    return (
        <div className="py-10 px-6">
            <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Thực hiện thanh toán" }]} />
            <CheckoutPage />
        </div>
    );
}

export default Checkout; 