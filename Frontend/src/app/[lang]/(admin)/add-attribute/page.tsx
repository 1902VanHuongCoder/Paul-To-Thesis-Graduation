"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import {baseUrl} from "@/lib/base-url";
type AttributeFormValues = {
  categoryID: string;
  name: string;
  label: string;
  data_type: string;
  required: boolean;
  default_value: string;
  placeholder: string;
  unit: string;
  options: string;
  order: number;
  is_active: boolean;
};

type Category = {
  categoryID: number;
  categoryName: string;
};

export default function AddAttributePage() {
  const methods = useForm<AttributeFormValues>();
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch(`${baseUrl}/api/category`)
      .then((res) => res.json())
      .then((data) => setCategories(data || []));
  }, []);

  const onSubmit = async (data: AttributeFormValues) => {
    setMessage("");
    const optionsArr = data.options
      ? data.options.split(",").map((opt) => opt.trim()).filter(Boolean)
      : undefined;

    const res = await fetch(`${baseUrl}/api/attribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        categoryID: Number(data.categoryID),
        order: Number(data.order),
        options: optionsArr,
      }),
    });
    if (res.ok) {
      setMessage("Attribute added successfully!");
      methods.reset();
    } else {
      setMessage("Failed to add attribute.");
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add Attribute</h1>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormField
            name="categoryID"
            control={methods.control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <select {...field} defaultValue="">
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.categoryID} value={cat.categoryID}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="name"
            control={methods.control}
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="label"
            control={methods.control}
            rules={{ required: "Label is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="data_type"
            control={methods.control}
            rules={{ required: "Data type is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Type</FormLabel>
                <FormControl>
                  <select {...field} defaultValue="">
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="date">Date</option>
                    <option value="select">Select (options)</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="required"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required</FormLabel>
                <FormControl>
                  <input type="checkbox" checked={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="default_value"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Value</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="placeholder"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placeholder</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="unit"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="options"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Options (comma separated)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Red,Green,Blue" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="order"
            control={methods.control}
            rules={{ required: "Order is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="is_active"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Active</FormLabel>
                <FormControl>
                  <input type="checkbox" checked={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-4">
            Add Attribute
          </Button>
          {message && <div className="mt-2 text-green-600">{message}</div>}
        </form>
      </Form>
    </main>
  );
}