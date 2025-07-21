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
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="px-6 py-10 font-sans">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Chẩn đoán bệnh lúa" }]} />
      <h1 className="text-2xl font-bold mb-6 mt-6 uppercase text-center">CHẨN ĐOÁN BỆNH DỰA TRÊN LÁ LÚA</h1>
      <p className="flex items-center gap-2 py-4"><span><CircleAlert /></span><span>Sử dụng hình ảnh lá lúa chất lượng, không bị mờ sẽ giúp hệ thống chẩn đoán chính xác hơn.</span></p>
      <div className="grid grid-cols-[1fr_1px_1fr] gap-6">
        <div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-4 mb-6"
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
              className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[300px] ${dragActive ? "border-primary bg-primary/10" : "border-gray-300 bg-gray-50"}`}
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
                <div className="relative w-full min-h-[300px] max-h-[500px] rounded-xl overflow-hidden shadow mb-2">
                  <Image
                    width={320}
                    height={240}
                    src={URL.createObjectURL(file)}
                    alt="Uploaded"
                    className="w-full h-full object-contain rounded-xl"
                  />
                  <AnimatePresence>
                    {loading && (
                      <motion.div
                        key="scan"
                        initial={{ y: -240, opacity: 0.7 }}
                        animate={{ y: 240, opacity: 0.7 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", ease: "linear" }}
                        className="absolute left-0 w-full h-8 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20 rounded-xl pointer-events-none z-10 blur-sm"
                      />
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <span className="text-gray-500 text-sm mb-2">Kéo thả hoặc click để tải ảnh bệnh lúa</span>
                  <span className="text-xs text-gray-400">(Chọn một ảnh)</span>
                </>
              )}
            </div>
            <div className="flex justify-end w-full">
              <button type="submit" disabled={!file || loading} className="px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition">
                {loading ? "Đang chẩn đoán..." : "Chẩn đoán"}
              </button>
            </div>
          </form>
        </div>
        <div className="bg-gray-200" />
        <div>
          <h3 className="text-xl font-semibold text-primary mb-2">Kết quả chẩn đoán</h3>
          {diseaseDetails.length === 0 && !result && !error && (
            <div className="text-gray-500 text-center">Chưa có kết quả chẩn đoán.</div>
          )}
          {diseaseDetails.length > 1 && result && !error && (
            <div className="text-gray-500 flex gap-x-2 bg-yellow-100 p-2 rounded-md"><span><CircleAlert /></span> <span>Vui lòng kiểm tra xem có bệnh nào dưới đây trùng với thiệt hại trên cây lúa của bạn không</span></div>
          )}
          {
            <div className="mt-6">
              {/* Show fetched disease details */}
              {diseaseDetails.length > 0 && (
                <div className="mt-6">
                  <div className="grid gap-6">
                    {diseaseDetails.map((disease, idx) => (
                      <div key={disease.diseaseID || idx} className="border rounded-xl p-4">
                        <div className="flex gap-x-4">
                          <div className="flex-shrink-0 w-[100px] h-[100px]">
                            <Image key={disease.diseaseID || idx} src={disease && disease.images && disease.images.length > 0 ? disease.images[0] : "Không có hình ảnh"} alt="Disease" width={80} height={80} className="rounded-lg object-cover border shadow w-full h-full" />
                          </div>
                          <div className="space-y-1"> <div className="font-bold text-2xl text-primary uppercase">{disease.diseaseName}</div>
                            <div className="text-sm text-gray-600"><b>Tên tiếng Anh:</b> {disease.diseaseEnName}</div>
                            <div className="text-sm text-gray-600"><b>Tác nhân:</b> {disease.ricePathogen}</div></div>
                        </div>
                        <div className="flex justify-end">
                          <button className="mt-2 px-4 py-2 border-gray-200 border-[1px] text-primary rounded-lg hover:bg-primary/90 hover:text-white hover:cursor-pointer transition flex items-center gap-x-2" onClick={() => {
                            setSelectedDisease(disease);
                            setDialogOpen(true);
                          }}><span>Xem chi tiết bệnh</span><span><Eye /></span></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Disease Details Dialog */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="uppercase text-center text-2xl">{selectedDisease?.diseaseName || 'Chi tiết bệnh'}</DialogTitle>
                  </DialogHeader>
                  <div className="mb-4 space-y-2">
                    <div className="mb-4 max-w-full flex justify-center gap-x-2">
                      {selectedDisease?.images && selectedDisease.images.length > 0 ? (
                        <div className="w-[300px] h-[300px]">
                          <Image src={selectedDisease.images[0]} alt="Disease" width={80} height={80} className="rounded-lg object-cover border shadow w-full h-full" />
                        </div>
                      ) : (
                        "Không có hình ảnh"
                      )}
                    </div>
                    <div className="">Tên tiếng Anh: <span className="text-xl font-semibold">{selectedDisease?.diseaseEnName}</span></div>
                    <div className="">Tác nhân: <span className="text-xl font-semibold">{selectedDisease?.ricePathogen}</span></div>
                  </div>
                  <div className="prose prose-blue max-w-none tiptap-content mb-8">
                    {selectedDisease?.symptoms && <EditorContent editor={editor} className="tiptap-editor" />}
                  </div>
                  <DialogClose asChild>
                    <div className="flex gap-x-4">
                      <button className="mt-2 px-4 py-2 rounded-lg font-semibold border-1 border-gray-400 hover:bg-gray-200 transition w-full hover:cursor-pointer">Đóng</button>
                      <button
                        className="mt-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition w-full hover:cursor-pointer"
                        onClick={() => {
                          if (selectedDisease && selectedDisease.diseaseID) {
                            handleViewProducts(selectedDisease.diseaseID);
                          }
                          setDialogOpen(false);
                        }}
                      >Xem thuốc</button>
                    </div>
                  </DialogClose>
                </DialogContent>
              </Dialog>
              {/* Products Dialog */}
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Danh sách sản phẩm liên quan đến bệnh</DialogTitle>
                    <p className="flex items-center gap-x-2 p-2 bg-yellow-100 rounded-md"><span><CircleAlert /></span><span>Chỉ chọn một sản phẩm để giải quyết vấn đề hiện tại. Khuyến khích sản phẩm ít độc hại cho lúa.</span></p>
                  </DialogHeader>
                  {loadingProducts ? (
                    <div className="text-center py-8">Đang tải sản phẩm...</div>
                  ) : productsForDisease.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Không có sản phẩm nào liên quan đến bệnh này.</div>
                  ) : (
                    <div className="grid gap-4">
                      {productsForDisease.map((product, idx) => (
                        <NextLink href={`/vi/homepage/product-details/${product.productID}`} key={product.productID || idx} className="border rounded-xl p-4 flex gap-x-4 items-center">
                          <div className="w-[80px] h-[80px] flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <Image src={product.images[0]} alt={product.productName} width={80} height={80} className="rounded-lg object-cover border shadow w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">Không có hình ảnh</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-lg text-primary">{product.productName}</div>
                            <div className="text-sm text-gray-600">Giá: {product.productPrice?.toLocaleString()}đ</div>
                            <div className="text-sm text-gray-600">Đơn vị: {product.unit}</div>
                          </div>
                        </NextLink>
                      ))}
                    </div>
                  )}
                  <DialogClose asChild>
                    <button className="mt-6 px-4 py-2 rounded-lg font-semibold border-1 border-gray-400 hover:bg-gray-200 transition w-full hover:cursor-pointer">Đóng</button>
                  </DialogClose>
                </DialogContent>
              </Dialog>









              {/* {processedImg && (
                <div className="mt-6">
                  <div className="font-semibold mb-2 text-gray-700">Processed Image:</div>
                  <Image
                    width={320}
                    height={240}
                    src={`data:image/jpeg;base64,${processedImg}`}
                    alt="Processed"
                    className="w-full h-56 object-cover rounded-xl border shadow"
                  />
                </div>
              )} */}
            </div>
          }
        </div>
      </div>
      {error && <div className="text-red-500 mt-4 text-center font-semibold">{error}</div>}
    </div>
  );
}
