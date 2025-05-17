"use client";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb/breadcrumb";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";


export default function BreadcrumbBar() {
  const pathname = usePathname();
  // Split and filter out empty segments
  const segments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumb on home
  if (segments.length <= 1) return null;

  // Build breadcrumb items
  let path = "";
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/${segments[0]}`}>{segments[0].toUpperCase()}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.slice(1, -1).map((segment,) => {
          path += `/${segment}`;
          return (
            <React.Fragment key={segment}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/${segments[0]}${path}`}>{decodeURIComponent(segment)}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {decodeURIComponent(segments[segments.length - 1])}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}