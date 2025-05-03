"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/app/components/ui/form/form";
import Button from "@/app/components/ui/button/button-brand";

interface ReviewFormInputs {
  name: string;
  email: string;
  review: string;
}

export default function ReviewForm() {
  const form = useForm<ReviewFormInputs>({
    defaultValues: {
      name: "",
      email: "",
      review: "",
    },
  });

  const onSubmit: SubmitHandler<ReviewFormInputs> = (data) => {
    console.log("Review Submitted:", data);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6 w-full">
      {/* Section Title */}
      <h2 className="text-2xl font-bold text-gray-800">Leave a Review</h2>
      <p className="text-sm text-gray-600">Your rating of this product *</p>

      {/* Review Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Input */}
          <FormItem>
            <FormLabel>Name *</FormLabel>
            <FormControl>
              <input
                type="text"
                placeholder="Name"
                {...form.register("name", { required: "Name is required" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500/10"
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          {/* Email Input */}
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <input
                type="email"
                placeholder="Email"
                {...form.register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500/10"
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          {/* Review Textarea */}
          <FormItem>
            <FormLabel>Your Review *</FormLabel>
            <FormControl>
              <textarea
                placeholder="Your Review…"
                {...form.register("review", { required: "Review is required" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500/10"
                rows={5}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md">
              Post Review
        
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}