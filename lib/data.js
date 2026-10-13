export const brand = {
  name: "Aoun Institute",
  short: "Aoun",
  email: "hello@aouninstitute.com",
  phone: "+92 300 0000000",
  hours: "Online: 10am - 10pm",
  address: "Main Boulevard, Lahore, Pakistan",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
];

export const avatarTones = ["bg-orange-300", "bg-amber-200", "bg-rose-300", "bg-stone-400"];

export const partners = ["Northwind", "Globex", "Initech", "Umbrella", "Hooli", "Stark Labs", "Wayne Tech", "Acme Corp"];

export const impactCards = [
  { title: "Campus Visits", text: "We bring live workshops straight to colleges across the region.", tag: "Featured", tone: "from-orange-700 via-stone-800 to-stone-950" },
  { title: "Seminar Series", text: "Hands-on sessions on careers, projects, and interview prep.", tag: "Seminar", tone: "from-amber-600 via-stone-800 to-stone-950" },
  { title: "Meet & Greet", text: "Learners meet mentors and alumni in person every quarter.", tag: "Meet-ups", tone: "from-rose-700 via-stone-800 to-stone-950" },
  { title: "Batch Outing", text: "Code, chill, and celebrate milestones together as a cohort.", tag: "Code & Chill", tone: "from-orange-500 via-stone-800 to-stone-950" },
];

const meta = (duration) => [
  { icon: "calendar", label: "Duration", value: duration },
  { icon: "award", label: "Certified", value: "Yes" },
  { icon: "headset", label: "Mentor Support", value: "24/7" },
];

