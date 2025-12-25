"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableItem from "./sortable-item";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Props {
  images: File[];
  setImages: (files: File[]) => void;
  error?: string;
}

export default function ImageUploader({ images, setImages, error }: Props) {
  // Reorder logic
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDragEnd = (e: any) => {
    const { active, over } = e;
    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((f) => f.name === active.id);
      const newIndex = images.findIndex((f) => f.name === over.id);
      setImages(arrayMove(images, oldIndex, newIndex));
    }
  };

  // Dropzone
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setImages([...images, ...acceptedFiles]);
    },
    [images],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: { "image/*": [] },
    onDrop,
  });

  const removeImage = (file: File) => {
    setImages(images.filter((img) => img !== file));
  };

  return (
    <div>
      {/* Dropzone */}
      <div className="border border-border p-2.5 rounded-lg">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
        ${isDragActive ? "border-green-500 bg-green-50" : "border-gray-400"}`}
        >
          <input {...getInputProps()} />
          <p>
            {isDragActive ? "Drop images…" : "Drag & drop or click to upload"}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Images should be in JPG, PNG or GIF format. Maximum size per image is
        5MB.
      </p>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Previews & sorting */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((f) => f.name)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-4 mt-4">
              {images.map((file) => (
                <SortableItem
                  key={file.name}
                  id={file.name}
                >
                  <div className="relative group">
                    <Image
                      src={URL.createObjectURL(file)}
                      className="w-full h-40 object-cover rounded-lg border"
                      alt={file.name}
                      width={160}
                      height={160}
                    />

                    <Button
                      type="button"
                      size={"icon"}
                      onClick={() => removeImage(file)}
                      className="absolute top-2 right-2 bg-black/75 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
