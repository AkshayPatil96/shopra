// // app/seller/products/add/VariantBuilder.tsx
// "use client";

// import { useState } from "react";
// import { useFieldArray, useFormContext } from "react-hook-form";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { X } from "lucide-react";
// import { cn } from "@/lib/utils";
// import {
//   ProductFormValues,
//   ProductVariantValues,
//   VariantAttributeValues,
// } from "@repo/shared-types";

// interface VariantBuilderProps {
//   basePrice: number;
//   onVariantsChange: (
//     variants: ProductVariantValues[],
//     attrs: VariantAttributeValues[],
//   ) => void;
// }

// export function VariantBuilder({
//   basePrice,
//   onVariantsChange,
// }: VariantBuilderProps) {
//   const { control, watch, setValue } = useFormContext<ProductFormValues>();

//   const {
//     fields: attributeFields,
//     append,
//     remove,
//   } = useFieldArray({
//     control,
//     name: "variants",
//   });

//   const variants = watch("variants") || [];

//   const [tempValues, setTempValues] = useState<Record<string, string>>({});

//   const handleAttributeKeyChange = (index: number, key: string) => {
//     const updated = [...(watch("variants") || [])];
//     updated[index] = {
//       ...updated[index],
//       key,
//     } as VariantAttributeValues;
//     setValue("variants", updated);
//   };

//   const handleAttributeValuesChange = (index: number, value: string) => {
//     const values = value
//       .split(",")
//       .map((v) => v.trim())
//       .filter(Boolean);

//     const updated = [...(watch("variantAttributes") || [])];
//     updated[index] = {
//       ...updated[index],
//       values,
//     } as VariantAttributeValues;
//     setValue("variantAttributes", updated);
//   };

//   // Generate cartesian product of attributes to variants
//   const regenerateVariants = () => {
//     const attrs = (watch("variantAttributes") || []).filter(
//       (a) => a.key && (a.values?.length || 0) > 0,
//     );

//     if (attrs.length === 0) {
//       setValue("variants", []);
//       onVariantsChange([], attrs);
//       return;
//     }

//     type AttrMap = Record<string, string>;

//     const cartesian = (index = 0, current: AttrMap = {}): AttrMap[] => {
//       if (index === attrs.length) return [current];
//       const attr = attrs[index];
//       const results: AttrMap[] = [];
//       for (const val of attr.values) {
//         results.push(
//           ...cartesian(index + 1, {
//             ...current,
//             [attr.key]: val,
//           }),
//         );
//       }
//       return results;
//     };

//     const combos = cartesian();

//     // Merge with existing where possible (keep price, stock, sku)
//     const newVariants: ProductVariantValues[] = combos.map((combo) => {
//       const existing = variants.find((v) => {
//         const a = v.attributes || {};
//         const keys = Object.keys(combo);
//         return keys.every((k) => a[k] === combo[k]);
//       });

//       return {
//         attributes: combo,
//         price: existing?.price ?? basePrice ?? 0,
//         stock: existing?.stock ?? 0,
//         sku: existing?.sku ?? generateSkuFromAttributes(combo),
//         imageUrl: existing?.imageUrl ?? "",
//         id: existing?.id,
//       };
//     });

//     setValue("variants", newVariants);
//     onVariantsChange(newVariants, attrs);
//   };

//   const generateSkuFromAttributes = (attrs: Record<string, string>) => {
//     const parts = Object.values(attrs).map((v) =>
//       v.toUpperCase().replace(/\s+/g, "-"),
//     );
//     return `SKU-${parts.join("-")}`;
//   };

//   return (
//     <div className="space-y-4">
//       {/* Attribute definition */}
//       <div className="space-y-3">
//         <div className="flex items-center justify-between">
//           <h3 className="font-medium text-sm">Variant attributes</h3>
//           <Button
//             type="button"
//             size="sm"
//             variant="outline"
//             onClick={() => append({ key: "", values: [] })}
//           >
//             + Add attribute
//           </Button>
//         </div>

//         {attributeFields.length === 0 && (
//           <p className="text-xs text-muted-foreground">
//             Add attributes like <b>Color</b>, <b>Size</b>, <b>Storage</b>, etc.
//           </p>
//         )}

//         <div className="space-y-2">
//           {attributeFields.map((field, index) => {
//             const current = (watch("variantAttributes") || [])[index];