export const courses = [
  {
    slug: "full-stack-ai",
    title: "Full Stack Engineering With Applied AI",
    blurb: "Build scalable products end to end: frontend, APIs, databases, and AI features, reviewed every week by mentors.",
    category: "Development",
    level: "Beginner to Advanced",
    duration: "7 Months",
    mode: "Live",
    price: { now: "Rs. 9999", was: "Rs. 19999" },
    meta: meta("7 Months"),
    light: true,
    featured: true,
    modules: [
      { title: "Web Foundations", topics: ["HTML & semantic markup", "Modern CSS & Tailwind", "JavaScript fundamentals"] },
      { title: "Frontend Engineering", topics: ["React & Next.js", "State management", "Testing UI"] },
      { title: "Backend & Databases", topics: ["Node.js APIs", "PostgreSQL & MongoDB", "Auth & security"] },
      { title: "Applied AI", topics: ["LLM APIs", "Retrieval & embeddings", "Shipping AI features"] },
      { title: "Career Sprint", topics: ["Capstone project", "Mock interviews", "Resume & portfolio"] },
    ],
    outcomes: ["Ship 6 production-grade projects", "Deploy a full stack capstone", "Clear technical interviews with confidence"],
  },
  {
    slug: "data-science",
    title: "Data Science & Analytics Track",
    blurb: "Python, SQL, statistics, and dashboards, finished with a capstone built on a real dataset.",
    category: "Data",
    level: "Beginner",
    duration: "5 Months",
    mode: "Live",
    price: { now: "Rs. 8999", was: "Rs. 17999" },
    meta: meta("5 Months"),
    featured: true,
    modules: [
      { title: "Python for Data", topics: ["Python basics", "NumPy & pandas", "Data cleaning"] },
      { title: "Statistics", topics: ["Probability", "Hypothesis testing", "Regression"] },
      { title: "SQL & Warehousing", topics: ["Joins & windows", "Query tuning", "Modeling data"] },
      { title: "Visualization", topics: ["Dashboards", "Storytelling with data", "Reporting"] },
    ],
    outcomes: ["Analyze real datasets end to end", "Build a portfolio of dashboards", "Interview for analyst roles"],
  },
  {
    slug: "dsa-interview",
    title: "DSA & Interview Mastery",
    blurb: "Crack coding rounds with structured problem solving, mock interviews, and weekly contests.",
    category: "Interview Prep",
    level: "Intermediate",
    duration: "4 Months",
    mode: "Live",
    price: { now: "Rs. 6999", was: "Rs. 12999" },
    meta: meta("4 Months"),
    light: true,
    featured: true,
    modules: [
      { title: "Core Structures", topics: ["Arrays & strings", "Linked lists", "Stacks & queues"] },
      { title: "Algorithms", topics: ["Recursion", "Sorting & searching", "Greedy"] },
      { title: "Advanced Topics", topics: ["Trees & graphs", "Dynamic programming", "Tries & heaps"] },
      { title: "Interview Lab", topics: ["Mock rounds", "System design basics", "Behavioral prep"] },
    ],
    outcomes: ["Solve 300+ curated problems", "Weekly timed contests", "Mock interviews with feedback"],
  },
  {
    slug: "frontend-react",
    title: "Frontend Development With React",
    blurb: "Go from static pages to polished, accessible React apps with animation and performance baked in.",
    category: "Development",
    level: "Beginner",
    duration: "3 Months",
    mode: "Recorded + Live Q&A",
    price: { now: "Rs. 4999", was: "Rs. 8999" },
    meta: meta("3 Months"),
    modules: [
      { title: "UI Foundations", topics: ["Layout & responsive design", "Accessibility", "Design systems"] },
      { title: "React Core", topics: ["Components & hooks", "Data fetching", "Routing"] },
      { title: "Polish", topics: ["Animation", "Performance", "Deployment"] },
    ],
    outcomes: ["Build 4 portfolio projects", "Master modern React patterns", "Ship to production"],
  },
  {
    slug: "backend-node",
    title: "Backend Engineering With Node.js",
    blurb: "Design APIs, model data, and run reliable services with queues, caching, and observability.",
    category: "Development",
    level: "Intermediate",
    duration: "3 Months",
    mode: "Live",
    price: { now: "Rs. 5999", was: "Rs. 9999" },
    meta: meta("3 Months"),
    modules: [
      { title: "APIs", topics: ["REST & validation", "Auth & sessions", "Rate limiting"] },
      { title: "Data", topics: ["SQL modeling", "Caching", "Migrations"] },
      { title: "Operations", topics: ["Queues & jobs", "Logging & metrics", "Deploying services"] },
    ],
    outcomes: ["Build and deploy 3 services", "Understand production tradeoffs", "Prepare for backend interviews"],
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design for Developers",
    blurb: "Learn the design thinking, Figma workflow, and visual craft that make products feel great.",
    category: "Design",
    level: "Beginner",
    duration: "2 Months",
    mode: "Recorded + Live Q&A",
    price: { now: "Rs. 3999", was: "Rs. 6999" },
    meta: meta("2 Months"),
    modules: [
      { title: "Design Basics", topics: ["Typography", "Color & spacing", "Layout grids"] },
      { title: "Figma Workflow", topics: ["Components", "Auto layout", "Prototyping"] },
      { title: "Product Thinking", topics: ["User research", "Usability testing", "Handoff"] },
    ],
    outcomes: ["Design 3 case studies", "Build a design portfolio", "Collaborate better with designers"],
  },
];

export const findCourse = (slug) => courses.find((c) => c.slug === slug);

export const testimonials = [
  { name: "Aarav Mehta", role: "Frontend Engineer", rating: "4.8", quote: "The project reviews changed how I write code. I finally understood the why, not just the how." },
  { name: "Sana Khan", role: "Backend Developer", rating: "4.9", quote: "Weekly mock interviews made the real ones feel easy. Landed my first offer in month six." },
  { name: "Rohan Patil", role: "Full Stack Intern", rating: "4.6", quote: "Mentors replied at midnight before my deadline. That support kept me going through the tough weeks." },
  { name: "Meera Joshi", role: "Data Analyst", rating: "4.7", quote: "The capstone became the centerpiece of my portfolio and the main topic in every interview." },
  { name: "Kabir Sethi", role: "SDE I", rating: "5.0", quote: "Structured, practical, zero fluff. The DSA sessions alone were worth it." },
  { name: "Isha Rao", role: "React Developer", rating: "4.5", quote: "Peer groups kept me accountable. I shipped more in three months than the whole year before." },
];

export const videos = [
  { title: "Getting Your First Tech Job: A Practical Plan", views: "52K", ago: "2 weeks ago" },
  { title: "Web Development Roadmap, Start to Finish", views: "118K", ago: "1 month ago" },
  { title: "JavaScript in 30 Days: Full Course", views: "240K", ago: "3 months ago" },
  { title: "React for Beginners, Step by Step", views: "96K", ago: "2 months ago" },
  { title: "Build a Portfolio Site From Scratch", views: "71K", ago: "3 weeks ago" },
];

