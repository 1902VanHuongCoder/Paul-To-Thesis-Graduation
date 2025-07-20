"use client";
import React, { useState } from "react";
import { Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import Image from "next/image";
import { useForm } from "react-hook-form";
import riceflowericon from "@public/vectors/Rice+Flower+Icon.png";
import Button from "../button/button-brand";
import { Input } from "../input/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../select/select";
import { useUser } from "@/contexts/user-context";
import TermsAndPrivacyDialog from "@/components/section/terms-and-privacy-policy/terms-and-privacy-policy";
import { createNewContact } from "@/lib/contact-apis";

interface ContactFormValues {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    terms: boolean;
}

export default function ContactForm() {
    // Contexts 
    const { user } = useUser();

    // State variables
    const form = useForm<ContactFormValues>(); // Intialize form with ContactFormValues type
    const [successMsg, setSuccessMsg] = useState(""); // State for success message 
    const [errorMsg, setErrorMsg] = useState(""); // State for error message 
    const [loading, setLoading] = useState(false); // State for loading status
    const [openTermsAndPolicy, setOpenTermsAndPolicy] = useState(false); // State for terms and policy dialog visibility

    // Function to handle form submission
    const onSubmit = async (data: ContactFormValues) => {
        if (!user || !user.userID) {
            setErrorMsg("Bạn cần đăng nhập để gửi liên hệ.");
            return;
        }
        setSuccessMsg("");
        setErrorMsg("");
        setLoading(true);
        try {
            await createNewContact({
                userID: user.userID,
                subject: data.subject,
                message: data.message,
            });
            setSuccessMsg("Gửi liên hệ thành công! Chúng tôi sẽ phản hồi qua email.");
            form.reset();
        } catch (err) {
            setErrorMsg(
                err && typeof err === "object" && "message" in err
                    ? String((err as { message?: string }).message)
                    : "Có lỗi xảy ra."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-w-[500px] bg-primary text-white p-8 rounded-lg relative font-sans">
            {/* Header Section */}
            <div className="mb-8 space-y-4">
                <p className="text-yellow-400 text-lg font-mono">Trao niềm tin - nhận niềm vui</p>
                <h1 className="text-4xl font-bold">Liên Hệ Ngay!</h1>
                <p className="text-sm text-gray-300 mt-2">
                    Chúng tôi sẽ phản hồi lại trong vòng 4 giờ thông qua email, cảm ơn bạn đã liên hệ!
                </p>
                <p className="px-2">
                    <Image className="rotate-90" src={riceflowericon} alt="rice flower vector" width={20} />
                </p>
            </div>

            {/* Form Section */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Name Field */}
                        <FormItem>
                            <FormLabel>Tên của bạn*</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    {...form.register("name", { required: "Tên không được để trống." })}
                                    className="w-full bg-white/10 rounded-full outline-none border-none h-11 focus:bg-white focus:text-black"
                                />
                            </FormControl>
                            <FormMessage className="text-red-500">{String(form.formState.errors.name?.message || "")}</FormMessage>
                        </FormItem>

                        {/* Email Field */}
                        <FormItem>
                            <FormLabel>Địa chỉ email*</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    {...form.register("email", { required: "Địa chỉ email không được để trống." })}
                                    className="w-full bg-white/10 rounded-full outline-none border-none h-11 focus:bg-white focus:text-black"
                                />
                            </FormControl>
                            <FormMessage className="text-red-500">{String(form.formState.errors.email?.message || "")}</FormMessage>
                        </FormItem>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Phone Field */}
                        <FormItem>
                            <FormLabel>Số điện thoại*</FormLabel>
                            <FormControl>
                                <Input
                                    type="tel"
                                    {...form.register("phone", { required: "Số điện thoại không được để trống." })}
                                    className="w-full bg-white/10 rounded-full outline-none border-none h-11 focus:bg-white focus:text-black"
                                />
                            </FormControl>
                            <FormMessage className="text-red-500">{String(form.formState.errors.phone?.message || "")}</FormMessage>
                        </FormItem>

                        {/* Dropdown Field */}
                        <FormItem>
                            <FormLabel>Bạn cần hỗ trợ?</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={value => form.setValue("subject", value)}
                                    value={form.watch("subject")}
                                >
                                    <SelectTrigger className="w-full bg-white/10 rounded-full outline-none border-none !h-11 focus:bg-white focus:text-black placeholder:text-white">
                                        <SelectValue className="text-white" placeholder="Chọn chủ đề" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Chủ đề</SelectLabel>
                                            <SelectItem value="Hỗ trợ kỹ thuật">Hỗ trợ kỹ thuật</SelectItem>
                                            <SelectItem value="Tư vấn bán hàng">Tư vấn bán hàng</SelectItem>
                                            <SelectItem value="Khác">Khác</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage className="text-red-500">{String(form.formState.errors.subject?.message || "")}</FormMessage>
                        </FormItem>
                    </div>
                    {/* Message Field */}
                    <FormItem>
                        <FormLabel>Tin nhắn</FormLabel>
                        <FormControl>
                            <textarea
                                {...form.register("message", { required: "Vui lòng nhập tin nhắn" })}
                                className="p-2 w-full bg-white/10 rounded-md outline-none border-none focus:bg-white focus:text-black"
                                rows={4}
                            />
                        </FormControl>
                        <FormMessage className="text-red-500">{String(form.formState.errors.message?.message || "")}</FormMessage>
                    </FormItem>

                    {/* Checkbox Field */}
                    <FormItem>
                        <FormControl>
                            <label className="flex items-center gap-2">
                                <Input
                                    type="checkbox"
                                    {...form.register("terms", { required: "Bạn phải đồng ý với điều khoản" })}
                                    className="w-4 h-4 rounded-md bg-secondary/10 text-yellow-400"
                                />
                                <span className="text-sm">
                                    <span>Đồng ý với </span><button onClick={() => setOpenTermsAndPolicy(true)} type="button" className="text-secondary hover:underline font-semibold cursor-pointer">Điều khoản và quy định</button>
                                </span>
                            </label>
                        </FormControl>
                        <FormMessage className="text-red-500">{String(form.formState.errors.terms?.message || "")}</FormMessage>
                    </FormItem>

                    <div className="flex justify-end">
                        <Button size="md" variant="secondary" type="submit" disabled={loading}>
                            {loading ? "Đang gửi..." : "Gửi liên hệ"}
                        </Button>
                    </div>
                    {successMsg && <div className="text-green-400 text-center">{successMsg}</div>}
                    {errorMsg && <div className="text-red-400 text-center">{errorMsg}</div>}
                </form>
            </Form>
            <TermsAndPrivacyDialog open={openTermsAndPolicy} setOpen={setOpenTermsAndPolicy} />
        </div>
    );
}