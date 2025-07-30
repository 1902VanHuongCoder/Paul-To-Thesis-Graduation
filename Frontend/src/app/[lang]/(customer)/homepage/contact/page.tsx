import { Breadcrumb } from "@/components";
import ContactForm from "@/components/ui/contact-form/contact-form";
import darkLogo from "@public/images/dark+logo.png";
import Image from "next/image";
import riceflowericon from "@public/vectors/Rice+Flower+Icon.png";
export default function ContactPage() {
    return (
        <div className="py-10 px-6">
            <Breadcrumb
                items={[
                    { label: "Trang chủ", href: "/" },
                    { label: "Liên hệ" }
                ]}
            />
            <div className="flex items-start justify-between mt-10">
                <div>
                    <div>
                        <Image
                            src={darkLogo}
                            alt="Logo"
                            className="w-64 h-auto mb-4"
                            width={400}
                            height={400}
                        />
                        <Image
                            src={riceflowericon}
                            alt="Rice Flower Icon"
                            className="w-12 h-auto rotate-90 ml-4"
                            width={64}
                            height={64}
                        />
                        <h1 className="text-7xl/20 tracking-wide mb-4">
                            <span className="font-bold text-primary text-shadow-lg text-8xl/30">NFEAM HOUSE</span> BẠN ĐỒNG HÀNH CỦA NHÀ NÔNG 
                        </h1>
                        <p className="text-gray-600 text-xl">
                            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin liên hệ, chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                        </p>
                    </div>
                </div>
                <ContactForm />
            </div>

        </div>
    );
}