"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { uploadAvatar } from "@/lib/others/upload-images";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Gapcursor from "@tiptap/extension-gapcursor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog/dialog";
import { fetchDistrictList, fetchProvinceList, fetchWardList } from "@/lib/address-apis";
import { createAboutRecord, deleteAboutRecord, fetchAboutRecords, updateAboutRecord } from "@/lib/about-apis";
import { deleteAImage } from "@/lib/file-apis";
import NextImage from "next/image";
type Address = { province: string; district: string; ward: string };
type AboutForm = {
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyLogo: string;
  companyImage: string;
  companySlogan: string;
  companyFacebook: string;
  companyWorkingTime: string;
  companyDescription: string;
  copanyAddress: string;
  address: Address;
  termsAndPolicy: string;
};
type AboutRecord = AboutForm & { id?: number };

const emptyAddress = { province: "", district: "", ward: "" };
const emptyAbout: AboutForm = {
  companyName: "",
  companyPhone: "",
  companyEmail: "",
  companyLogo: "",
  companyImage: "",
  companySlogan: "",
  companyFacebook: "",
  companyWorkingTime: "",
  companyDescription: "",
  copanyAddress: "",
  address: emptyAddress,
  termsAndPolicy: "",
};

export default function AboutPage() {
  const methods = useForm<AboutForm>({ defaultValues: emptyAbout });
  const { register, handleSubmit, setValue, watch, reset } = methods;
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [aboutList, setAboutList] = useState<AboutRecord[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [, setEditorImages] = useState<File[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAboutIndex, setEditAboutIndex] = useState<number | null>(null);
  const [oldLogo, setOldLogo] = useState<string>("");
  const [oldCompanyImage, setOldCompanyImage] = useState<string>("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [provinces, setProvinces] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [districts, setDistricts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wards, setWards] = useState<any[]>([]);

  // Fetch districts
  const addressProvince = watch("address.province");
  useEffect(() => {
    const province = provinces.find(p => p.name === addressProvince);
    const fetchDistricts = async () => {
      const data = await fetchDistrictList(province.code);
      setDistricts(data.districts || []);
    }
    if (province) {
      fetchDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [provinces, addressProvince]);

  // Fetch wards
  const addressDistrict = watch("address.district");
  useEffect(() => {
    const district = districts.find(d => d.name === addressDistrict);
    const fetchWards = async () => {
      const data = await fetchWardList(district.code);
      setWards(data.wards || []);
    }
    if (district) {
      fetchWards();
    } else {
      setWards([]);
    }
  }, [addressDistrict, districts]);

  // Fetch all about records
  useEffect(() => {
    const fetchProvinces = async () => {
      const data = await fetchProvinceList();
      setProvinces(data || []);
    };
    const fetchAbout = async () => {
      try {
        const data = await fetchAboutRecords();
        setAboutList(data);
      } catch (error) {
        console.error("Failed to fetch about records:", error);
      }
    };
    fetchProvinces();
    fetchAbout();
  }, []);

  // When editing, load the selected about record into the form
  useEffect(() => {
    if (editingIndex !== null && aboutList[editingIndex]) {
      reset(aboutList[editingIndex]);
      setLogoPreview(aboutList[editingIndex].companyLogo || "");
      setImagePreview(aboutList[editingIndex].companyImage || "");
    } else {
      reset(emptyAbout);
      setLogoPreview("");
      setImagePreview("");
    }
  }, [editingIndex, aboutList, reset]);

  // Address logic
  // useEffect(() => {
  //   const province = provinces.find(p => p.name === watch("address.province"));
  //   if (province) {
  //     fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
  //       .then(res => res.json())
  //       .then(data => setDistricts(data.districts || []));
  //   } else {
  //     setDistricts([]);
  //     setWards([]);
  //   }
  // }, [watch("address.province"), provinces]);

  // useEffect(() => {
  //   const district = districts.find(d => d.name === watch("address.district"));
  //   if (district) {
  //     fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
  //       .then(res => res.json())
  //       .then(data => setWards(data.wards || []));
  //   } else {
  //     setWards([]);
  //   }
  // }, [watch("address.district"), districts]);

  // TipTap editor for termsAndPolicy
  const editor = useEditor({
    extensions: [
      StarterKit, Underline, Link, Image, BulletList, ListItem, Paragraph, Text, TaskList, TaskItem, Heading, TextAlign, Gapcursor, Table, TableRow, TableHeader, TableCell, HorizontalRule,
    ],
    content: watch("termsAndPolicy"),
    onUpdate: ({ editor }) => setValue("termsAndPolicy", editor.getHTML()),
  });

  // Toolbar actions for TipTap
  const handleToolbarClick = useCallback((action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    action();
  }, []);

  // Open dialog and set form for editing
  const handleEdit = (idx: number) => {
    setEditAboutIndex(idx);
    setEditDialogOpen(true);
    const about = aboutList[idx];
    reset(about);
    setLogoPreview(about.companyLogo || "");
    setImagePreview(about.companyImage || "");
    setOldLogo(about.companyLogo || "");
    setOldCompanyImage(about.companyImage || "");
  };

  // File upload handlers with delete old image
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (oldLogo && oldLogo !== logoPreview) {
      await deleteAImage(oldLogo);
    }
    const url = await uploadAvatar(file);
    setValue("companyLogo", url);
    setLogoPreview(url);
  };
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (oldCompanyImage && oldCompanyImage !== imagePreview) {
      await deleteAImage(oldCompanyImage);
    }
    const url = await uploadAvatar(file);
    setValue("companyImage", url);
    setImagePreview(url);
  };

  // Submit handler (add or update)
  const onSubmit = async (data: AboutForm) => {
    const { province, district, ward } = data.address;
    data.copanyAddress = [data.copanyAddress, ward, district, province].filter(Boolean).join(", ");
    if (editAboutIndex !== null) {
      // Delete old logo if changed
      const oldAbout = aboutList[editAboutIndex];
      if (oldAbout.companyLogo && oldAbout.companyLogo !== data.companyLogo) {
        await deleteAImage(oldAbout.companyLogo);
      }
      // Delete old company image if changed
      if (oldAbout.companyImage && oldAbout.companyImage !== data.companyImage) {
        await deleteAImage(oldAbout.companyImage);
      }
      // Update
      await updateAboutRecord(data);
      setAboutList(list => list.map((item, idx) => idx === editAboutIndex ? data : item));
      setEditAboutIndex(null);
      setEditDialogOpen(false);
    } else {
      // Add
      await createAboutRecord(data);
      setAboutList(list => [...list, data]);
    }
    reset(emptyAbout);
    setLogoPreview("");
    setImagePreview("");
  };

  // Delete handler
  const handleDelete = async (idx: number) => {
    await deleteAboutRecord();
    setAboutList(list => list.filter((_, i) => i !== idx));
    setEditingIndex(null);
    reset(emptyAbout);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Company Info (About)</h1>
      {/* List all about records */}
      <table className="w-full mb-8 border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
            <th>Logo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {aboutList.map((about, idx) => (
            <tr key={idx}>
              <td>{about.companyName}</td>
              <td>{about.companyPhone}</td>
              <td>{about.companyEmail}</td>
              <td>{about.copanyAddress}</td>
              <td>{about.companyLogo && <NextImage width={32} height={32} src={about.companyLogo} alt="Logo" className="h-8" />}</td>
              <td>
                <Button size="sm" onClick={() => handleEdit(idx)}>Edit</Button>
                <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(idx)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit About Info</DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl><Input {...register("companyName", { required: true })} /></FormControl>
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input {...register("companyPhone", { required: true })} /></FormControl>
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input {...register("companyEmail", { required: true })} /></FormControl>
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <input type="file" accept="image/*" onChange={handleLogoChange} />
                </FormControl>
                {logoPreview && <NextImage width={80} height={80} src={logoPreview} alt="Logo" className="w-20 h-20 object-cover mt-2" />}
              </FormItem>
              <FormItem>
                <FormLabel>Company Image</FormLabel>
                <FormControl>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </FormControl>
                {imagePreview && <NextImage width={80} height={80} src={imagePreview} alt="Company" className="w-20 h-20 object-cover mt-2" />}
              </FormItem>
              <FormItem>
                <FormLabel>Address</FormLabel>
                <div className="flex gap-2">
                  <Select value={watch("address.province")} onValueChange={val => setValue("address.province", val)}>
                    <SelectTrigger className="w-1/3"><SelectValue placeholder="Province" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Province</SelectLabel>
                        {provinces.map(p => <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select value={watch("address.district")} onValueChange={val => setValue("address.district", val)} disabled={!watch("address.province")}>
                    <SelectTrigger className="w-1/3"><SelectValue placeholder="District" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>District</SelectLabel>
                        {districts.map(d => <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select value={watch("address.ward")} onValueChange={val => setValue("address.ward", val)} disabled={!watch("address.district")}>
                    <SelectTrigger className="w-1/3"><SelectValue placeholder="Ward" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Ward</SelectLabel>
                        {wards.map(w => <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <FormControl>
                  <Input {...register("copanyAddress")} placeholder="Street, building, etc." />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input {...register("companyDescription")} /></FormControl>
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>Slogan</FormLabel>
                <FormControl><Input {...register("companySlogan")} /></FormControl>
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <FormControl><Input {...register("companyFacebook")} /></FormControl>
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>Working Time</FormLabel>
                <FormControl><Input {...register("companyWorkingTime")} /></FormControl>
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>Terms & Policy</FormLabel>
                <div>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleBold().run())}>Bold</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleItalic().run())}>Italic</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleUnderline().run())}>Underline</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleHeading({ level: 1 }).run())}>H1</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())}>H2</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleHeading({ level: 3 }).run())}>H3</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleHeading({ level: 4 }).run())}>H4</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleHeading({ level: 5 }).run())}>H5</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleHeading({ level: 6 }).run())}>H6</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleBulletList().run())}>Toggle bullet list</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleTaskList().run())}>Toggle task list</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().setTextAlign('left').run())}>Left</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().setTextAlign('center').run())}>Center</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().setTextAlign('right').run())}>Right</button>
                    <button type="button" onClick={handleToolbarClick(() => {
                      const url = prompt('Enter URL');
                      if (url) editor?.chain().focus().setLink({ href: url }).run();
                    })}>Link</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleOrderedList().run())}>Ordered List</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleBlockquote().run())}>Blockquote</button>
                    <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleCodeBlock().run())}>Code Block</button>
                    <label>
                      Image
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setEditorImages(prev => [...prev, file]);
                          const url = URL.createObjectURL(file);
                          editor?.chain().focus().setImage({ src: url }).run();
                        }}
                      />
                    </label>
                  </div>
                  <EditorContent editor={editor} className="tiptap-content" />
                </div>
              </FormItem>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="submit">Update</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                </DialogClose>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      {/* Add form (only show if not editing) */}
      {editAboutIndex === null && (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 p-6 rounded">
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl><Input {...register("companyName", { required: true })} /></FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl><Input {...register("companyPhone", { required: true })} /></FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input {...register("companyEmail", { required: true })} /></FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <input type="file" accept="image/*" onChange={handleLogoChange} />
              </FormControl>
              {logoPreview && <NextImage width={80} height={80} src={logoPreview} alt="Logo" className="w-20 h-20 object-cover mt-2" />}
            </FormItem>
            <FormItem>
              <FormLabel>Company Image</FormLabel>
              <FormControl>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </FormControl>
              {imagePreview && <NextImage width={80} height={80} src={imagePreview} alt="Company" className="w-20 h-20 object-cover mt-2" />}
            </FormItem>
            <FormItem>
              <FormLabel>Address</FormLabel>
              <div className="flex gap-2">
                <Select value={watch("address.province")} onValueChange={val => setValue("address.province", val)}>
                  <SelectTrigger className="w-1/3"><SelectValue placeholder="Province" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Province</SelectLabel>
                      {provinces.map(p => <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select value={watch("address.district")} onValueChange={val => setValue("address.district", val)} disabled={!watch("address.province")}>
                  <SelectTrigger className="w-1/3"><SelectValue placeholder="District" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>District</SelectLabel>
                      {districts.map(d => <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select value={watch("address.ward")} onValueChange={val => setValue("address.ward", val)} disabled={!watch("address.district")}>
                  <SelectTrigger className="w-1/3"><SelectValue placeholder="Ward" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Ward</SelectLabel>
                      {wards.map(w => <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <FormControl>
                <Input {...register("copanyAddress")} placeholder="Street, building, etc." />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Input {...register("companyDescription")} /></FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Slogan</FormLabel>
              <FormControl><Input {...register("companySlogan")} /></FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Facebook</FormLabel>
              <FormControl><Input {...register("companyFacebook")} /></FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Working Time</FormLabel>
              <FormControl><Input {...register("companyWorkingTime")} /></FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Terms & Policy</FormLabel>
              <div>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleBold().run())}>Bold</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleItalic().run())}>Italic</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleUnderline().run())}>Underline</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleHeading({ level: 1 }).run())}>H1</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())}>H2</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleHeading({ level: 3 }).run())}>H3</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleHeading({ level: 4 }).run())}>H4</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleHeading({ level: 5 }).run())}>H5</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleHeading({ level: 6 }).run())}>H6</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleBulletList().run())}>Toggle bullet list</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleTaskList().run())}>Toggle task list</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().setTextAlign('left').run())}>Left</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().setTextAlign('center').run())}>Center</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().setTextAlign('right').run())}>Right</button>
                  <button type="button" onClick={handleToolbarClick(() => {
                    const url = prompt('Enter URL');
                    if (url) editor?.chain().focus().setLink({ href: url }).run();
                  })}>Link</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleOrderedList().run())}>Ordered List</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleBlockquote().run())}>Blockquote</button>
                  <button type="button" onClick={handleToolbarClick(() => editor?.chain().focus().toggleCodeBlock().run())}>Code Block</button>
                  <label>
                    Image
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setEditorImages(prev => [...prev, file]);
                        const url = URL.createObjectURL(file);
                        editor?.chain().focus().setImage({ src: url }).run();
                      }}
                    />
                  </label>
                </div>
                <EditorContent editor={editor} className="tiptap-content" />
              </div>
            </FormItem>
            <Button type="submit">Add</Button>
          </form>
        </FormProvider>
      )}
    </div>
  );
}