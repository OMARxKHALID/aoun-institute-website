# Aoun Institute

An institute that sells recorded video courses to students, tracks their learning, and certifies those who finish.

## Language

### People

**Student**:
A person who studies courses at the institute. There can be any number of students.
_Avoid_: Learner, user, customer

**Teacher**:
A person who creates and teaches courses. A teacher is an account the owner has promoted, and the same person can still study other courses as a student. There can be any number of teachers, and a course has one or more teachers with equal rights over it. A teacher sees only the students enrolled in their own courses.
_Avoid_: Instructor, tutor, admin

**Owner**:
The one person who runs the institute. The owner is also a teacher and can act on every course, whether or not they teach it. Only the owner handles money (payments, refunds, prices, payment details, revenue), accounts (making or removing teachers, gifts, revoking, banning, deleting, passwords) and the institute itself (site settings, contact messages, the activity log). There is exactly one owner.
_Avoid_: Admin, super admin

**Former student**:
How a deleted student appears on the questions they asked. Deleting a student removes their account and study history, but their certificates and orders stay as institute records.
_Avoid_: Deleted user, anonymous

### Access

**Enrollment**:
A student's right to study one course. It comes from a paid order, a free course or a gift, has no expiry date, and ends only when the order that paid for it is refunded or the owner revokes it.
_Avoid_: Subscription, purchase, membership, lifetime access

**Gift**:
An enrollment the owner grants without payment.
_Avoid_: Manual enrollment, comp, free access

**Stream**:
The one device on a student's account currently playing a lesson. Starting playback on another device takes the stream over and pauses the first.
_Avoid_: Session, playback, screen

### Catalog

**Published course**:
A course listed in the catalog and on sale. Only the owner publishes or unpublishes a course.
_Avoid_: Live course, active course

**Unpublished course**:
A course hidden from the catalog and not on sale. Students already enrolled keep studying it.
_Avoid_: Draft, archived, retired

**Price**:
What a course normally costs. Only the owner sets it.

**Sale price**:
A lower price the owner sets for a course; while it exists, it is what students pay.
_Avoid_: Discount price, offer

**Free course**:
A published course whose price is zero. A student enrolls in it directly, without an order.

**Published lesson**:
A lesson its course's enrolled students can see. The course's teachers decide when a lesson is published.
_Avoid_: Released lesson, visible lesson

**Free preview**:
A lesson anyone can watch before buying the course. The course's teachers choose free previews; every change is logged and the owner can undo it.
_Avoid_: Sample, trailer, demo lesson

### Payment

**Order**:
A student's request to pay for one course. A paid order grants an enrollment.
_Avoid_: Purchase, transaction, invoice

**Pending**:
An order waiting for the owner to confirm the payment. A student has at most one pending order per course.

**Paid**:
An order whose payment is confirmed, either by the owner or instantly by a card.

**Rejected**:
An order the owner could not confirm. The student may resubmit it with corrected details, which makes it pending again.
_Avoid_: Failed, declined

**Cancelled**:
An order closed without review because another payment for the same course replaced it. It is never reopened.
_Avoid_: Failed, superseded

**Refunded**:
A paid order whose money was returned. Refunding ends the enrollment it granted.

### Learning

**Completed lesson**:
A lesson whose tracked video the student has watched at least 90% of, or, when the video is not tracked, one the student has marked complete. Untracked completion is taken on trust; required quizzes are the real check of learning.
_Avoid_: Viewed lesson, finished lesson

**Tracked video**:
A lesson video whose real watch time the institute can measure. An embedded video from another platform is not tracked.

**Sequential unlock**:
A course setting, chosen by its teachers, under which each lesson and quiz opens only after the work before it is done.
_Avoid_: Drip, linear mode

**Locked**:
A lesson or quiz a student cannot open yet because earlier work in the course is not done. A quiz attached to a lesson stays locked until that lesson is completed.
_Avoid_: Disabled, hidden

**Required quiz**:
A quiz a student must pass for course completion.

**Attempt**:
One go at a quiz. A quiz may cap how many attempts a student gets; the course's teachers may grant one student extra attempts, and every grant is logged.
_Avoid_: Try, submission, retake

**Progress**:
The share of a course's lessons a student has completed. Quizzes do not count, so full progress does not mean the course is complete.
_Avoid_: Completion, score

**Course completion**:
Meeting a course's certificate rule: enough completed lessons plus every required quiz passed. Course completion is what earns a certificate.
_Avoid_: 100%, finished, done

**Note**:
Something a student writes on a lesson for themselves. Notes are private: teachers and the owner never see them.

**Study plan**:
A study session a student schedules for themselves, with an email reminder before it starts.
_Avoid_: Calendar event, schedule

### Conversation

**Question**:
Something a student asks about a lesson, answered by the course's teachers. The course's teachers may remove questions.
_Avoid_: Discussion, comment, thread, post

**Announcement**:
A message the course's teachers send to every student enrolled in that course.
_Avoid_: Notice, broadcast, notification

**Review**:
A student's public rating and comment on a course, shown to people deciding whether to buy it. Teachers may reply; only the owner may hide or delete a review.
_Avoid_: Testimonial, feedback, rating

### Achievement

**Certificate**:
A public, verifiable record that a student completed a course. It records a past achievement, not current access, so it stays valid after its enrollment ends. Only the owner issues a certificate by hand, or revokes one with a reason or reissues it.
_Avoid_: Diploma, badge, award

**Badge**:
A private marker of a student's study habits, worked out from their current activity. Unlike a certificate, a badge is never public, never verifiable, and disappears if the activity behind it goes away.
_Avoid_: Achievement, award, trophy
