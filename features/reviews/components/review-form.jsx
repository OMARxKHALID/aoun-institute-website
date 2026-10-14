"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { deleteMyReview, saveReview } from "@/features/reviews/actions";
import FormAlert from "@/components/ui/form-alert";
import Button from "@/components/ui/button";
import { useDialog } from "@/components/ui/dialog-provider";
import { inputClass } from "@/lib/ui";

const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

const ReviewForm = ({ courseId, review, canReview }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState(review?.body ?? "");
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!canReview && !review) return <p className="text-sm text-white/50">Finish your first lesson to rate this course.</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const result = await saveReview(courseId, { rating, body });
    setBusy(false);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setSaved(true);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!(await dialog.confirm({ title: "Delete your review?", message: "It is removed from the course page.", confirmLabel: "Delete", danger: true }))) return;
    await deleteMyReview(courseId);
    setRating(0);
    setBody("");
    router.refresh();
  };

  const shown = hover || rating;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div role="radiogroup" aria-label="Your rating" className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="p-0.5"
            >
              <Star className={`size-7 transition ${shown >= n ? "fill-amber-400 text-amber-400" : "text-white/25"}`} />
            </button>
          ))}
        </div>
        <span className="text-sm text-white/55">{labels[shown]}</span>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={1500}
        placeholder="What did you like? What could be better? (optional)"
        aria-label="Your review"
        className={inputClass}
      />
      <FormAlert>{error}</FormAlert>
      {saved && <FormAlert type="success">Thanks! Your review is live.</FormAlert>}
      {review?.status === "hidden" && <p className="text-xs text-amber-300/80">Your review is hidden by the institute.</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={busy} disabled={!rating}>
          {review ? "Update review" : "Post review"}
        </Button>
        {review && (
          <Button type="button" variant="ghost" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
