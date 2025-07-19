"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb/breadcrumb";

interface CustomBreadcrumbProps {
  items: { label: string; href?: string }[]; // Array of breadcrumb items
}

export default function CustomBreadcrumb({ items }: CustomBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-4 font-sans">
      <BreadcrumbList>
        {items.map((item, index) => (
          <BreadcrumbItem key={index} className="text-lg">
            {item.href ? (
              <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            )}
            {index < items.length - 1 && (
              <span aria-hidden="true" className="mx-2">
                <BreadcrumbSeparator />
              </span>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}