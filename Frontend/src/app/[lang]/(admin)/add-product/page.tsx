"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { baseUrl } from "@/lib/others/base-url";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Gapcursor from '@tiptap/extension-gapcursor'
import NextImage from 'next/image';
import formatDate from "@/lib/others/format-date";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/contexts/dictonary-context";
import formatVND from "@/lib/others/format-vnd";
import JsBarcode from 'jsbarcode';

type ProductFormValues = {
  productID: number;
  productName: string;
  productPrice?: number;
  quantityAvailable: number;
  categoryID: number;
  originID: number;
  subcategoryID: number;
  images: FileList;
  productPriceSale?: number;
  rating: number | null;
  createdAt: string;
  tagIDs: number[];
  isShow: boolean;
  expiredAt: Date | null;
  unit: string;
  barcode: string;
  boxBarcode: string;
};

type Category = {
  categoryID: string;
  categoryName: string;
};

type Subcategory = {
  subcategoryID: number;
  subcategoryName: string;
  quantityPerBox: number;
};
type Origin = {
  originID: string;
  originName: string;
};

type Tag = {
  tagID: string;
  tagName: string;
};

function generateBarcode() {
  // Generate a random 12-digit barcode as a string
  let barcode = '83';
  for (let i = 0; i < 10; i++) {
    barcode += Math.floor(Math.random() * 10).toString();
  }
  return barcode;
}

function generateBoxBarcode() {
  let boxBarcode = '88';
  for (let i = 0; i < 11; i++) {
    boxBarcode += Math.floor(Math.random() * 10).toString();
  }
  return boxBarcode;
}

