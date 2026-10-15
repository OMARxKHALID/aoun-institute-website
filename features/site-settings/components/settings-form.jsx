"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSiteSettings } from "@/features/site-settings/actions";
import { siteSettingsSchema } from "@/features/site-settings/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import ImageUpload from "@/components/ui/image-upload";
import ArrayField from "@/components/ui/array-field";
import TabList from "@/components/ui/tab-list";

const tabs = ["Brand & Contact", "Homepage", "SEO", "Payments"];

const homeSections = ["Hero", "Stats", "Partners", "Impact", "Testimonials", "Community", "FAQs"];

const SettingsForm = ({ settings }) => {
  const [tab, setTab] = useState(tabs[0]);
  const [homeSection, setHomeSection] = useState(homeSections[0]);
  const [saved, setSaved] = useState(false);
  const { register, control, handleSubmit, setError, formState } = useForm({ resolver: zodResolver(siteSettingsSchema), defaultValues: settings });
  const { errors, isSubmitting } = formState;
  const shared = { control, register, errors };

  const handleSave = async (values) => {
    setSaved(false);
    const result = await updateSiteSettings(values);
    if (result.ok) return setSaved(true);
    setError("root", { message: Object.values(result.errors).flat()[0] ?? "Could not save settings" });
  };

  const handleInvalid = () => setError("root", { message: "Some fields need fixing. Check each tab." });

  const imageField = (name, label, aspect) => (
    <Controller control={control} name={name} render={({ field }) => <ImageUpload kind="brand" label={label} value={field.value} onChange={field.onChange} aspect={aspect} />} />
  );

  return (
    <form onSubmit={handleSubmit(handleSave, handleInvalid)} noValidate className="flex flex-col gap-6">
      <TabList tabs={tabs} value={tab} onChange={setTab} label="Site settings" />

      <FormAlert>{errors.root?.message}</FormAlert>
      {saved && <FormAlert type="success">Settings saved. The site is updated.</FormAlert>}

      <div hidden={tab !== "Brand & Contact"} className="grid gap-5 md:grid-cols-2">
        <Field label="Brand name" error={errors.brand?.name?.message} {...register("brand.name")} />
        <Field label="Short name" error={errors.brand?.shortName?.message} {...register("brand.shortName")} />
        <Field label="Tagline" className="md:col-span-2" error={errors.brand?.tagline?.message} {...register("brand.tagline")} />
        {imageField("brand.logo", "Logo")}
        <div />
        <Field label="Contact email" type="email" error={errors.contact?.email?.message} {...register("contact.email")} />
        <Field label="Phone" error={errors.contact?.phone?.message} {...register("contact.phone")} />
        <Field label="Address" error={errors.contact?.address?.message} {...register("contact.address")} />
        <Field label="Hours" error={errors.contact?.hours?.message} {...register("contact.hours")} />
        <Field label="Footer text" rows={2} className="md:col-span-2" error={errors.footer?.text?.message} {...register("footer.text")} />
        <div className="md:col-span-2">
          <ArrayField {...shared} name="socials" label="Social links" max={10} empty={{ label: "", url: "" }} columns={[{ name: "label", label: "Label" }, { name: "url", label: "URL" }]} />
        </div>
      </div>

      <div hidden={tab !== "Homepage"} className="flex flex-col gap-5">
        <TabList tabs={homeSections} value={homeSection} onChange={setHomeSection} label="Homepage sections" size="sm" />
        <div hidden={homeSection !== "Hero"} className="grid gap-5 md:grid-cols-2">
          <Field label="Eyebrow" error={errors.hero?.eyebrow?.message} {...register("hero.eyebrow")} />
          <Field label="Highlighted word" error={errors.hero?.highlight?.message} {...register("hero.highlight")} />
          <Field label="Headline start" error={errors.hero?.title?.message} {...register("hero.title")} />
          <Field label="Headline end" error={errors.hero?.titleEnd?.message} {...register("hero.titleEnd")} />
          <Field label="Subtitle" rows={2} className="md:col-span-2" error={errors.hero?.subtitle?.message} {...register("hero.subtitle")} />
        </div>
        <div hidden={homeSection !== "Stats"}>
          <ArrayField {...shared} name="home.stats" label="Hero stats (shown until students enroll, then live numbers replace them)" max={2} empty={{ value: "", label: "", text: "" }} columns={[{ name: "value", label: "Value" }, { name: "label", label: "Label" }, { name: "text", label: "Description", wide: true }]} />
        </div>
        <div hidden={homeSection !== "Partners"}>
          <ArrayField {...shared} name="home.partners" label="Partner logos" max={16} empty={{ name: "", logo: null }} columns={[{ name: "name", label: "Name" }, { name: "logo", label: "Logo", image: true }]} />
        </div>
        <div hidden={homeSection !== "Impact"}>
          <ArrayField {...shared} name="home.impactCards" label="Impact cards" max={8} empty={{ title: "", text: "", tag: "", image: null }} columns={[{ name: "title", label: "Title" }, { name: "tag", label: "Tag" }, { name: "text", label: "Text", wide: true }, { name: "image", label: "Image", image: true, aspect: 7 / 9 }]} />
        </div>
        <div hidden={homeSection !== "Testimonials"}>
          <ArrayField {...shared} name="home.testimonials" label="Testimonials" max={20} empty={{ name: "", role: "", rating: "5.0", quote: "", photo: null }} columns={[{ name: "name", label: "Name" }, { name: "role", label: "Role" }, { name: "rating", label: "Rating (1-5)" }, { name: "photo", label: "Photo", image: true, aspect: 1 }, { name: "quote", label: "Quote", rows: 3, wide: true }]} />
        </div>
        <div hidden={homeSection !== "Community"}>
          <ArrayField {...shared} name="home.communityTiles" label="Community tiles (8)" max={8} empty={{ title: "", text: "", image: null }} columns={[{ name: "title", label: "Title" }, { name: "text", label: "Text" }, { name: "image", label: "Image", image: true }]} />
        </div>
        <div hidden={homeSection !== "FAQs"}>
          <ArrayField {...shared} name="home.faqs" label="FAQs" max={30} empty={{ q: "", a: "" }} columns={[{ name: "q", label: "Question", wide: true }, { name: "a", label: "Answer", rows: 3, wide: true }]} />
        </div>
      </div>

      <div hidden={tab !== "SEO"} className="grid gap-5 md:grid-cols-2">
        <Field label="Default page title" error={errors.seo?.title?.message} {...register("seo.title")} />
        <Field label="Meta description" error={errors.seo?.description?.message} {...register("seo.description")} />
        {imageField("seo.ogImage", "Social share image", 1200 / 630)}
      </div>

      <div hidden={tab !== "Payments"} className="flex flex-col gap-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Bank name" error={errors.payment?.bank?.bankName?.message} {...register("payment.bank.bankName")} />
          <Field label="Account title" error={errors.payment?.bank?.accountTitle?.message} {...register("payment.bank.accountTitle")} />
          <Field label="Account number" error={errors.payment?.bank?.accountNumber?.message} {...register("payment.bank.accountNumber")} />
          <Field label="IBAN" error={errors.payment?.bank?.iban?.message} {...register("payment.bank.iban")} />
          <Field label="Payment instructions" rows={3} className="md:col-span-2" error={errors.payment?.instructions?.message} {...register("payment.instructions")} />
        </div>
        <ArrayField {...shared} name="payment.wallets" label="Mobile wallets (JazzCash, Easypaisa)" max={5} empty={{ name: "", accountTitle: "", number: "" }} columns={[{ name: "name", label: "Wallet" }, { name: "accountTitle", label: "Account title" }, { name: "number", label: "Number" }]} />
      </div>

      <Button type="submit" loading={isSubmitting} className="self-start">
        Save Settings
      </Button>
    </form>
  );
};

export default SettingsForm;
