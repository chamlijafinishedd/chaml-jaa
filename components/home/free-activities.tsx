"use client";

import Image from "next/image";
import { useLanguage } from "@/components/site/language-provider";
import type { ProductRecord } from "@/lib/products/types";

const ACTIVITY_IMAGES: Record<string, { image?: string; alt: string }> = {
  "Animal Viewing": {
    image: "/chamlija/17.jpg",
    alt: "Animals in a natural outdoor environment at Chamlija",
  },
  Cycling: {
    image: "/chamlija/bisiklet.jpeg",
    alt: "Cyclists enjoying a scenic outdoor area at Chamlija",
  },
  "Bike Riding (Own Bike)": {
    image: "/chamlija/bisiklet.jpeg",
    alt: "Cyclists enjoying a scenic outdoor area at Chamlija",
  },
  "Yellow Tree Playground": {
    image: "/chamlija/15.jpg",
    alt: "Children playing in a bright outdoor playground at Chamlija",
  },
  "Water Play Area": {
    image: "/chamlija/oyun-alani.jpeg",
    alt: "Water play area with outdoor family fun at Chamlija",
  },
  "Basketball Court": {
    image: "/chamlija/basketbol.jpeg",
    alt: "Basketball court area in a family-friendly outdoor setting",
  },
  "Nature & Open Spaces": {
    image: "/chamlija/19.jpg",
    alt: "Open natural green space and outdoor scenery at Chamlija",
  },
  "Nature / Outdoor Areas": {
    image: "/chamlija/19.jpg",
    alt: "Open natural green space and outdoor scenery at Chamlija",
  },
  "Hayvan Seyretme": {
    image: "/chamlija/17.jpg",
    alt: "Animals in a natural outdoor environment at Chamlija",
  },
  "Bisiklet Sürüşü": {
    image: "/chamlija/bisiklet.jpeg",
    alt: "Cyclists enjoying a scenic outdoor area at Chamlija",
  },
  "Sarı Ağaç Oyun Alanı": {
    image: "/chamlija/15.jpg",
    alt: "Children playing in a bright outdoor playground at Chamlija",
  },
  "Su Oyun Alanı": {
    image: "/chamlija/oyun-alani.jpeg",
    alt: "Water play area with outdoor family fun at Chamlija",
  },
  "Basketbol Sahası": {
    image: "/chamlija/basketbol.jpeg",
    alt: "Basketball court area in a family-friendly outdoor setting",
  },
  "Doğa & Açık Alanlar": {
    image: "/chamlija/19.jpg",
    alt: "Open natural green space and outdoor scenery at Chamlija",
  },
  "Dier Sieninge": { image: "/chamlija/17.jpg", alt: "Animals in a natural outdoor environment at Chamlija" },
  Fietsry: { image: "/chamlija/bisiklet.jpeg", alt: "Cyclists enjoying a scenic outdoor area at Chamlija" },
  "Geel-boom Speeltuin": { image: "/chamlija/15.jpg", alt: "Children playing in a bright outdoor playground at Chamlija" },
  "Water-speel Area": { image: "/chamlija/oyun-alani.jpeg", alt: "Water play area with outdoor family fun at Chamlija" },
  "Basketbal Hof": { image: "/chamlija/basketbol.jpeg", alt: "Basketball court area in a family-friendly outdoor setting" },
  "Natuur & Oop Ruimtes": { image: "/chamlija/19.jpg", alt: "Open natural green space and outdoor scenery at Chamlija" },
};

export function FreeActivities({ products }: { products: ProductRecord[] }) {
  const { t } = useLanguage();
  const defaultFreeActivities = [
    { title: "Animal Viewing", description: "Get close to nature and enjoy seeing our animals." },
    { title: "Cycling", description: "Bring your own bicycle and explore the surroundings." },
    { title: "Yellow Tree Playground", description: "A fun outdoor space for children to play and explore." },
    { title: "Water Play Area", description: "Cool off and enjoy some outdoor water fun." },
    { title: "Basketball Court", description: "Enjoy a friendly game with family and friends." },
    { title: "Nature & Open Spaces", description: "Relax, explore and enjoy the fresh outdoor surroundings." },
  ];
  const freeActivities = (t("freeActivities", defaultFreeActivities as any) as unknown) as Array<{ title: string; description: string }>;

  const productsActivities = products
    .filter((product) => product.category === "free_activity" && product.is_active)
    .sort((a, b) => (a.item_order ?? 0) - (b.item_order ?? 0) || a.name.localeCompare(b.name));

  if (productsActivities.length === 0) {
    return (
      <section className="bg-[#f6f1e8] py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#7a8462] sm:text-xs">
              {t("activities.eyebrow", "INCLUDED WITH YOUR VISIT")}
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#14251d] sm:text-4xl">
              {t("activities.heading", "More to Discover at Chamlija")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#49574f] sm:text-base">
              {t("activities.body", "Enjoy a range of outdoor experiences and family-friendly activities included with your visit.")}
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {freeActivities.map((activity) => {
              const activityImage = ACTIVITY_IMAGES[activity.title as keyof typeof ACTIVITY_IMAGES];
              const image = activityImage?.image;
              const alt = activityImage?.alt || activity.title;

              return (
                <article
                  key={activity.title}
                  className="group relative min-h-[19rem] overflow-hidden rounded-[1.6rem] bg-[#e8e3d9] shadow-[0_18px_40px_rgba(20,37,29,0.08)]"
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#f0eee8]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102118]/80 via-[#102118]/20 to-transparent" />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                    <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                      {t("common.included", "Included")}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{activity.title}</h3>
                        <p className="mt-2 max-w-[18rem] text-sm leading-6 text-white/75">{activity.description}</p>
                      </div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-lg text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f6f1e8] py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#7a8462] sm:text-xs">
            {t("activities.eyebrow", "INCLUDED WITH YOUR VISIT")}
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#14251d] sm:text-4xl">
            {t("activities.heading", "More to Discover at Chamlija")}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#49574f] sm:text-base">
            {t("activities.body", "Enjoy a range of outdoor experiences and family-friendly activities included with your visit.")}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {freeActivities.map((activity) => {
            const activityImage = ACTIVITY_IMAGES[activity.title as keyof typeof ACTIVITY_IMAGES];
            const image = activityImage?.image;
            const alt = activityImage?.alt || activity.title;

            return (
              <article
                key={activity.title}
                className="group relative min-h-[19rem] overflow-hidden rounded-[1.6rem] bg-[#e8e3d9] shadow-[0_18px_40px_rgba(20,37,29,0.08)]"
              >
                {image ? (
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#f0eee8]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#102118]/80 via-[#102118]/20 to-transparent" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                  <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                    {t("common.included", "Included")}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{activity.title}</h3>
                      <p className="mt-2 max-w-[18rem] text-sm leading-6 text-white/75">{activity.description}</p>
                    </div>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-lg text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
