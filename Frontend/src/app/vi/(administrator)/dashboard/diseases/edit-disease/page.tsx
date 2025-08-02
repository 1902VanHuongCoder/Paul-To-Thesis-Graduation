"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { updateDisease, fetchDiseaseById } from "@/lib/disease-apis";
import { toast } from "react-hot-toast";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bold,
  Columns2,
  Code2,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ImageIcon,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Merge,
  Minus,
  QuoteIcon,
  Rows2,
  Split,
  TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  SquareStack,
  TrashIcon
} from "lucide-react";
import NextImage from "next/image";
import { uploadMultipleImages } from "@/lib/file-apis";

interface DiseaseFormValues {
  diseaseName: string;
  diseaseEnName: string;
  ricePathogen: string;
  symptoms: string;
  images: FileList;
}

interface Disease {
    diseaseID: number;
    diseaseName: string;
    diseaseEnName: string;
    ricePathogen: string;
    symptoms: string;
    images: string[];
    userID: string;
    createdAt: string;
    updatedAt: string;
}

export default function EditDiseasePage() {
  const router = useRouter();
  const params = useParams();
  // Get diseaseID from params
  // Support both /edit-disease/[diseaseID] and /edit-disease?diseaseID=11
  const rawDiseaseID =
    params.diseaseID ??
    (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("diseaseID") : undefined);

  const diseaseID: number | undefined =
    typeof rawDiseaseID === "string"
      ? Number(rawDiseaseID)
      : Array.isArray(rawDiseaseID)
      ? Number(rawDiseaseID[0])
      : undefined;
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<DiseaseFormValues>();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [disease, setDisease] = useState<Disease | null>(null);
  //   console.log("Disease ID:", diseaseID);

  // Tiptap editor for symptoms
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Nhập triệu chứng bệnh ở đây...</p>',
  });

  useEffect(() => {
    const fetchDisease = async () => {
      setLoading(true);
      try {
        const disease = await fetchDiseaseById(String(diseaseID));
        if (disease) {
          setDisease(disease);
          setValue("diseaseName", disease.diseaseName);
          setValue("diseaseEnName", disease.diseaseEnName || "");
          setValue("ricePathogen", disease.ricePathogen || "");
          setValue("symptoms", disease.symptoms || "");
          editor?.commands.setContent(disease.symptoms || "<p>Nhập triệu chứng bệnh ở đây...</p>");
          setImagePreviews(disease.images || []);
        }
      } catch (err) {
        toast.error("Không tìm thấy thông tin bệnh.");
        console.error("Error fetching disease:", err);
      } finally {
        setLoading(false);
      }
    };
    if (diseaseID) fetchDisease();
  }, [diseaseID, setValue, editor]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
    setImagePreviews(newFiles.map(file => URL.createObjectURL(file)));
    setValue("images", e.target.files as FileList);
  };

  // Remove image preview
  const handleRemoveImage = (idx: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImagePreviews(newPreviews);
    const files = Array.from((getValues("images") as FileList | File[] | undefined) || []);
    files.splice(idx, 1);
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    setValue("images", dataTransfer.files);
  };

  const onSubmit = async (data: DiseaseFormValues) => {
    setLoading(true);
    setMessage("");
    try {
      let uploadedUrls: string[] = [];
      const filesToUpload: File[] = [];
      if (data.images && data.images.length > 0) {
        Array.from(data.images).forEach(file => filesToUpload.push(file));
      }
      try {
        if (filesToUpload.length > 0) {
          uploadedUrls = await uploadMultipleImages(filesToUpload);
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        setMessage("Đã xảy ra lỗi khi tải ảnh lên. Vui lòng thử lại.");
        setLoading(false);
        return;
      }
      // 1. Get kept old images (those still in imagePreviews and are not blob:)
      const keptOldImages = (disease?.images || []).filter(img => imagePreviews.includes(img));
      // 2. Get new uploaded images (from uploadMultipleImages)
      const newImages = [...keptOldImages, ...uploadedUrls];
      // 3. Find deleted images (old images not in keptOldImages)
      const imagesToDelete = (disease?.images || []).filter(img => !keptOldImages.includes(img));
      if (imagesToDelete.length > 0) {
        try {
          await import("@/lib/file-apis").then(mod => mod.deleteMultipleImages(imagesToDelete));
        } catch (error) {
          console.error("Failed to delete old images:", error);
          setMessage("Đã xảy ra lỗi khi xóa ảnh cũ. Vui lòng thử lại.");
          setLoading(false);
          return;
        }
      }
      // Update disease with new images and symptoms
      const res = await updateDisease(Number(diseaseID), {
        diseaseName: data.diseaseName,
        diseaseEnName: data.diseaseEnName,
        ricePathogen: data.ricePathogen,
        symptoms: editor?.getHTML() || "",
        images: newImages,
      });
      if (res) {
        toast.success("Cập nhật bệnh thành công!");
        router.push("/vi/dashboard/diseases");
      } else {
        toast.error("Cập nhật bệnh thất bại!");
      }
    } catch (error) {
      console.error("Error updating disease:", error);
      toast.error("Lỗi khi cập nhật bệnh.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cập Nhật Bệnh Lúa</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block font-medium mb-1">Tên bệnh</label>
          <input
            type="text"
            {...register("diseaseName", { required: true })}
            className="w-full border px-3 py-2 rounded"
            defaultValue={disease?.diseaseName || ""}
            placeholder={disease?.diseaseName || "Tên bệnh"}
          />
          {errors.diseaseName && <span className="text-red-500">Tên bệnh là bắt buộc</span>}
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Tên tiếng Anh</label>
          <input
            type="text"
            {...register("diseaseEnName", { required: true })}
            className="w-full border px-3 py-2 rounded"
            defaultValue={disease?.diseaseEnName || ""}
            placeholder={disease?.diseaseEnName || "Tên tiếng Anh"}
          />
          {errors.diseaseEnName && <span className="text-red-500">Tên tiếng Anh là bắt buộc</span>}
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Tác nhân gây bệnh</label>
          <input
            type="text"
            {...register("ricePathogen", { required: true })}
            className="w-full border px-3 py-2 rounded"
            defaultValue={disease?.ricePathogen || ""}
            placeholder={disease?.ricePathogen || "Tác nhân gây bệnh"}
          />
          {errors.ricePathogen && <span className="text-red-500">Tác nhân gây bệnh là bắt buộc</span>}
        </div>
        <div className="mb-4 col-span-2">
          <label className="font-medium mb-1 block text-sm">Triệu chứng</label>
          <div className="border rounded-lg bg-white dark:bg-gray-800">
            <Tabs defaultValue="text" className="mb-2 border-b p-4">
              <TabsList className="flex gap-2 px-1 mb-4">
                <TabsTrigger value="text">Văn bản</TabsTrigger>
                <TabsTrigger value="heading">Tiêu đề</TabsTrigger>
                <TabsTrigger value="list">Danh sách</TabsTrigger>
                <TabsTrigger value="table">Bảng</TabsTrigger>
                <TabsTrigger value="align">Căn lề</TabsTrigger>
                <TabsTrigger value="insert">Chèn</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <div className="flex gap-4 flex-wrap">
                  <button type="button" title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'is-active' : ''}><Bold size={16} /><span>In đậm</span></button>
                  <button type="button" title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'is-active' : ''}><Italic size={16} /> <span>In nghiêng</span></button>
                  <button type="button" title="Underline" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={editor?.isActive('underline') ? 'is-active' : ''}><UnderlineIcon size={16} /><span>Gạch chân</span></button>
                  <button type="button" title="Blockquote" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={editor?.isActive('blockquote') ? 'is-active' : ''}><QuoteIcon size={16} /><span>Trích</span></button>
                  <button type="button" title="Code Block" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={editor?.isActive('codeBlock') ? 'is-active' : ''}><Code2 size={16} /><span>Khối code</span></button>
                  <button type="button" title="Link" onClick={() => { const url = prompt('Enter URL'); if (url) editor?.chain().focus().setLink({ href: url }).run(); }} className={editor?.isActive('link') ? 'is-active' : ''}><LinkIcon size={16} /><span>Liên kết</span></button>
                </div>
              </TabsContent>
              <TabsContent value="heading">
                <div className="flex gap-2 flex-wrap">
                  <button type="button" title="H1" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={editor?.isActive('heading', { level: 1 }) ? 'is-active' : ''}><Heading1 size={18} /></button>
                  <button type="button" title="H2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive('heading', { level: 2 }) ? 'is-active' : ''}><Heading2 size={18} /></button>
                  <button type="button" title="H3" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={editor?.isActive('heading', { level: 3 }) ? 'is-active' : ''}><Heading3 size={18} /></button>
                  <button type="button" title="H4" onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()} className={editor?.isActive('heading', { level: 4 }) ? 'is-active' : ''}><Heading4 size={18} /></button>
                  <button type="button" title="H5" onClick={() => editor?.chain().focus().toggleHeading({ level: 5 }).run()} className={editor?.isActive('heading', { level: 5 }) ? 'is-active' : ''}><Heading5 size={18} /></button>
                  <button type="button" title="H6" onClick={() => editor?.chain().focus().toggleHeading({ level: 6 }).run()} className={editor?.isActive('heading', { level: 6 }) ? 'is-active' : ''}><Heading6 size={18} /></button>
                </div>
              </TabsContent>
              <TabsContent value="list">
                <div className="flex gap-2 flex-wrap">
                  <button type="button" title="Bullet List" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive('bulletList') ? 'is-active' : ''}><List size={18} /></button>
                  <button type="button" title="Ordered List" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={editor?.isActive('orderedList') ? 'is-active' : ''}><ListOrdered size={18} /></button>
                  <button type="button" title="Task List" onClick={() => editor?.chain().focus().toggleTaskList().run()} className={editor?.isActive('taskList') ? 'is-active' : ''}><ListChecks size={18} /></button>
                  <button type="button" title="Split List Item" onClick={() => editor?.chain().focus().splitListItem('listItem').run()} disabled={!editor?.can().splitListItem('listItem')}><Split size={16} /></button>
                  <button type="button" title="Sink List Item" onClick={() => editor?.chain().focus().sinkListItem('listItem').run()} disabled={!editor?.can().sinkListItem('listItem')}><ArrowRight size={16} /></button>
                  <button type="button" title="Lift List Item" onClick={() => editor?.chain().focus().liftListItem('listItem').run()} disabled={!editor?.can().liftListItem('listItem')}><ArrowLeft size={16} /></button>
                </div>
              </TabsContent>
              <TabsContent value="table">
                <div className="flex gap-2 flex-wrap">
                  <button type="button" title="Insert Table" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon size={16} /></button>
                  <button type="button" title="Add Column Before" onClick={() => editor?.chain().focus().addColumnBefore().run()}><Columns2 size={16} /></button>
                  <button type="button" title="Add Column After" onClick={() => editor?.chain().focus().addColumnAfter().run()}><Columns2 size={16} /></button>
                  <button type="button" title="Delete Column" onClick={() => editor?.chain().focus().deleteColumn().run()}><Trash2 size={16} /></button>
                  <button type="button" title="Add Row Before" onClick={() => editor?.chain().focus().addRowBefore().run()}><Rows2 size={16} /></button>
                  <button type="button" title="Add Row After" onClick={() => editor?.chain().focus().addRowAfter().run()}><Rows2 size={16} /></button>
                  <button type="button" title="Delete Row" onClick={() => editor?.chain().focus().deleteRow().run()}><Trash2 size={16} /></button>
                  <button type="button" title="Delete Table" onClick={() => editor?.chain().focus().deleteTable().run()}><Trash2 size={16} /></button>
                  <button type="button" title="Merge Cells" onClick={() => editor?.chain().focus().mergeCells().run()}><Merge size={16} /></button>
                  <button type="button" title="Split Cell" onClick={() => editor?.chain().focus().splitCell().run()}><Split size={16} /></button>
                  <button type="button" title="Toggle Header Column" onClick={() => editor?.chain().focus().toggleHeaderColumn().run()}>1</button>
                  <button type="button" title="Toggle Header Row" onClick={() => editor?.chain().focus().toggleHeaderRow().run()}>2</button>
                  <button type="button" title="Toggle Header Cell" onClick={() => editor?.chain().focus().toggleHeaderCell().run()}><SquareStack size={16} /></button>
                  <button type="button" title="Merge or Split" onClick={() => editor?.chain().focus().mergeOrSplit().run()}><Merge size={16} /></button>
                  <button type="button" title="Set Cell Attribute" onClick={() => editor?.chain().focus().setCellAttribute('colspan', 2).run()}><Columns2 size={16} /></button>
                  <button type="button" title="Fix Tables" onClick={() => editor?.chain().focus().fixTables().run()}><TableIcon size={16} /></button>
                  <button type="button" title="Go to Next Cell" onClick={() => editor?.chain().focus().goToNextCell().run()}><ArrowDown size={16} /></button>
                  <button type="button" title="Go to Previous Cell" onClick={() => editor?.chain().focus().goToPreviousCell().run()}><ArrowUp size={16} /></button>
                </div>
              </TabsContent>
              <TabsContent value="align">
                <div className="flex gap-2 flex-wrap">
                  <button type="button" title="Align Left" onClick={() => editor?.chain().focus().setTextAlign('left').run()} className={editor?.isActive({ textAlign: 'left' }) ? 'is-active' : ''}><AlignLeft size={16} /></button>
                  <button type="button" title="Align Center" onClick={() => editor?.chain().focus().setTextAlign('center').run()} className={editor?.isActive({ textAlign: 'center' }) ? 'is-active' : ''}><AlignCenter size={16} /></button>
                  <button type="button" title="Align Right" onClick={() => editor?.chain().focus().setTextAlign('right').run()} className={editor?.isActive({ textAlign: 'right' }) ? 'is-active' : ''}><AlignRight size={16} /></button>
                </div>
              </TabsContent>
              <TabsContent value="insert">
                <div className="flex gap-2 flex-wrap">
                  <label title="Image">
                    <ImageIcon size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = URL.createObjectURL(file);
                        editor?.chain().focus().setImage({ src: url }).run();
                      }}
                    />
                  </label>
                  <button type="button" title="Horizontal Rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus size={16} /></button>
                </div>
              </TabsContent>
            </Tabs>
            <EditorContent
              editor={editor}
              className="tiptap-content min-h-[300px] p-3 focus:outline-none rounded-br-md rounded-bl-md focus:border-none"
            />
          </div>
        </div>
        <div className="mb-4 col-span-2">
          <label className="block font-medium mb-1">Hình ảnh bệnh</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            onDragOver={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={e => {
              e.preventDefault();
              e.stopPropagation();
              const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
              if (files.length > 0) {
                const dataTransfer = new DataTransfer();
                files.forEach(file => dataTransfer.items.add(file));
                setValue("images", dataTransfer.files);
                setImagePreviews(files.map(file => URL.createObjectURL(file)));
              }
            }}
            onClick={() => {
              document.getElementById("disease-image-input")?.click();
            }}
          >
            <input
              id="disease-image-input"
              type="file"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <div className="text-gray-500">Kéo và thả ảnh vào đây hoặc bấm để chọn ảnh</div>
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <NextImage
                      width={96}
                      height={96}
                      src={src}
                      alt={`preview-${idx}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-xs text-red-600 shadow group-hover:opacity-100 opacity-80"
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Show old images if no new images selected */}
            {imagePreviews.length === 0 && disease?.images && disease.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {disease.images.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <NextImage
                      width={96}
                      height={96}
                      src={src}
                      alt={`old-preview-${idx}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end"><button type="submit" disabled={loading} className="px-6 py-2 rounded bg-primary text-white font-semibold">
          {loading ? "Đang cập nhật..." : "Cập nhật bệnh"}
        </button></div>
        {message && <div className="mt-4 text-center text-green-600">{message}</div>}
      </form>
      <style jsx global>{`
        .tiptap-content:focus, .tiptap-content:focus-visible,
        .tiptap-content *:focus, .tiptap-content *:focus-visible {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .is-active {
          background-color: #e9e9e9;
          color: #000;
          border-color: #2563eb;
          padding: 0.2rem 0.5rem;
          border-radius: calc(var(--radius) - 2px);
        }
      `}</style>
    </div>
  );
}
