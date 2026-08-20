"use client";

import Link from "next/link";
import { useLanguage } from "@/components/site/language-provider";
import { CHAMLIJA_LOCATION, CHAMLIJA_MAPS_URL } from "@/lib/location";

const CONTACT = {
  phone: "+27 65 585 9178",
  email: "buyukchamlija@uict.org.za",
  address: CHAMLIJA_LOCATION.address,
  instagram: "buyukchamlija",
};

export function SiteFooter() {
  const { t } = useLanguage();

  const QUICK_LINKS = [
    { label: t("nav.home", "Home"), href: "#home" },
    { label: t("nav.about", "About"), href: "#about" },
    { label: t("nav.experiences", "Experiences"), href: "#experiences" },
    { label: t("nav.gallery", "Gallery"), href: "#gallery" },
  ];

  const WORKING_HOURS = [
    { day: t("footerLinks.monday", "Monday"), hours: t("footerLinks.closed", "Closed") },
    { day: t("footerLinks.tuesdayFriday", "Tuesday – Friday"), hours: t("footerLinks.openTimes", "10:00 – 18:00") },
    { day: t("footerLinks.saturdaySunday", "Saturday – Sunday"), hours: t("footerLinks.openTimesSaturday", "09:00 – 18:00") },
  ];
  return (
    <footer id="contact" className="scroll-mt-24 border-t border-olive/20 bg-forest-dark text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-8 md:grid-cols-2 md:gap-12 lg:grid-cols-4 lg:px-10 lg:py-20">
        <div>
          <p className="text-lg font-bold uppercase tracking-[0.3em] text-white">Chamlija</p>
          <p className="text-sm leading-7 text-white/55">
            {t("footer.description", "A premium nature experience for picnics, family days, celebrations, and outdoor events.")}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{t("common.quickLinks", "Quick Links")}</p>
          <ul className="mt-5 space-y-3 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition hover:text-terracotta">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{t("common.reservation", "Reservation")}</p>
          <p className="mt-4 text-sm font-semibold text-white">{t("common.reserveYourVisit", "Reserve Your Visit")}</p>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-white/70">{t("common.workingHours", "Working Hours")}</p>
          <div className="mt-3 space-y-2 text-sm text-white/55">
            {WORKING_HOURS.map((item) => (
              <div 
                key={item.day} 
                className="grid items-center"
                style={{ gridTemplateColumns: "minmax(140px, auto) auto", columnGap: "24px" }}
              >
                <span className="whitespace-nowrap font-medium">{item.day}</span>
                <span className="whitespace-nowrap">{item.hours}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/book" className="inline-block transition hover:text-terracotta text-terracotta font-semibold">
              → {t("footerLinks.reserveNow", "Reserve Now")}
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{t("footer.contactTitle", "Contact")}</p>
          <ul className="mt-5 space-y-3 text-sm text-white/55">
            <li className="leading-relaxed">
              <a
                href={CHAMLIJA_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-terracotta text-white/70 underline-offset-4 hover:underline"
              >
                {CONTACT.address}
              </a>
            </li>
            <li>
              <a 
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} 
                className="transition hover:text-terracotta text-white/70 font-medium"
              >
                📞 {CONTACT.phone}
              </a>
            </li>
            <li>
              <a 
                href={`https://instagram.com/${CONTACT.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-terracotta text-white/70 font-medium"
              >
                📱 Instagram: @{CONTACT.instagram}
              </a>
            </li>
            <li>
              <a 
                href={`mailto:${CONTACT.email}`} 
                className="transition hover:text-terracotta text-white/70 font-medium"
              >
                ✉️ {CONTACT.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-white/40 sm:px-8 lg:px-10">
          © {new Date().getFullYear()} Buyuk Chamlija. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
