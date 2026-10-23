# Deleting a student keeps certificates and orders

Deleting a student removes their account and study data (enrollments, progress, quiz attempts, notes, study plans, reviews), but their certificates and orders stay, and their questions remain under the name "Former student". A certificate is a public record of a past achievement that an employer may still verify after the account is gone, and orders belong to the institute's books; the name on a certificate is removed only if the student asks and the owner revokes it with a logged reason.

A student's own deletion request waits 30 days (they can cancel until then); a daily cron (`/api/cron/deletions`) then erases the account through the same `features/students/service.js` path the owner's manual delete uses.
