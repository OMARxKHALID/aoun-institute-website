export const STREAMS = {
  intro: { src: "https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8", durationSec: 60 },
  a: { src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", durationSec: 635 },
  b: { src: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8", durationSec: 600 },
  c: { src: "https://test-streams.mux.dev/tos_ismc/main.m3u8", durationSec: 734 },
};

const q = (prompt, options, correct, explanation, type = "single") => ({
  type,
  prompt,
  explanation,
  points: type === "multiple" ? 2 : 1,
  options: options.map((text, i) => ({ text, isCorrect: [correct].flat().includes(i) })),
});

const sa = (prompt, acceptedAnswers, explanation) => ({ type: "short_answer", prompt, explanation, points: 2, options: [], acceptedAnswers });

const tf = (prompt, answer, explanation) => q(prompt, ["True", "False"], answer ? 0 : 1, explanation, "true_false");

export const COURSES = [
  {
    slug: "full-stack-web-development-nextjs",
    title: "Full-Stack Web Development with Next.js",
    subtitle: "Build and ship production web apps with React, Next.js, MongoDB and Tailwind",
    description:
      "A complete, project-based path from React fundamentals to deploying a full-stack Next.js application.\n\nYou will build a real product step by step: authentication, a database, file uploads, payments and an admin panel, then deploy it to the cloud.",
    category: "Development",
    level: "Intermediate",
    price: 24999,
    discountPrice: 17999,
    thumbnail: "nextjs-fullstack",
    outcomes: ["Build full-stack apps with the Next.js App Router", "Design MongoDB schemas and secure APIs", "Add authentication, uploads and payments", "Deploy to Vercel with confidence"],
    prerequisites: ["Basic HTML, CSS and JavaScript", "A laptop with 8 GB RAM"],
    sections: [
      { title: "React Foundations", lessons: ["Welcome to the course", "Components and props", "State and events"] },
      { title: "Next.js App Router", lessons: ["Routing and layouts", "Server and client components", "Data fetching and caching"] },
      { title: "Backend and Deployment", lessons: ["MongoDB with Mongoose", "Authentication", "Deploying to Vercel"] },
    ],
    lessonQuiz: [
      q("What does a React component return?", ["HTML strings", "JSX describing the UI", "A CSS file"], 1, "Components return JSX, which React turns into UI."),
      tf("Props can be changed by the child component.", false, "Props are read-only. Use state for values that change."),
      q("Which hook stores local state?", ["useEffect", "useState", "useRef"], 1, "useState returns a value and a setter."),
    ],
    sectionQuiz: [
      q("Which file defines a route's UI in the App Router?", ["route.js", "page.js", "index.html"], 1, "page.js makes a route segment publicly accessible."),
      q("Which are true about Server Components?", ["They can read the database directly", "They ship no JavaScript to the browser by default", "They can use useState"], [0, 1], "Server Components run on the server; hooks like useState need a Client Component.", "multiple"),
      tf("layout.js wraps every page in its folder.", true, "Layouts persist across navigations between child routes."),
      q("Which directive marks a Client Component?", ['"use server"', '"use client"', '"use cache"'], 1, '"use client" at the top of a file makes it a Client Component.'),
      sa("Which file name adds a shared UI wrapper around every page in a folder?", ["layout.js", "layout", "layout.jsx"], "layout.js wraps its child routes and keeps state across navigations."),
    ],
  },
  {
    slug: "javascript-for-beginners",
    title: "JavaScript for Beginners",
    subtitle: "From zero to building interactive web pages",
    description: "Learn JavaScript step by step with short videos, hands-on exercises and a quiz after every section. Perfect if you have never written code before.",
    category: "Development",
    level: "Beginner",
    price: 4999,
    discountPrice: 2999,
    thumbnail: "javascript-beginners",
    outcomes: ["Write modern JavaScript with confidence", "Manipulate the page and handle events", "Build two small projects"],
    prerequisites: ["Basic computer skills", "Any modern browser"],
    sections: [
      { title: "Getting Started", lessons: ["What is JavaScript?", "Variables and types", "Operators and conditions"] },
      { title: "Working with the Page", lessons: ["Selecting elements", "Events and listeners", "Mini project: to-do list"] },
    ],
    lessonQuiz: [
      q("Where does JavaScript run?", ["Only on servers", "In browsers and on servers", "Only on phones"], 1, "Browsers run JavaScript, and so do servers with Node.js or Bun."),
      tf("JavaScript and Java are the same language.", false, "They only share part of a name."),
      q("Which tag loads a JavaScript file?", ["<link>", "<script>", "<style>"], 1, "Use <script src=...>."),
    ],
    sectionQuiz: [
      q("Which method selects one element by CSS selector?", ["document.querySelector", "document.getAll", "window.find"], 0, "querySelector returns the first match."),
      q("Which are valid events?", ["click", "submit", "paint"], [0, 1], "click and submit are standard DOM events.", "multiple"),
      tf("addEventListener can attach more than one handler to the same event.", true, "Each call adds another listener."),
    ],
  },
  {
    slug: "python-for-data-analysis",
    title: "Python for Data Analysis",
    subtitle: "Clean, analyse and visualise data with Python, pandas and Matplotlib",
    description: "Turn messy spreadsheets into clear insights. You will learn Python basics, pandas for data wrangling and Matplotlib for charts, using real datasets from Pakistan's economy and sports.",
    category: "Data Science",
    level: "Beginner",
    price: 14999,
    discountPrice: 9999,
    thumbnail: "python-data",
    outcomes: ["Write clean Python scripts", "Load, clean and reshape data with pandas", "Create charts that tell a story", "Present a full analysis project"],
    prerequisites: ["Comfort with Excel or Google Sheets"],
    sections: [
      { title: "Python Essentials", lessons: ["Welcome and setup", "Lists, dictionaries and loops", "Functions"] },
      { title: "Data with pandas", lessons: ["DataFrames 101", "Cleaning messy data", "Grouping and aggregating"] },
      { title: "Visualisation", lessons: ["Charts with Matplotlib", "Capstone: cricket stats analysis"] },
    ],
    lessonQuiz: [
      q("Which data type stores key-value pairs?", ["list", "tuple", "dict"], 2, "Dictionaries map keys to values."),
      tf("Python uses indentation to define code blocks.", true, "Indentation is part of Python's syntax."),
      q("What does len([1, 2, 3]) return?", ["2", "3", "6"], 1, "len counts the items."),
    ],
    sectionQuiz: [
      q("Which pandas method shows the first rows?", ["df.top()", "df.head()", "df.first()"], 1, "head() shows the first five rows by default."),
      q("Which methods help with missing values?", ["dropna()", "fillna()", "sortna()"], [0, 1], "dropna removes and fillna replaces missing values.", "multiple"),
      tf("groupby() is used to aggregate data by category.", true, "Combine it with sum, mean, count and others."),
      sa("Which pandas method shows the first five rows of a DataFrame?", ["head", "head()", "df.head()"], "head() shows the first rows; pass a number for more."),
    ],
  },
  {
    slug: "ui-ux-design-with-figma",
    title: "UI/UX Design Fundamentals with Figma",
    subtitle: "Design beautiful, usable apps and websites from research to prototype",
    description: "Learn the full design process: user research, wireframes, visual design and interactive prototypes in Figma. Finish with a portfolio-ready case study.",
    category: "Design",
    level: "Beginner",
    price: 12999,
    thumbnail: "uiux-figma",
    outcomes: ["Run simple user research", "Design clean interfaces in Figma", "Build interactive prototypes", "Write a portfolio case study"],
    prerequisites: ["No design experience needed"],
    sections: [
      { title: "Design Thinking", lessons: ["Welcome to UX", "User research basics", "Personas and journeys"] },
      { title: "Figma in Practice", lessons: ["Frames, auto layout and components", "Typography and colour", "Prototyping"] },
    ],
    lessonQuiz: [
      q("UX design is mainly about…", ["Making things pretty", "How people experience a product", "Writing code"], 1, "UX focuses on the whole experience."),
      tf("You should talk to real users before designing.", true, "Research reduces guesswork."),
      q("A persona is…", ["A real customer", "A fictional user based on research", "A logo style"], 1, "Personas summarise research into a representative user."),
    ],
    sectionQuiz: [
      q("Which Figma feature makes designs resize automatically?", ["Auto layout", "Masks", "Plugins"], 0, "Auto layout adapts to content."),
      q("Good colour choices should…", ["Meet contrast guidelines", "Use as many colours as possible", "Support the brand"], [0, 2], "Accessible contrast and brand fit matter most.", "multiple"),
      tf("Components let you reuse elements across a design.", true, "Change the main component and every instance updates."),
    ],
  },
  {
    slug: "flutter-mobile-app-development",
    title: "Flutter Mobile App Development",
    subtitle: "Build Android and iOS apps from one codebase",
    description: "Learn Dart and Flutter by building three real apps: a habit tracker, a weather app and an e-commerce storefront with Firebase.",
    category: "Mobile",
    level: "Intermediate",
    price: 19999,
    discountPrice: 14999,
    thumbnail: "flutter-apps",
    outcomes: ["Write Dart confidently", "Build responsive Flutter layouts", "Manage state and call APIs", "Publish to the Play Store"],
    prerequisites: ["Basic programming in any language"],
    sections: [
      { title: "Dart and Flutter Basics", lessons: ["Welcome and setup", "Dart in one hour", "Widgets everywhere"] },
      { title: "Real Apps", lessons: ["Layouts that adapt", "State management", "Calling REST APIs"] },
    ],
    lessonQuiz: [
      q("Flutter apps are written in…", ["Kotlin", "Dart", "Swift"], 1, "Flutter uses Dart."),
      tf("One Flutter codebase can target Android and iOS.", true, "That is Flutter's main promise."),
      q("Everything on screen in Flutter is a…", ["Widget", "Fragment", "Activity"], 0, "UI is built from widgets."),
    ],
    sectionQuiz: [
      q("Which widget lays children out vertically?", ["Row", "Column", "Stack"], 1, "Column stacks children vertically."),
      q("Which are state management options?", ["Provider", "Riverpod", "Gradle"], [0, 1], "Gradle is a build tool.", "multiple"),
      tf("StatelessWidget can hold changing data.", false, "Use StatefulWidget or a state manager."),
    ],
  },
  {
    slug: "machine-learning-with-python",
    title: "Machine Learning with Python",
    subtitle: "Train, evaluate and deploy real machine learning models",
    description: "Go from statistics refreshers to building classification, regression and clustering models with scikit-learn, then serve one as an API.",
    category: "AI",
    level: "Advanced",
    price: 29999,
    discountPrice: 22999,
    thumbnail: "machine-learning",
    outcomes: ["Prepare data for modelling", "Train and tune scikit-learn models", "Evaluate models honestly", "Deploy a model as an API"],
    prerequisites: ["Python for Data Analysis or similar", "High-school maths"],
    sections: [
      { title: "ML Foundations", lessons: ["Welcome to machine learning", "Train/test splits", "Your first model"] },
      { title: "Models in Depth", lessons: ["Classification", "Regression", "Clustering"] },
      { title: "Shipping Models", lessons: ["Evaluation metrics", "Serving a model with FastAPI"] },
    ],
    lessonQuiz: [
      q("Supervised learning needs…", ["Labelled data", "No data", "Only images"], 0, "Labels are the answers the model learns from."),
      tf("You should evaluate a model on the data it was trained on.", false, "Use a separate test set."),
      q("Which library is used for classic ML in Python?", ["scikit-learn", "React", "Laravel"], 0, "scikit-learn covers most classic algorithms."),
    ],
    sectionQuiz: [
      q("Predicting house prices is a…", ["Classification task", "Regression task", "Clustering task"], 1, "Prices are continuous values."),
      q("Which are classification metrics?", ["Accuracy", "F1 score", "Mean squared error"], [0, 1], "MSE is for regression.", "multiple"),
      tf("K-means is an unsupervised algorithm.", true, "It groups data without labels."),
    ],
  },
  {
    slug: "freelancing-starter-kit",
    title: "Freelancing Starter Kit",
    subtitle: "Win your first clients on Upwork and Fiverr",
    description: "A free mini-course on building a profile, writing proposals that win and getting paid safely from Pakistan.",
    category: "Career",
    level: "All levels",
    price: 0,
    thumbnail: "freelancing",
    outcomes: ["Create a standout profile", "Write winning proposals", "Get paid safely"],
    prerequisites: [],
    sections: [{ title: "Getting Your First Client", lessons: ["Welcome", "Profiles that convert", "Proposals that win", "Getting paid"] }],
    lessonQuiz: [
      q("The first line of a proposal should…", ["List your skills", "Address the client's problem", "Mention your rate"], 1, "Show you understood the job."),
      tf("A portfolio helps you win clients faster.", true, "Proof of work builds trust."),
    ],
    sectionQuiz: null,
  },
  {
    slug: "cloud-devops-essentials",
    title: "Cloud & DevOps Essentials",
    subtitle: "Docker, CI/CD and cloud deployments for developers",
    description: "Containers, pipelines and cloud basics every developer needs. Coming soon.",
    category: "Cloud",
    level: "Intermediate",
    price: 17999,
    thumbnail: "cloud-devops",
    status: "draft",
    outcomes: ["Containerise apps with Docker", "Automate deploys with CI/CD"],
    prerequisites: ["Comfort with the command line"],
    sections: [{ title: "Containers", lessons: ["Why containers?", "Your first Dockerfile"] }],
    lessonQuiz: null,
    sectionQuiz: null,
  },
];

export const STUDENTS = [
  "Ayesha Khan", "Hamza Ali", "Fatima Noor", "Usman Tariq", "Zainab Hussain", "Bilal Ahmed", "Hira Malik", "Ali Raza",
  "Mahnoor Iqbal", "Saad Qureshi", "Iqra Javed", "Hassan Sheikh", "Areeba Shah", "Danish Mirza", "Sana Farooq", "Omer Siddiqui",
  "Laiba Aslam", "Faizan Butt", "Maryam Saeed", "Talha Anwar", "Kinza Rehman", "Hamid Nawaz", "Noor Fatima", "Rayyan Abbasi",
];

export const CITIES = [
  ["Lahore", "Pakistan"],
  ["London", "United Kingdom"],
  ["Karachi", "Pakistan"],
  ["Paris", "France"],
  ["Dubai", "United Arab Emirates"],
  ["Milan", "Italy"],
  ["Islamabad", "Pakistan"],
  ["Toronto", "Canada"],
  ["Berlin", "Germany"],
  ["Manchester", "United Kingdom"],
  ["Riyadh", "Saudi Arabia"],
  ["New York", "United States"],
  ["Rawalpindi", "Pakistan"],
  ["Istanbul", "Turkey"],
  ["Sydney", "Australia"],
  ["Madrid", "Spain"],
  ["Doha", "Qatar"],
  ["Amsterdam", "Netherlands"],
  ["Faisalabad", "Pakistan"],
  ["Rome", "Italy"],
  ["Kuala Lumpur", "Malaysia"],
  ["Birmingham", "United Kingdom"],
  ["Multan", "Pakistan"],
  ["Lyon", "France"],
];

export const ANNOUNCEMENTS = [
  ["full-stack-web-development-nextjs", "Live Q&A this Friday", "Join the live Q&A session this Friday at 8pm PKT. Bring your questions about deployment and authentication."],
  ["full-stack-web-development-nextjs", "New lesson: Server Actions deep dive", "A new bonus lesson on Server Actions and form handling has been added to section 2."],
  ["javascript-for-beginners", "Mini project files uploaded", "Starter files for the to-do list project are now attached to the last lesson."],
  ["python-for-data-analysis", "Datasets refreshed", "The cricket stats dataset now includes the latest PSL season."],
  ["ui-ux-design-with-figma", "Portfolio review week", "Submit your case study by Sunday to get personal feedback from the instructor."],
];

export const CONTACT_MESSAGES = [
  ["Usman Ghani", "usman.ghani@example.com", "+92 301 5551234", "Course content", "Is the Full-Stack course suitable for someone who only knows HTML and CSS?"],
  ["Rabia Saleem", "rabia.s@example.com", "+92 333 4445566", "Payments & refunds", "Can I pay through Easypaisa in two instalments?"],
  ["TechNest Pvt Ltd", "hr@technest.example.com", "+92 42 35556677", "Enrollment", "We would like to enrol 15 employees in the Data Analysis course. Do you offer corporate pricing?"],
  ["Adeel Rafiq", "adeel.r@example.com", "", "Certificates", "How can employers verify my certificate?"],
];

export const REVIEWS = [
  [5, "Best course I have taken. The projects made everything click and I deployed my first app in week three."],
  [5, "Clear explanations in simple English and Urdu examples. Worth every rupee."],
  [4, "Very practical. I wish there were a few more exercises in the middle section."],
  [5, "The instructor answers questions fast. I got unstuck many times thanks to the Q&A."],
  [4, "Good pace for beginners. Videos are short and to the point."],
  [3, "Content is good but some lessons felt rushed. Still learned a lot."],
  [5, "Got my first freelance client after finishing this. Thank you!"],
  [4, "Solid course with real examples. The quizzes helped me revise."],
];

export const QUESTIONS = [
  ["I get an error saying module not found after installing. What am I missing?", "Restart the dev server after installing a package, and check the import path matches the file name exactly (it is case sensitive)."],
  ["Can I follow this course on a 4 GB RAM laptop?", "Yes. Close other apps while the editor runs and you will be fine for everything in this course."],
  ["Is there a difference between the version in the video and the latest one?", "Only small UI changes. The code in the lesson works the same on the latest version."],
  ["Where can I download the starter files for this lesson?", "They are in the lesson attachments under the video. Download the zip and open the folder in VS Code."],
  ["Why do we use this approach instead of the simpler one?", null],
  ["How long should I spend practising before moving on?", null],
];

export const NOTES = [
  "Key idea: keep components small and give each one a single job.",
  "Revise this part before the quiz.",
  "Shortcut shown here saves a lot of typing. Try it tomorrow.",
  "Good example for my portfolio project.",
  "Remember to handle the empty state.",
];