export const communityTiles = [
  { title: "First Batch Graduates", text: "Proud moment for our first cohort.", area: "col-start-1 col-span-5 row-start-1 row-span-8", tone: "from-orange-400 to-stone-700" },
  { title: "Learner Spotlight", text: "From zero to full stack in seven months.", area: "col-start-6 col-span-8 row-start-1 row-span-4", tone: "from-stone-400 to-stone-700" },
  { title: "Placement Wall", text: "Celebrating this month's offers.", area: "col-start-14 col-span-5 row-start-1 row-span-4", tone: "from-amber-300 to-orange-700" },
  { title: "Hackathon Night", text: "36 hours, 40 teams, one trophy.", area: "col-start-6 col-span-4 row-start-5 row-span-8", tone: "from-rose-300 to-stone-700" },
  { title: "Campus Tour", text: "Workshops in 12 cities this year.", area: "col-start-10 col-span-9 row-start-5 row-span-4", tone: "from-orange-300 to-stone-600" },
  { title: "Demo Day", text: "Learners pitch what they built.", area: "col-start-1 col-span-5 row-start-9 row-span-4", tone: "from-stone-300 to-orange-800" },
  { title: "Mentor Hours", text: "Office hours every single week.", area: "col-start-10 col-span-4 row-start-9 row-span-4", tone: "from-amber-200 to-stone-700" },
  { title: "Alumni Meetup", text: "Where the network keeps growing.", area: "col-start-14 col-span-5 row-start-9 row-span-4", tone: "from-orange-500 to-stone-800" },
];

export const comparison = {
  ours: [
    "Affordable fees with no compromise on quality",
    "Live classes with mentors who answer fast",
    "Real projects reviewed line by line",
    "Mock interviews and placement support",
    "Lifetime access to recordings",
  ],
  others: [
    "High fees with compromised quality",
    "Pre-recorded videos and slow doubt support",
    "Toy projects with no feedback",
    "No interview preparation",
    "Access expires after the course",
  ],
};

export const faqs = [
  { q: "Are the courses suitable for beginners?", a: "Yes. Every track starts from fundamentals and ramps up with guided projects, so no prior experience is needed." },
  { q: "Is placement assistance included?", a: "Every cohort includes resume reviews, mock interviews, and referrals to hiring partners." },
  { q: "Which technologies are covered?", a: "JavaScript, React, Node.js, databases, DSA, and applied AI, depending on the track you choose." },
  { q: "Are classes live or recorded?", a: "Classes are live, and every session is recorded so you can revisit it anytime." },
  { q: "Do I build real projects?", a: "Yes. Each module ends with a project, and the program finishes with a deployed capstone." },
];

export const aboutStats = [
  { value: "80k+", label: "Learners trained" },
  { value: "1,200+", label: "Placements" },
  { value: "120+", label: "Hiring partners" },
  { value: "4.8/5", label: "Average rating" },
];

export const values = [
  { title: "Build first", text: "Every concept is learned by shipping something real, not by memorizing slides." },
  { title: "Honest feedback", text: "Mentors review your code line by line, so you grow faster than you would alone." },
  { title: "Access for all", text: "Fees stay affordable and recordings stay available, because talent is everywhere." },
  { title: "Career outcomes", text: "We measure success by offers landed, not by certificates printed." },
];

export const mentors = [
  { name: "Hamza Aoun", role: "Founder & Lead Mentor", focus: "Full Stack & Architecture" },
  { name: "Ayesha Tariq", role: "Head of Curriculum", focus: "Frontend & Design Systems" },
  { name: "Bilal Ahmed", role: "Senior Mentor", focus: "Backend & DevOps" },
  { name: "Zara Malik", role: "Data Mentor", focus: "Data Science & Analytics" },
];

export const milestones = [
  { year: "2021", text: "Started as a weekend coding club with 30 learners." },
  { year: "2022", text: "Launched the first live full stack cohort." },
  { year: "2024", text: "Crossed 1,000 placements with 100+ hiring partners." },
  { year: "2026", text: "Opened applied AI tracks and campus programs." },
];