//             return (
//               <div
//                 key={field.id}
//                 className="flex flex-col md:flex-row gap-2 items-start md:items-center"
//               >
//                 <Input
//                   className="md:w-40"
//                   placeholder="Attribute (e.g. Color)"
//                   value={current?.key ?? ""}
//                   onChange={(e) =>
//                     handleAttributeKeyChange(index, e.target.value)
//                   }
//                 />
//                 <Input
//                   className="flex-1"
//                   placeholder="Values (comma separated, e.g. Red, Blue, Black)"
//                   defaultValue={(current?.values || []).join(", ")}
//                   onBlur={(e) =>
//                     handleAttributeValuesChange(index, e.target.value)
//                   }
//                 />
//                 <Button
//                   type="button"
//                   size="icon"
//                   variant="ghost"
//                   onClick={() => remove(index)}
//                 >
//                   <X className="w-4 h-4" />
//                 </Button>
//               </div>
//             );
//           })}
//         </div>

//         {attributeFields.length > 0 && (
//           <Button
//             type="button"
//             variant="secondary"
//             size="sm"
//             onClick={regenerateVariants}
//           >
//             Generate variants
//           </Button>
//         )}
//       </div>

//       {/* Variant table */}
//       {variants.length > 0 && (
//         <div className="space-y-2">
//           <h3 className="font-medium text-sm">
//             Generated variants ({variants.length})
//           </h3>
//           <div className="overflow-x-auto border rounded-lg">
//             <table className="w-full text-sm">
//               <thead className="bg-muted">
//                 <tr>
//                   <th className="px-2 py-2 text-left">Attributes</th>
//                   <th className="px-2 py-2 text-left w-24">Price</th>
//                   <th className="px-2 py-2 text-left w-24">Stock</th>
//                   <th className="px-2 py-2 text-left w-40">SKU</th>
//                   <th className="px-2 py-2 text-left w-40">Image URL</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {variants.map((variant, idx) => (
//                   <tr
//                     key={idx}
//                     className="border-t"
//                   >
//                     <td className="px-2 py-2">
//                       <div className="flex flex-wrap gap-1">
//                         {Object.entries(variant.attributes || {}).map(
//                           ([k, v]) => (
//                             <span
//                               key={k}
//                               className="text-xs px-2 py-1 rounded-full bg-secondary"
//                             >
//                               {k}: {v}
//                             </span>
//                           ),
//                         )}
//                       </div>
//                     </td>

//                     <td className="px-2 py-2">
//                       <Input
//                         type="number"
//                         min={0}
//                         step="0.01"
//                         className="h-8"
//                         value={variant.price ?? basePrice ?? 0}
//                         onChange={(e) => {
//                           const value = parseFloat(e.target.value || "0");
//                           const updated = [...variants];
//                           updated[idx] = {
//                             ...updated[idx],
//                             price: value,
//                           };
//                           setValue("variants", updated);
//                           onVariantsChange(
//                             updated,
//                             watch("variantAttributes") || [],
//                           );
//                         }}
//                       />
//                     </td>

//                     <td className="px-2 py-2">
//                       <Input
//                         type="number"
//                         min={0}
//                         step="1"
//                         className="h-8"
//                         value={variant.stock ?? 0}
//                         onChange={(e) => {
//                           const value = parseInt(e.target.value || "0", 10);
//                           const updated = [...variants];
//                           updated[idx] = {
//                             ...updated[idx],
//                             stock: value,
//                           };
//                           setValue("variants", updated);
//                           onVariantsChange(
//                             updated,
//                             watch("variantAttributes") || [],
//                           );
//                         }}
//                       />
//                     </td>

//                     <td className="px-2 py-2">
//                       <Input
//                         className="h-8"
//                         value={variant.sku ?? ""}
//                         onChange={(e) => {
//                           const updated = [...variants];
//                           updated[idx] = {
//                             ...updated[idx],
//                             sku: e.target.value,
//                           };
//                           setValue("variants", updated);
//                           onVariantsChange(
//                             updated,
//                             watch("variantAttributes") || [],
//                           );
//                         }}
//                       />
//                     </td>

//                     <td className="px-2 py-2">
//                       <Input
//                         className="h-8"
//                         placeholder="https://..."
//                         value={variant.imageUrl ?? ""}
//                         onChange={(e) => {
//                           const updated = [...variants];
//                           updated[idx] = {
//                             ...updated[idx],
//                             imageUrl: e.target.value,
//                           };
//                           setValue("variants", updated);
//                           onVariantsChange(
//                             updated,
//                             watch("variantAttributes") || [],
//                           );
//                         }}
//                       />
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <p className="text-xs text-muted-foreground">
//             You can fine-tune price, stock, SKU and image per variant.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }
