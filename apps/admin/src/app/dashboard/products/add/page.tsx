"use client"

import { AutoForm, AutoFormSubmit, Input, Label } from "@gramflow/ui";
import { DependencyType } from "@gramflow/ui/src/auto-form/types";
import { cn } from "@gramflow/utils";
import { ca } from "date-fns/locale";
import { Trash2Icon } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { z } from "zod";
import { fontSans } from "~/lib/fonts";
import { motion } from "framer-motion";

const CategorySchema = z.array(z.string());

// const genderSchema = 
const BaseFashionSchema = z.array(z.string())

//https://imagedelivery.net/nW2YfjVFqxC-ok-_zXWXQw/210c0210-241c-4f46-42b9-d10f2f68ee00/public

const formSchema = z.object({

    title: z.string(),
    gender: z.enum(["Men", "Women"]),
    category: z.enum([
        "Top Wear", "Bottom Wear", "Dresses", "Ethnic Wear", "Activewear", "Accessories", "Innerwear", "Outerwear"
    ]),
    subCategory: z.enum([
        "Tops", "T-shirts", "Shirts", "Blouses", "Sweaters", "Cardigans", "Hoodies", "Sweatshirts", "Jackets", "Blazers",
        "Jeans", "Trousers", "Leggings", "Skirts", "Shorts",
        "Casual Dresses", "Evening Dresses", "Maxi Dresses", "Cocktail Dresses", "Summer Dresses",
        "Sarees", "Salwar Suits", "Kurtis/Kurtas", "Lehengas", "Anarkalis",
        "Sports Bras", "Yoga Pants", "Athletic Tops", "Running Shorts", "Workout Leggings",
        "Bras", "Panties", "Lingerie Sets", "Shapewear", "Camisoles",
        "Coats", "Jackets", "Blazers", "Parkas", "Vests",
        "Handbags", "Clutches", "Wallets", "Scarves", "Hats", "Belts", "Sunglasses", "Watches", "Jewelry", "Hair Accessories", "Perfumes/Fragrances", "Footwear", "Beauty & Personal Care",
    ]),
    description: z.string(),
    price: z.number(),
    inventory: z.array(
        z.object({
            size: z.enum(
                [
                    "XXS",
                    "XS",
                    "S",
                    "M",
                    "L",
                    "XL",
                    "XXL",
                    "XXXL",
                    "Free Size",
                    "One Size"
                ]
            ),
            measurements: z.object({
                "Bust": z.number().optional(), "Waist": z.number().optional(), "Hips": z.number().optional(), "Length": z.number().optional(), "Shoulder": z.number().optional(), "Sleeve": z.number().optional(),
                Rise: z.number().optional(), Inseam: z.number().optional(), Thigh: z.number().optional(), "Chest": z.number().optional(), "Neck": z.number().optional(), "Armhole": z.number().optional(), "Cuff": z.number().optional()
            }),
            variant: z.array(z.object({
                name: z.string(),
                quantity: z.number(),
            })),
        })
    ),
    dimension: z.object({
        length: z.number(),
        width: z.number(),
        height: z.number(),
        weights: z.number(),
    }),
    publish: z.boolean().default(false),
});

