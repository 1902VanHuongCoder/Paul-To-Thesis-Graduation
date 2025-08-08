"use client";
import React, { useState } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog/dialog';
import Image from "next/image";
import { Breadcrumb } from "@/components";
import { CircleAlert, Eye } from "lucide-react";
import NextLink from 'next/link';
import { useDiagnoseContext } from '@/contexts/diagnose-context';
import { detectRiceDisease, getDiseaseDetails } from "@/lib/detect-rice-disease-apis";
import { fetchProducts } from "@/lib/product-apis";

type Disease = {
  diseaseID?: number;
  diseaseName?: string;
  diseaseEnName?: string;
  ricePathogen?: string;
  symptoms?: string;
  images?: string[];
};

type Product = {
  productID: string;
  productName: string;
  productImage: string;
  diseases: string[];
  images: string[];
  productPrice: number;
  unit: string;
};

export default function DetectRiceDiseaseDemo() {
  // Dialog state for disease details
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  // Tiptap editor for symptoms
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TiptapImage,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: selectedDisease?.symptoms ? selectedDisease.symptoms : '<p>Đang tải...</p>',
    editable: false,
    immediatelyRender: false,
  });

  // Update editor content when selectedDisease changes
  React.useEffect(() => {
    if (editor && selectedDisease?.symptoms) {
      editor.commands.setContent(selectedDisease.symptoms);
    }
  }, [selectedDisease, editor]);

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ class: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  type DiseaseDetail = {
    diseaseID?: number;
    diseaseName?: string;
    diseaseEnName?: string;
    ricePathogen?: string;
    symptoms?: string;
    images?: string[];
    productPrice?: number;
    unit?: string;
  };

  const { result: contextResult, setResult: setDiagnoseResult } = useDiagnoseContext();
  const [diseaseDetails, setDiseaseDetails] = useState<DiseaseDetail[]>(contextResult ? contextResult : []);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productsForDisease, setProductsForDisease] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [, setSelectedDiseaseID] = useState<string | number | undefined>(undefined);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
      setDiseaseDetails([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setDiseaseDetails([]);

    const formData = new FormData();
    formData.append("file", file);
    try {
      const data = await detectRiceDisease(file);
      if (data && data.predicted_class && data.all_probs && data.all_probs.length > 0) {
        setResult({ class: data.predicted_class, confidence: data.all_probs[0][1] });
        const diseaseEnNames = data.all_probs.map(([diseaseEnName]: [string, number]) => diseaseEnName);
        const details = await Promise.all(
          diseaseEnNames.map(async (enName: string) => {
            const data = await getDiseaseDetails(enName);
            if (data) {
              return {
                diseaseID: data.diseaseID,
                diseaseName: data.diseaseName,
                diseaseEnName: data.diseaseEnName,
                ricePathogen: data.ricePathogen,
                symptoms: data.symptoms,
                images: data.images || [],
              };
            }
            return null;
          })
        );
        setDiseaseDetails(details.filter(d => d !== null));
        setDiagnoseResult(details.filter(d => d !== null) as DiseaseDetail[]);
      } else {
        setError("Không thể nhận diện bệnh lúa. Vui lòng thử lại với ảnh khác.");
      }
    } catch (err) {
      setError("Lỗi khi nhận diện bệnh lúa. Vui lòng thử lại sau.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products by diseaseID
  const handleViewProducts = async (diseaseID: number) => {
    if (!diseaseID) return;
    setLoadingProducts(true);
    setSelectedDiseaseID(diseaseID);

    try {
      const allProducts = await fetchProducts();
      // Currently, the value of disease property is '[1,2,3,4,5]' 
      const filtered = allProducts.filter((p: Product) => {
        // diseases property is a JSON string, e.g. '[1,2,3,4,5]'
        let diseaseArr: string[] | number[] = [];
        if (typeof p.diseases === 'string') {
          try {
            diseaseArr = JSON.parse(p.diseases);
          } catch {
            diseaseArr = [];
          }
        } else if (Array.isArray(p.diseases)) {
          diseaseArr = p.diseases;
        }
        // diseaseID can be string or number, so compare loosely
        return diseaseArr.map(String).includes(String(diseaseID));
      });
      setProductsForDisease(filtered);
      setProductDialogOpen(true);

    } catch (err) {
      console.error("Error fetching products:", err);
      setProductsForDisease([]);
      setProductDialogOpen(true);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="px-6 py-10 font-sans bg-gradient-to-br from-[#eaf7ef] via-white to-[#f8fbe9] min-h-screen w-full">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Chẩn đoán bệnh lúa" },
        ]}
      />
      <h1 className="text-3xl font-extrabold mb-6 mt-8 uppercase text-center tracking-wide text-[#0d401c] drop-shadow-lg">
        CHẨN ĐOÁN BỆNH DỰA TRÊN LÁ LÚA
      </h1>
      <p className="flex gap-2 py-4 bg-[#f8c32c]/20 rounded-lg shadow-sm mb-8 items-center px-4 border-l-4 border-[#f8c32c]">
        <span>
          <CircleAlert className="text-[#278d45]" />
        </span>
        <span className="text-[#0d401c] font-medium">
          Sử dụng hình ảnh lá lúa chất lượng, không bị mờ sẽ giúp hệ thống chẩn đoán chính xác hơn.
        </span>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-12 mx-auto">
        {/* Upload Section */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-6 mb-8"
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
            onDrop={e => {
              e.preventDefault(); setDragActive(false);
              const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
              if (files.length > 0) {
                setFile(files[0]);
                setResult(null);
                setError(null);
                setDiseaseDetails([]);
              }
            }}
          >
            <div
              className={`w-full border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[340px] bg-gradient-to-br ${dragActive ? "from-[#f8c32c]/30 to-[#278d45]/20 border-[#f8c32c] shadow-2xl" : "from-white to-[#eaf7ef] border-[#278d45]/30 shadow-lg"} hover:shadow-2xl hover:border-[#278d45]`}
              onClick={() => document.getElementById("detect-image-input")?.click()}
              role="button"
              tabIndex={0}
              aria-label="Kéo thả hoặc click để tải ảnh"
            >
              <input
                id="detect-image-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {file ? (
                <div className="relative w-full min-h-[300px] max-h-[500px] rounded-xl overflow-hidden shadow-xl border-2 border-[#278d45]/30 bg-white mb-2 flex items-center justify-center">
                  <Image
                    width={320}
                    height={240}
                    src={URL.createObjectURL(file)}
                    alt="Uploaded"
                    className="w-full h-full object-contain rounded-xl"
                  />
                  {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 animate-fade-in">
                      {/* Enhanced scan animation (manual) */}
                      <div className="relative animate-spin-slow" style={{ width: 140, height: 140 }}>
                        <svg width="140" height="140" className="block">
                          <defs>
                            <radialGradient id="scanGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#f8c32c" stopOpacity="0.8" />
                              <stop offset="70%" stopColor="#278d45" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#278d45" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id="scanArc" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#f8c32c" />
                              <stop offset="100%" stopColor="#278d45" />
                            </linearGradient>
                          </defs>
                          {/* Outer glowing circle */}
                          <circle
                            cx="70"
                            cy="70"
                            r="60"
                            fill="none"
                            stroke="url(#scanGlow)"
                            strokeWidth="10"
                            style={{ filter: "blur(2.5px)" }}
                          />
                          {/* Animated arc (static, but can be animated with CSS) */}
                          <circle
                            cx="70"
                            cy="70"
                            r="52"
                            fill="none"
                            stroke="url(#scanArc)"
                            strokeWidth="8"
                            strokeDasharray="80 240"
                            strokeDashoffset="0"
                            style={{ filter: "drop-shadow(0 0 8px #f8c32c88)" }}
                          />
                          {/* Pulsing inner circle (static, can be animated with CSS) */}
                          <circle
                            cx="70"
                            cy="70"
                            r="22"
                            fill="#f8c32c"
                            stroke="#278d45"
                            strokeWidth="3"
                            style={{ opacity: 0.85, filter: "blur(0.5px)" }}
                          />
                        </svg>
                        {/* Sparkle dots */}
                        <div className="absolute left-1/2 top-1/2" style={{ transform: "translate(-50%, -50%)" }}>
                          <div className="flex gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#f8c32c] shadow-lg animate-pulse" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#278d45] shadow animate-pulse" />
                            <span className="w-1 h-1 rounded-full bg-[#f8c32c] shadow animate-pulse" />
                          </div>
                        </div>
                      </div>
                      <span className="absolute left-1/2 top-full mt-4 -translate-x-1/2 text-[#278d45] font-bold bg-white/80 px-4 py-2 rounded-xl shadow border border-[#278d45]/20 text-base">
                        Đang quét ảnh...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-[#278d45] text-base mb-2 font-semibold tracking-wide">
                    Kéo thả hoặc click để tải ảnh bệnh lúa
                  </span>
                  <span className="text-xs text-[#0d401c]/70">(Chọn một ảnh)</span>
                  <svg width="64" height="64" fill="none" className="mt-6 mb-2">
                    <rect x="2" y="2" width="60" height="60" rx="16" fill="#f8c32c" stroke="#278d45" strokeWidth="2" />
                    <path d="M32 18v28M18 32h28" stroke="#0d401c" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex justify-end w-full">
              <button
                type="submit"
                disabled={!file || loading}
                className="px-10 py-3 rounded-xl bg-gradient-to-r from-[#278d45] to-[#f8c32c] text-white font-bold shadow-xl hover:from-[#0d401c] hover:to-[#f8c32c]/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed tracking-wide text-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Đang chẩn đoán...
                  </span>
                ) : "Chẩn đoán"}
              </button>
            </div>
          </form>
        </div>
        {/* Divider */}
        <div className="hidden md:block bg-gradient-to-b from-[#f8c32c]/40 to-[#278d45]/20 w-[2px] mx-auto rounded-full" />
        {/* Result Section */}
        <div>
          <div className="flex items-center gap-x-2 mb-4">
            <svg width="32" height="32" fill="none"><rect x="2" y="2" width="28" height="28" rx="8" fill="#f8c32c" stroke="#278d45" strokeWidth="2" /><path d="M16 9v12M9 16h14" stroke="#0d401c" strokeWidth="2" strokeLinecap="round" /></svg>
            <span className="ml-2 text-[#0d401c] font-semibold">Kết quả chẩn đoán</span>
          </div>

          {diseaseDetails.length === 0 && !result && !error && (
            <div className="text-[#278d45]/60 text-center italic bg-white/90 rounded-xl py-10 shadow-inner border border-[#278d45]/10">
              Chưa có kết quả chẩn đoán.
            </div>
          )}
          {diseaseDetails.length > 1 && result && !error && (
            <div className="text-[#278d45] flex gap-x-2 bg-[#f8c32c]/10 p-3 rounded-lg border border-[#f8c32c]/40 mb-4 shadow">
              <span>
                <CircleAlert className="text-[#f8c32c]" />
              </span>
              <span>
                Tham khảo kết quả chẩn đoán để biết cây lúa của bạn đang gặp vấn đề gì.
              </span>
            </div>
          )}
          <div className="mt-8 w-full">
            {/* Show fetched disease details */}
            {diseaseDetails.length > 0 && (
              <div className="grid gap-8">
                {diseaseDetails.map((disease, idx) => (
                  <div
                    key={disease.diseaseID || idx}
                    className="border border-[#278d45]/20 bg-white rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col md:flex-row items-center gap-6"
                  >
                    <div className="flex-shrink-0 w-[120px] h-[120px] bg-white rounded-xl flex items-center justify-center border border-[#278d45]/10 shadow">
                      {disease && disease.images && disease.images.length > 0 ? (
                        <Image
                          key={disease.diseaseID || idx}
                          src={disease.images[0]}
                          alt="Disease"
                          width={110}
                          height={110}
                          className="rounded-lg object-cover border shadow w-full h-full"
                        />
                      ) : (
                        <span className="text-[#278d45]/40 text-xs">Không có hình ảnh</span>
                      )}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="font-bold text-2xl text-[#0d401c] uppercase tracking-wide">
                        {disease.diseaseName}
                      </div>
                      <div className="text-sm text-[#278d45]">
                        <b>Tên tiếng Anh:</b> {disease.diseaseEnName}
                      </div>
                      <div className="text-sm text-[#278d45]">
                        <b>Tác nhân:</b> {disease.ricePathogen}
                      </div>
                    </div>
                    <div>
                      <button
                        className="mt-2 px-5 py-2 border-[#278d45]/30 border-[1px] text-[#278d45] rounded-lg hover:bg-[#278d45] hover:text-white hover:cursor-pointer transition flex items-center gap-x-2 font-semibold shadow"
                        onClick={() => {
                          setSelectedDisease(disease);
                          setDialogOpen(true);
                        }}
                      >
                        <span>Xem chi tiết bệnh</span>
                        <span>
                          <Eye />
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Disease Details Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="bg-gradient-to-br from-[#eaf7ef] via-white to-[#f8fbe9] rounded-2xl shadow-2xl border border-[#278d45]/20 sm:max-w-5xl max-h-[90vh] overflow-x-hidden">
                <DialogHeader>
                  <DialogTitle className="uppercase text-center text-3xl text-[#278d45] font-extrabold tracking-wide drop-shadow-lg mb-2">
                    {selectedDisease?.diseaseName || "Chi tiết bệnh"}
                  </DialogTitle>
                </DialogHeader>
                <div className="mb-4 w-full flex justify-center">
                  <div className="flex justify-center max-w-4xl overflow-x-auto">
                    {selectedDisease?.images && selectedDisease.images.length > 0 ? (
                      <div className="flex gap-x-4 py-2">
                        {selectedDisease.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="w-[320px] h-[320px] rounded-2xl overflow-hidden border-2 border-[#278d45]/20 bg-white flex-shrink-0 transition-transform"
                          >
                            <Image
                              src={img}
                              alt={`Disease ${idx + 1}`}
                              width={320}
                              height={320}
                              className="rounded-xl object-cover w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-[320px] h-[320px] flex items-center justify-center text-[#278d45]/40 bg-[#eaf7ef] rounded-2xl border-2 border-[#278d45]/10 shadow">
                        Không có hình ảnh
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                  <div className="text-[#278d45] bg-white/80 rounded-lg px-4 py-2 shadow border border-[#278d45]/10">
                    <b>Tên tiếng Anh:</b>{" "}
                    <span className="text-lg font-semibold">{selectedDisease?.diseaseEnName}</span>
                  </div>
                  <div className="text-[#278d45] bg-white/80 rounded-lg px-4 py-2 shadow border border-[#278d45]/10">
                    <b>Tác nhân:</b>{" "}
                    <span className="text-lg font-semibold">{selectedDisease?.ricePathogen}</span>
                  </div>
                </div>
                <div className="w-fit mx-auto tiptap-content mb-8 rounded-xl p-6 border border-[#278d45]/10 shadow">
                  {selectedDisease?.symptoms && <EditorContent editor={editor} className="tiptap-editor" />}
                </div>
                <DialogClose asChild>
                  <div className="flex gap-x-4 mt-4">
                    <button className="px-4 py-2 rounded-lg font-semibold border border-[#278d45] hover:bg-[#eaf7ef] transition w-full hover:cursor-pointer text-[#278d45] shadow">
                      Đóng
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#278d45] to-[#f8c32c] text-white font-bold shadow-xl hover:from-[#0d401c] hover:to-[#f8c32c]/90 transition w-full hover:cursor-pointer"
                      onClick={() => {
                        if (selectedDisease && selectedDisease.diseaseID) {
                          handleViewProducts(selectedDisease.diseaseID);
                        }
                        setDialogOpen(false);
                      }}
                    >
                      Xem thuốc
                    </button>
                  </div>
                </DialogClose>
              </DialogContent>
            </Dialog>
            {/* Products Dialog */}
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
              <DialogContent className="max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#278d45]/20">
                <DialogHeader>
                  <DialogTitle className="text-xl text-[#0d401c] font-bold">
                    Danh sách sản phẩm liên quan đến bệnh
                  </DialogTitle>
                  <p className="flex items-center gap-x-2 p-2 bg-[#f8c32c]/10 rounded-md border border-[#f8c32c]/30 text-[#278d45]">
                    <span>
                      <CircleAlert className="text-[#f8c32c]" />
                    </span>
                    <span>
                      Chỉ chọn một sản phẩm để giải quyết vấn đề hiện tại. Khuyến khích sản phẩm ít độc hại cho lúa.
                    </span>
                  </p>
                </DialogHeader>
                {loadingProducts ? (
                  <div className="text-center py-8 text-[#278d45] font-semibold">
                    Đang tải sản phẩm...
                  </div>
                ) : productsForDisease.length === 0 ? (
                  <div className="text-center py-8 text-[#0d401c]/60">
                    Không có sản phẩm nào liên quan đến bệnh này.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {productsForDisease.map((product, idx) => (
                      <NextLink
                        href={`/vi/homepage/product-details/${product.productID}`}
                        key={product.productID || idx}
                        className="border border-[#278d45]/20 bg-white/95 rounded-xl p-4 flex gap-x-4 items-center shadow hover:shadow-xl transition-all"
                      >
                        <div className="w-[90px] h-[90px] flex-shrink-0 rounded-lg overflow-hidden border border-[#278d45]/10 bg-[#eaf7ef] flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.productName}
                              width={90}
                              height={90}
                              className="rounded-lg object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#278d45]/40">
                              Không có hình ảnh
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-[#0d401c]">{product.productName}</div>
                          <div className="text-sm text-[#278d45]">
                            Giá: {product.productPrice?.toLocaleString()}đ
                          </div>
                          <div className="text-sm text-[#278d45]">Đơn vị: {product.unit}</div>
                        </div>
                      </NextLink>
                    ))}
                  </div>
                )}
                <DialogClose asChild>
                  <button className="mt-6 px-4 py-2 rounded-lg font-semibold border border-[#278d45] hover:bg-[#eaf7ef] transition w-full hover:cursor-pointer text-[#278d45]">
                    Đóng
                  </button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      {error && (
        <div className="text-[#52320a] mt-8 text-center font-semibold bg-[#f8c32c]/20 border border-[#f8c32c]/40 rounded-xl py-5 max-w-xl mx-auto shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
