"use client";

import React from "react";
import { Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import Image from "next/image";
import { useForm } from "react-hook-form";
import riceflowericon from "@public/vectors/Rice+Flower+Icon.png";
import Button from "../button/button-brand";
import { Input } from "../input/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../select/select";
import cornimage from '@public/images/Corn+Image.png';
export default function ContactForm() {
    const form = useForm(); // Initialize the form

    const onSubmit = (data: unknown) => {
        console.log(data); // Handle form submission
    };

    const handleSubmit = () => { 
        alert("Form submitted successfully!"); // Show success message
    }

    return (
        <div className="w-[500px]  bg-primary text-white p-8 rounded-lg relative font-sans">
            {/* Header Section */}
            <div className="mb-8 space-y-4">
                <p className="text-yellow-400 text-lg font-mono">Trao niềm tin - nhận niềm vui</p>
                <h1 className="text-4xl font-bold">Liên Hệ Ngay!</h1>
                <p className="text-sm text-gray-300 mt-2">
                    Chúng tôi sẽ phản hồi lại trong vòng 4 giờ thông qua email, cảm ơn bạn đã liên hệ!
                </p>
                <p className="px-2"><Image className="rotate-90" src={riceflowericon} alt="rice flower vector" width={20} /></p>
            </div>

            {/* Form Section */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Name Field */}
                        <FormItem>
                            <FormLabel>Tên của bạn*</FormLabel>
                            <FormControl>
                                <Input type="text" {...form.register("name", { required: "Name is required" })} className="w-full bg-white/10 rounded-full outline-none border-none h-11 focus:bg-white focus:text-black" />
                                {/* <input
                                    type="text"
                                    {...form.register("name", { required: "Name is required" })}
                                    className="w-full bg-white/10 rounded-full outline-none border-none h-11 focus:bg-white focus:text-black"
                                /> */}
                            </FormControl>
                            <FormMessage className="text-red-500">{String(form.formState.errors.name?.message || "")}</FormMessage>
                        </FormItem>

                        {/* Email Field */}
                        <FormItem>
                            <FormLabel>Địa chỉ email*</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    {...form.register("email", { required: "Email is required" })}
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
                                    {...form.register("phone", { required: "Phone number is required" })}
                                    className="w-full bg-white/10 rounded-full outline-none border-none h-11 focus:bg-white focus:text-black"
                                />
                            </FormControl>
                            <FormMessage className="text-red-500">{String(form.formState.errors.phone?.message || "")}</FormMessage>
                        </FormItem>

                        {/* Dropdown Field */}
                        <FormItem>
                            <FormLabel>Bạn cần hỗ trợ?</FormLabel>
                            <FormControl>
                                {/* <select
                                    {...form.register("support", { required: "Please select an option" })}
                                    className="w-full bg-white/10 rounded-full outline-none border-none h-11 focus:bg-white focus:text-black"
                                >
                                    <option value="">Select an option</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="sales">Sales Inquiry</option>
                                    <option value="other">Other</option>
                                </select> */}
                                <Select>
                                    <SelectTrigger className="w-full bg-white/10 rounded-full outline-none border-none !h-11 focus:bg-white focus:text-black placeholder:text-white">
                                        <SelectValue className="text-white" placeholder="Select a fruit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Fruits</SelectLabel>
                                            <SelectItem value="apple">Apple</SelectItem>
                                            <SelectItem value="banana">Banana</SelectItem>
                                            <SelectItem value="blueberry">Blueberry</SelectItem>
                                            <SelectItem value="grapes">Grapes</SelectItem>
                                            <SelectItem value="pineapple">Pineapple</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage className="text-red-500">{String(form.formState.errors.support?.message || "")}</FormMessage>
                        </FormItem>
                    </div>
                    {/* Message Field */}
                    <FormItem>
                        <FormLabel>Tin nhắn</FormLabel>
                        <FormControl>
                            <textarea
                                {...form.register("message")}
                                className="p-2 w-full bg-white/10 rounded-md outline-none border-none focus:bg-white focus:text-black"
                                rows={4}
                            />
                        </FormControl>
                    </FormItem>

                    {/* Checkbox Field */}
                    <FormItem>
                        <FormControl>
                            <label className="flex items-center gap-2">
                                <Input
                                    type="radio"
                                    {...form.register("terms", { required: "You must agree to the terms" })}
                                    className="w-4 h-4 rounded-md bg-secondary/10 text-yellow-400"
                                />
                                <span className="text-sm">
                                    Agree to our <a href="#" className="text-yellow-400 underline">terms and conditions</a>
                                </span>
                            </label>
                        </FormControl>
                        <FormMessage className="text-red-500">{String(form.formState.errors.terms?.message || "")}</FormMessage>
                    </FormItem>

                    {/* Submit Button */}
                    {/* <button
                        type="submit"
                        className="w-full py-3 bg-white text-primary font-bold rounded-md flex items-center justify-center gap-2 hover:bg-gray-200"
                    >
                        Send Message
                        <span className="bg-yellow-400 text-white rounded-full p-2">
                            ➜
                        </span>
                    </button> */}
                    <div className="flex justify-end">    <Button onClick={handleSubmit} size="md" variant="secondary" type="submit"> Gửi liên hệ</Button></div>

                </form>
            </Form>

            {/* Illustration */}
            <div className="absolute top-10 right-10 animate-bounce animate-infinite animate-duration-[2000ms] animate-ease-linear">
                <Image
                    src={cornimage} // Replace with the actual image path
                    alt="Corn Illustration"
                    width={140}
                    height={140}
                />
            </div>
        </div>
    );
}