export default function AddProductPage() {
  const methods = useForm<ProductFormValues>();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = methods;
  const [message, setMessage] = useState("");
  const { lang } = useDictionary();
  const router = useRouter();

  // State for dropdowns
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subCateIsChoosen, setSubCateIsChoosen] = useState<Subcategory>();
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editorImages, setEditorImages] = useState<File[]>([]);
  const [products, setProducts] = useState<ProductFormValues[]>([]);
  const [barcode, setBarcode] = useState("");
  const [barcodeImage, setBarcodeImage] = useState<string>("");
  const [boxBarcode, setBoxBarcode] = useState<{ boxBarcode: string, boxBarcodeImage: string }>({ boxBarcode: "", boxBarcodeImage: "" })

  // Fetch categories, origins, tags on mount
  useEffect(() => {
    fetch(`${baseUrl}/api/category`)
      .then(res => res.json())
      .then(data => setCategories(data || []));
    fetch(`${baseUrl}/api/origin`)
      .then(res => res.json())
      .then(data => setOrigins(data || []));
    fetch(`${baseUrl}/api/tag`)
      .then(res => res.json())
      .then(data => setTags(data || []));
  }, []);

  // Watch categoryID and fetch subcategories when it changes
  const selectedCategoryID = watch(`categoryID`);
  useEffect(() => {
    if (selectedCategoryID) {
      fetch(`${baseUrl}/api/subcategory?categoryID=${selectedCategoryID}`)
        .then(res => res.json())
        .then(data => setSubcategories(data || []));
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryID]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      BulletList,
      ListItem,
      Paragraph,
      Text,
      TaskList,
      HorizontalRule,
      TaskItem.configure({
        nested: true,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: {
          class: 'text-gray-900 dark:text-white font-bold',
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Gapcursor,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '<p>Hello World! 🌎️</p>',
  })

  const onSubmit = async (data: ProductFormValues) => {
    const filesToUpload = [...editorImages]; // Start with editor images 
    if (data.images && data.images.length > 0) {
      Array.from(data.images).forEach(file => filesToUpload.unshift(file)); // Add product's images to the front of array (images in text editor will be replaced after)
    }
    let uploadedUrls: string[] = []; // Store uploaded file URLs 
    try {
      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach(file => formData.append("files", file));
        const uploadRes = await fetch(`${baseUrl}/api/upload/multiple`, {
          method: "POST",
          body: formData,
        })
        const data = await uploadRes.json();
        uploadedUrls = (data.files as { url: string }[]).map(f => f.url) || []; // Extract URLs from response 
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setMessage("Failed to upload images.");
      return;
    }

    // replace local URLs in editor content with uploaded URLs
    let content = editor?.getJSON();
    let urlIndex = data.images ? data.images.length : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function replaceEditorImageUrls(node: any): any {
      if (!node) return node;
      if (Array.isArray(node)) {
        return node.map(replaceEditorImageUrls);
      }
      if (node.type === "image" && node.attrs?.src?.startsWith("blob:")) {
        // Replace with uploaded URL
        const url = uploadedUrls[urlIndex++];
        return { ...node, attrs: { ...node.attrs, src: url } };
      }
      if (node.content) {
        return { ...node, content: replaceEditorImageUrls(node.content) };
      }
      return node;
    }
    try { content = replaceEditorImageUrls(content); } catch (error) { console.error("Error processing editor content:", error); }

    try {
      //  3. Submit product
      console.log("Submitting product with data:", {
        ...data,
        productPrice: data.productPrice ? parseFloat(data.productPrice.toString()) : 0,
        productPriceSale: data.productPriceSale ? parseFloat(data.productPriceSale.toString()) : 0,
        quantityAvailable: data.quantityAvailable,
        tagIDs: data.tagIDs,
        images: uploadedUrls.slice(0, data.images ? data.images.length : 0),
        descriptionImages: uploadedUrls.slice(data.images ? data.images.length : 0),
        description: JSON.stringify(content),
      }
      );
      alert(data.boxBarcode); 
      const res = await fetch(`${baseUrl}/api/product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          boxQuantity: 0, // Add box quantity if needed
          productPrice: data.productPrice ? data.productPrice : 0,
          productPriceSale: data.productPriceSale ? data.productPriceSale : 0,
          quantityAvailable: data.quantityAvailable,
          tagIDs: data.tagIDs,
          images: uploadedUrls.slice(0, data.images ? data.images.length : 0),
          descriptionImages: uploadedUrls.slice(data.images ? data.images.length : 0),
          description: JSON.stringify(content),
          isShow: data.isShow || false,
          expiredAt: data.expiredAt ? new Date(data.expiredAt) : null,
          unit: data.unit || "",
        }),
      });

      if (res.ok) {
        setMessage("Product added successfully!");
        reset();
      } else {
        setMessage("Failed to add product.");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      setMessage("Failed to add product.");
    }

  };

  // Delete product and all related images
  const handleDeleteProduct = async (productID: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    // 1. Fetch product detail to get all image URLs
    const productRes = await fetch(`${baseUrl}/api/product/${productID}`);
    if (!productRes.ok) {
      setMessage("Failed to fetch product details.");
      return;
    }
    const product = await productRes.json();
    const allImageUrls = [
      ...(product.images || []),
      ...(product.descriptionImages || [])
    ].filter(Boolean);

    // 2. Delete all images from storage
    if (allImageUrls.length > 0) {
      await fetch(`${baseUrl}/api/upload/multi-delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: allImageUrls }),
      });
    }

    // 3. Delete product
    const res = await fetch(`${baseUrl}/api/product/${productID}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMessage("Product and images deleted.");
      fetchProducts();
    } else {
      setMessage("Failed to delete product.");
    }
  };

  const fetchProducts = async () => {
    const res = await fetch(`${baseUrl}/api/product`);
    if (res.ok) {
      const data = await res.json();
      setProducts(data);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);



  if (!editor) return null

  // Function to generate barcode image
  const handleGenerateBarcodeImage = () => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcode, { format: "EAN13", width: 2, height: 60, displayValue: true });
    setBarcodeImage(canvas.toDataURL("image/png"));
  };

  const handleGenerateBoxBarcodeImage = () => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, boxBarcode.boxBarcode, { format: "EAN13", width: 2, height: 60, displayValue: true });
    setBoxBarcode({ ...boxBarcode, boxBarcodeImage: canvas.toDataURL("image/png") })
  };

  console.log("boxBarcode", boxBarcode);

  return (
    <main className="mx-auto p-10">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <FormProvider {...methods}>


        <FormItem>
          <FormLabel>Product Name</FormLabel>
          <FormControl>
            <Input {...register("productName", { required: true })} />
          </FormControl>
          {errors.productName && <FormMessage>Product name is required</FormMessage>}
        </FormItem>

        <FormItem>
          <FormLabel>Price</FormLabel>
          <FormControl>
            <Input type="text"
              min={0}
              step={1}
              {...register("productPrice", {

                min: { value: 1, message: "Price must be at least 1" },
                setValueAs: v => {
                  const num = Number(v);
                  return num < 1000 ? num * 1000 : num;
                },

              })}
              onBlur={e => {
                const value = Number(e.target.value);
                if (value > 0 && value < 1000) {
                  e.target.value = formatVND(value * 1000);
                } else if (value > 0 && value >= 1000) {
                  e.target.value = formatVND(value);
                } else {
                  e.target.value = "";
                }
              }}
              placeholder="e.g. 100 (will be 100.000)" />
          </FormControl>
          {errors.productPrice && <FormMessage>Price is required</FormMessage>}
        </FormItem>

        <FormItem>
          <FormLabel>Product price sale</FormLabel>
          <FormControl>
            <Input
              type="text"
              min={0}
              step={1}
              {...register("productPriceSale", {
                setValueAs: v => {
                  const num = Number(v);
                  return num < 1000 ? num * 1000 : num;
                },
              })}
              onBlur={e => {
                const value = Number(e.target.value);
                if (value > 0 && value < 1000) {
                  e.target.value = formatVND(value * 1000);
                } else if (value > 0 && value >= 1000) {
                  e.target.value = formatVND(value);
                } else {
                  e.target.value = "";
                }
              }}
              placeholder="e.g. 100 (will be 100.000)"
            />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Quantity</FormLabel>
          <FormControl>
            <Input type="number" {...register("quantityAvailable", { required: true })} />
          </FormControl>
          {errors.quantityAvailable && <FormMessage>Quantity is required</FormMessage>}
        </FormItem>

        <FormItem>
          <FormLabel>Category</FormLabel>
          <FormControl>
            <select {...register("categoryID", { required: true })} defaultValue="">
              <option value="" disabled>Select category</option>
              {categories.map((cat) => (
                <option key={cat.categoryID} value={cat.categoryID}>{cat.categoryName}</option>
              ))}
            </select>
          </FormControl>
          {errors.categoryID && <FormMessage>Category is required</FormMessage>}
        </FormItem>

        <FormItem>
          <FormLabel>Subcategory</FormLabel>
          <FormControl>
            <select
              {...register("subcategoryID")}
              defaultValue=""
              onChange={e => {
                const selectedID = Number(e.target.value);
                const chosen = subcategories.find(sub => sub.subcategoryID === selectedID);
                setSubCateIsChoosen(chosen);
                setValue("subcategoryID", selectedID); // keep react-hook-form in sync
              }}
            >
              <option value="">Select subcategory</option>
              {subcategories.map((sub) => (
                <option key={sub.subcategoryID} value={sub.subcategoryID}>{sub.subcategoryName}</option>
              ))}
            </select>

          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Origin</FormLabel>
          <FormControl>
            <select {...register("originID")}>
              <option value="">Select origin</option>
              {origins.map((origin) => (
                <option key={origin.originID} value={origin.originID}>{origin.originName}</option>
              ))}
            </select>
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Tags</FormLabel>
          <FormControl>
            <select multiple {...register("tagIDs")}>
              {tags.length > 0 && tags.map((tag) => (
                <option key={tag.tagID} value={tag.tagID}>{tag.tagName}</option>
              ))}
            </select>
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Is Show</FormLabel>
          <FormControl>
            <Input type="checkbox" {...register("isShow")} />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel>Expired At</FormLabel>
          <FormControl>
            <Input type="date" {...register("expiredAt")} />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Images</FormLabel>
          <FormControl>
            <Input type="file" multiple {...register("images")} />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel>Unit</FormLabel>
          <FormControl>
            <Input type="text" {...register("unit", { required: true })} placeholder="e.g. kg, pcs, etc." />
          </FormControl>
        </FormItem>

        {message && <FormMessage className="mt-2">{message}</FormMessage>}

        <div>
          <label className="font-medium mb-1 block">Nội dung bài viết *</label>
          <div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>H4</button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}>H5</button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}>H6</button>
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'is-active' : ''}
              >
                Toggle bullet list
              </button>
              <button
                onClick={() => editor.chain().focus().splitListItem('listItem').run()}
                disabled={!editor.can().splitListItem('listItem')}
              >
                Split list item
              </button>
              <button
                onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
                disabled={!editor.can().sinkListItem('listItem')}
              >
                Sink list item
              </button>
              <button
                onClick={() => editor.chain().focus().liftListItem('listItem').run()}
                disabled={!editor.can().liftListItem('listItem')}
              >
                Lift list item
              </button>

              <div> Hello </div>
              <button
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={editor.isActive('taskList') ? 'is-active' : ''}
              >
                Toggle task list
              </button>
              <button
                onClick={() => editor.chain().focus().splitListItem('taskItem').run()}
                disabled={!editor.can().splitListItem('taskItem')}
              >
                Split list item
              </button>
              <button
                onClick={() => editor.chain().focus().sinkListItem('taskItem').run()}
                disabled={!editor.can().sinkListItem('taskItem')}
              >
                Sink list item
              </button>
              <button
                onClick={() => editor.chain().focus().liftListItem('taskItem').run()}
                disabled={!editor.can().liftListItem('taskItem')}
              >
                Lift list item
              </button>

              <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>Left</button>
              <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</button>
              <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>Right</button>
              <button onClick={() => {
                const url = prompt('Enter URL')
                if (url) editor.chain().focus().setLink({ href: url }).run()
              }}>Link</button>
              <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>Ordered List</button>
              <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>Blockquote</button>
              <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code Block</button>

              <label>
                Image
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // Store the file in a state array for later upload
                    setEditorImages(prev => [...prev, file]);
                    // Optionally show a preview in the editor using a local URL
                    const url = URL.createObjectURL(file);
                    editor.chain().focus().setImage({ src: url }).run();
                  }}
                />
              </label>

              <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                Set horizontal rule
              </button>
              <button
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                }
              >
                Insert table
              </button>
              <button onClick={() => editor.chain().focus().addColumnBefore().run()}>
                Add column before
              </button>
              <button onClick={() => editor.chain().focus().addColumnAfter().run()}>Add column after</button>
              <button onClick={() => editor.chain().focus().deleteColumn().run()}>Delete column</button>
              <button onClick={() => editor.chain().focus().addRowBefore().run()}>Add row before</button>
              <button onClick={() => editor.chain().focus().addRowAfter().run()}>Add row after</button>
              <button onClick={() => editor.chain().focus().deleteRow().run()}>Delete row</button>
              <button onClick={() => editor.chain().focus().deleteTable().run()}>Delete table</button>
              <button onClick={() => editor.chain().focus().mergeCells().run()}>Merge cells</button>
              <button onClick={() => editor.chain().focus().splitCell().run()}>Split cell</button>
              <button onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>
                Toggle header column
              </button>
              <button onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
                Toggle header row
              </button>
              <button onClick={() => editor.chain().focus().toggleHeaderCell().run()}>
                Toggle header cell
              </button>
              <button onClick={() => editor.chain().focus().mergeOrSplit().run()}>Merge or split</button>
              <button onClick={() => editor.chain().focus().setCellAttribute('colspan', 2).run()}>
                Set cell attribute
              </button>
              <button onClick={() => editor.chain().focus().fixTables().run()}>Fix tables</button>
              <button onClick={() => editor.chain().focus().goToNextCell().run()}>Go to next cell</button>
              <button onClick={() => editor.chain().focus().goToPreviousCell().run()}>
                Go to previous cell
              </button>
            </div>
            <EditorContent editor={editor} className='tiptap-content' />
          </div>
          <div className="element"></div>
        </div>
        {/* Barcode Field */}
        <FormItem>
          <FormLabel>Barcode (12 digits)</FormLabel>
          <FormControl>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input
                {...register("barcode", {
                  required: true,
                  pattern: { value: /^83+\d{10}$/, message: "Barcode must be 12 digits and start with 83" },
                })}
                value={barcode}
                // replace non-numeric characters and limit to 12 digits
                onChange={e => setBarcode(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                placeholder="Enter or generate barcode"
              />
              <Button type="button" onClick={() => {
                const newBarcode = generateBarcode();
                setBarcode(newBarcode);
                setValue("barcode", newBarcode);
              }}>Generate</Button>
              <Button type="button" onClick={handleGenerateBarcodeImage} disabled={barcode.length !== 12}>
                Generate Barcode Image
              </Button>
            </div>

          </FormControl>
          {barcodeImage && (
            <div style={{ marginTop: 8 }}>
              <img src={barcodeImage} alt="Barcode" style={{ background: '#fff', padding: 4, border: '1px solid #eee' }} />
            </div>
          )}
          {errors.barcode && <FormMessage>{errors.barcode.message || "Barcode is required"}</FormMessage>}
        </FormItem>
        {subCateIsChoosen && subCateIsChoosen.quantityPerBox > 0 &&
          (<FormItem>
            <FormLabel>Barcode (14 digits and start with 88+)</FormLabel>
            <FormControl>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input
                  {...register("boxBarcode", {
                    required: true,
                    pattern: { value: /^88+\d{11}$/, message: "Barcode must be 14 digits and start with 88" },
                  })}
                  value={boxBarcode.boxBarcode}
                  onChange={e => setBarcode(e.target.value.replace(/[^0-9]/g, '').slice(0, 14))}
                  placeholder="Enter or generate barcode"
                />
                <Button type="button" onClick={() => {
                  const newBarcode = generateBoxBarcode();
                  // setBoxBarcode({ ...boxBarcode, boxBarcode: newBarcode });
                  // setValue("boxBarcode", newBarcode);
                  setBoxBarcode({ boxBarcode: newBarcode, boxBarcodeImage: "" });
                  setValue("boxBarcode", newBarcode);
                }}>Generate</Button>
                <Button type="button" onClick={handleGenerateBoxBarcodeImage} disabled={boxBarcode.boxBarcode.length !== 13}>
                  Generate Box Barcode
                </Button>
              </div>

            </FormControl>
            {boxBarcode.boxBarcodeImage && (
              <div style={{ marginTop: 8 }}>
                <img src={boxBarcode.boxBarcodeImage} alt="Barcode" style={{ background: '#fff', padding: 4, border: '1px solid #eee' }} />
              </div>
            )}
          {errors.boxBarcode && <FormMessage>{errors.boxBarcode.message || "Barcode is required"}</FormMessage>}
          </FormItem>)
        }
        <Button variant="default" type="submit" className="mt-4" onClick={handleSubmit(onSubmit)}>Supj mit</Button>
      </FormProvider >
      <h2 className="text-xl font-semibold mt-10 mb-2">Product List</h2>
      <div className="space-y-2">
        {products.map((prod) => (
          <div key={prod.productID} className="flex items-center gap-2 border-b py-2">
            <span className="font-medium">
              {prod.images.length > 0 && typeof prod.images[0] === "string" && (
                <NextImage
                  src={prod.images[0]}
                  alt={prod.productName}
                  width={50}
                  height={50}
                />
              )}
            </span>
            <span className="font-medium">{prod.productName}</span>
            <span className="text-gray-500 text-sm">{prod.productPrice ? formatVND(prod.productPrice) : 0} VND</span>
            <span className="text-gray-500 text-sm">Gia giam{prod.productPriceSale ? formatVND(prod.productPriceSale) : 0}₫</span>
            <span className="text-gray-500 text-sm">SL: {prod.quantityAvailable}</span>
            <span className="text-gray-500 text-sm">
              Category:
              {categories.find(cat => parseInt(cat.categoryID) === prod.categoryID)?.categoryName || "No category"}
            </span>
            {/* <span className="text-gray-500 text-sm">
              SubCategory:
              {subcategories.find(sub => sub.subcategoryID === prod.subcategoryID)?.subcategoryName || "No subcategory"}
            </span> */}
            <span className="text-gray-500 text-sm">
              Rating:
              {prod.rating ? prod.rating.toFixed(1) : "No rating"}
            </span>
            <span className="text-gray-500 text-sm">SL: {prod.quantityAvailable}</span>
            <span className="text-gray-500 text-sm">Ngay tao{prod.createdAt ? formatDate(prod.createdAt) : ""}</span>

            <Button size="sm" variant="outline" onClick={() => {
              router.push(`/${lang}/edit-product/${prod.productID}`);
            }}>Edit</Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(prod.productID)}>Delete</Button>

          </div>
        ))}
      </div>
    </main >
  );
}