export const jobs = [
  { id: "fe-northwind", title: "Frontend Developer", company: "Northwind", location: "Lahore", type: "Full-time", salary: "PKR 150k - 220k", posted: "2 days ago", tags: ["React", "Next.js", "Tailwind"] },
  { id: "be-globex", title: "Backend Engineer", company: "Globex", location: "Remote", type: "Full-time", salary: "PKR 200k - 300k", posted: "4 days ago", tags: ["Node.js", "PostgreSQL"] },
  { id: "intern-initech", title: "Full Stack Intern", company: "Initech", location: "Karachi", type: "Internship", salary: "PKR 50k", posted: "1 week ago", tags: ["JavaScript", "MongoDB"] },
  { id: "da-umbrella", title: "Data Analyst", company: "Umbrella", location: "Islamabad", type: "Full-time", salary: "PKR 140k - 190k", posted: "1 week ago", tags: ["SQL", "Python", "Power BI"] },
  { id: "ui-hooli", title: "UI Engineer", company: "Hooli", location: "Remote", type: "Contract", salary: "PKR 180k", posted: "2 weeks ago", tags: ["React", "Figma", "Animation"] },
  { id: "sde-stark", title: "Software Engineer I", company: "Stark Labs", location: "Lahore", type: "Full-time", salary: "PKR 170k - 240k", posted: "3 weeks ago", tags: ["DSA", "Java", "System Design"] },
];

export const webinars = [
  { title: "Breaking Into Tech in 2026", date: "Oct 25, 2026", time: "7:00 PM PKT", speaker: "Hamza Aoun", status: "upcoming" },
  { title: "Building AI Features With LLM APIs", date: "Nov 2, 2026", time: "8:00 PM PKT", speaker: "Bilal Ahmed", status: "upcoming" },
  { title: "Portfolio Reviews: What Recruiters Notice", date: "Nov 9, 2026", time: "7:30 PM PKT", speaker: "Ayesha Tariq", status: "upcoming" },
  { title: "SQL for Analysts: Live Workshop", date: "Sep 28, 2026", time: "7:00 PM PKT", speaker: "Zara Malik", status: "past" },
  { title: "Cracking DSA Rounds", date: "Sep 14, 2026", time: "8:00 PM PKT", speaker: "Hamza Aoun", status: "past" },
];

export const hireBenefits = [
  { title: "Pre-vetted talent", text: "Every candidate has shipped projects reviewed by our mentors." },
  { title: "Zero hiring fee", text: "We connect you with learners at no cost to your company." },
  { title: "Fast shortlists", text: "Get matched profiles within 72 hours of sharing a role." },
];

export const certificates = [
  { id: "AOUN-2026-0001", name: "Aarav Mehta", course: "Full Stack Engineering With Applied AI", issued: "Aug 12, 2026" },
  { id: "AOUN-2026-0002", name: "Sana Khan", course: "DSA & Interview Mastery", issued: "Jul 3, 2026" },
];

export const enrolledCourses = [
  { slug: "full-stack-ai", progress: 62, next: "Backend & Databases: Auth & security" },
  { slug: "dsa-interview", progress: 28, next: "Algorithms: Greedy" },
];

export const footerColumns = [
  { title: "About", links: [{ label: "About Us", href: "/about" }, { label: "Jobs", href: "/jobs" }, { label: "Hire From Us", href: "/hire" }, { label: "Webinars", href: "/webinars" }] },
  { title: "Company", links: [{ label: "Resume Checker", href: "/resume-checker" }, { label: "Submit Projects", href: "/submit-projects" }, { label: "Verify Certificate", href: "/certificates/verify" }, { label: "My Dashboard", href: "/profile" }, { label: "Support", href: "/support" }] },
  { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy-policy" }, { label: "Terms & Conditions", href: "/terms-and-conditions" }, { label: "Pricing & Refund", href: "/pricing-and-refund" }] },
  { title: "Contact", links: [{ label: brand.hours, href: "/support" }, { label: brand.phone, href: `tel:${brand.phone.replace(/\s/g, "")}` }, { label: brand.email, href: `mailto:${brand.email}` }] },
];