interface ImagePreview {
    src: string;
    alt: string;
}
export default function ProductAddPage() {
    const [images, setImages] = useState<ImagePreview[]>([]);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedImages = Array.from(event.target.files || []);
        const imagePreviews: ImagePreview[] = selectedImages.map((image) => ({
            src: URL.createObjectURL(image),
            alt: image.name,
        }));
        console.log({ imagePreviews });
        setImages((prevImages) => [...prevImages, ...imagePreviews]);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 mx-6">
                {
                    images.map((image) => {
                        return (
                            <div className="relative">
                                <Trash2Icon size={20} className="absolute top-2 right-2 flex items-center justify-center text-red-500" onClick={() => {
                                    setImages((prevImages) => prevImages.filter((prevImage) => prevImage.src !== image.src));
                                    //remove the images from the ref
                                    // const imageFiles = imageInputRef.current?.files;
                                    // const newFiles = Array.from(imageFiles || []).filter((file) => file.name !== image.alt);
                                    // if (imageInputRef.current) {
                                    //     // @ts-ignore
                                    //     imageInputRef.current.files = newFiles;
                                    // }
                                }} />
                                <img className="rounded" height={100} width={100} src={image.src} />
                            </div>
                        )
                    })
                }
            </motion.div>

            <div className="grid gap-3 mx-6">
                <Label className="font-semibold" typeof="image" htmlFor="images">Product Images <span className="text-red-500">*</span></Label>
                <Input ref={
                    imageInputRef
                }
                    className="w-fit" accept="image/*" type="file" multiple={true} onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        const selectedImages = Array.from(event.target.files || []);
                        const imagePreviews: ImagePreview[] = selectedImages.map((image) => ({
                            src: URL.createObjectURL(image),
                            alt: image.name,
                        }));
                        console.log({ imagePreviews });
                        setImages(imagePreviews);
                    }} />
            </div>
            <AutoForm

                className={cn("max-w-lg mx-3 px-3", fontSans.className)}
                formSchema={formSchema}
                onSubmit={(values) => {
                    console.log({ values, images: images.map((image) => image.alt) })
                    return values;
                }}
                fieldConfig={{

                    dimension: {
                        length: {
                            description: "Length in cm"
                        },
                        width: {
                            description: "Width in cm"
                        },
                        height: {
                            description: "Height in cm"
                        },
                        weights: {
                            description: "Weight in gm"
                        }
                    },
                    publish: {
                        // description: "Immediately publish this product",
                        fieldType: "switch",
                    },
                }}
                dependencies={[
                    {
                        type: DependencyType.SETS_OPTIONS,
                        sourceField: "gender",
                        targetField: "category",
                        when: (gender) =>
                            gender === "Women",
                        options: ["Top Wear", "Bottom Wear", "Dresses", "Ethnic Wear", "Activewear", "Accessories", "Innerwear", "Outerwear"],
                    }, {
                        type: DependencyType.SETS_OPTIONS,
                        sourceField: "category",
                        targetField: "subCategory",
                        when: (category) => category === "Top Wear",
                        options: ["Tops", "T-shirts", "Shirts", "Blouses", "Sweaters", "Cardigans", "Hoodies", "Sweatshirts", "Jackets", "Blazers"]
                    },
                    {
                        type: DependencyType.SETS_OPTIONS,
                        sourceField: "category",
                        targetField: "subCategory",
                        when: (category) => category === "Bottom Wear",
                        options: ["Jeans", "Trousers", "Leggings", "Skirts", "Shorts"]
                    },
                    {
                        type: DependencyType.SETS_OPTIONS,
                        sourceField: "category",
                        targetField: "subCategory",
                        when: (category) => category === "Dresses",
                        options: ["Casual Dresses", "Evening Dresses", "Maxi Dresses", "Cocktail Dresses", "Summer Dresses"]
                    },
                    {
                        type: DependencyType.SETS_OPTIONS,
                        sourceField: "category",
                        targetField: "subCategory",
                        when: (category) => category === "Ethnic Wear",
                        options: ["Sarees", "Salwar Suits", "Kurtis/Kurtas", "Lehengas", "Anarkalis"]
                    },
                    {
                        type: DependencyType.SETS_OPTIONS,
                        sourceField: "category",
                        targetField: "subCategory",
                        when: (category) => category === "Activewear",
                        options: ["Sports Bras", "Yoga Pants", "Athletic Tops", "Running Shorts", "Workout Leggings"]
                    },
                    {
                        type: DependencyType.SETS_OPTIONS,
                        sourceField: "category",
                        targetField: "subCategory",
                        when: (category) => category === "Innerwear",
                        options: ["Bras", "Panties", "Lingerie Sets", "Shapewear", "Camisoles"]
                    },
                    {
                        type: DependencyType.SETS_OPTIONS,
                        sourceField: "category",
                        targetField: "subCategory",
                        when: (category) => category === "Outerwear",
                        options: ["Coats", "Jackets", "Blazers", "Parkas", "Vests"]
                    },
                    {
                        type: DependencyType.SETS_OPTIONS,
                        sourceField: "category",
                        targetField: "subCategory",
                        when: (category) => category === "Accessories",
                        options: ["Handbags", "Clutches", "Wallets", "Scarves", "Hats", "Belts", "Sunglasses", "Watches", "Jewelry", "Hair Accessories", "Perfumes/Fragrances", "Footwear", "Beauty & Personal Care"]
                    }
                ]}
            >
                {

                }
                <AutoFormSubmit>Send now</AutoFormSubmit>
                {
                }
                <p className="text-gray-500 text-sm">
                    By submitting this form, you agree to our{" "}
                    <a href="#" className="text-primary underline">
                        terms and conditions
                    </a>
                    .
                </p>
            </AutoForm>
        </>
    )
}

/* 

{
    "title": "Brown",
    "gender": "Women",
    "category": "Bottom Wear",
    "subCategory": "Jeans",
    "description": "sadasd",
    "price": 3535,
    "inventory": [
        {
            "size": "S",
            "measurements": {
                "Bust": 21,
                "Waist": 24
            },
            "variant": [
                {
                    "name": "Brown",
                    "quantity": 24
                }
            ]
        }
    ],
    "dimension": {
        "length": 24,
        "width": 21,
        "height": 24,
        "weights": 24
    },
    "publish": true
} */