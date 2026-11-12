export const seedCourses = [
  {
    id: "ux-design",
    title: "UX Design: From Insight to Interface",
    instructor: "Maya Chen",
    organization: "Northstar Design Studio",
    category: "Design",
    level: "Beginner",
    duration: "6 weeks",
    rating: "4.9",
    reviews: "2.4k",
    price: "$39",
    image:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&q=85",
    accent: "lavender",
    description:
      "Learn research, wireframing, and prototyping to create digital products people love.",
    lessons: [
      {
        title: "Start with the why",
        content: "Learn how to plan qualitative research, ask open questions, and uncover the needs behind what people say.",
        videoUrl: "https://www.youtube-nocookie.com/embed/bAARmsv1tms",
        quiz: { questions: [
          { question: "What is the main purpose of qualitative UX research?", options: ["Measure server response time", "Choose brand colors", "Understand people's needs and motivations", "Prove a design is already correct"], correctIndex: 2 },
          { question: "Which interview question is most likely to reveal useful detail?", options: ["Tell me about the last time you tried to do this.", "Would you use this every day?", "You like this feature, right?", "Is this the best design?"], correctIndex: 0 },
        ] },
      },
      {
        title: "Put your skills to work",
        content: "Turn a clear user need into a simple wireframe, then connect screens into a prototype to explore the flow.",
        videoUrl: "https://www.youtube-nocookie.com/embed/1ucLq6JTxac",
        quiz: { questions: [
          { question: "What is a wireframe primarily used to show?", options: ["Final production code", "The layout and hierarchy of a screen", "A database schema", "The product's marketing budget"], correctIndex: 1 },
          { question: "Why make a prototype before building a product?", options: ["To avoid speaking with users", "To explore and test an interaction flow", "To replace all research", "To guarantee a product will succeed"], correctIndex: 1 },
        ] },
      },
      {
        title: "Make your work count",
        content: "Test a design with representative users, watch where they struggle, and use the findings to improve the experience.",
        videoUrl: "https://www.youtube-nocookie.com/embed/u261LfnxGF0",
        quiz: { questions: [
          { question: "What should a usability test focus on?", options: ["Whether users agree with the designer", "How quickly the team can write code", "Whether participants can complete realistic tasks", "Which color is most fashionable"], correctIndex: 2 },
          { question: "What is a useful response when a participant struggles?", options: ["Explain the interface immediately", "Observe and note where the task became difficult", "Tell them they made a mistake", "End the test and change the product"], correctIndex: 1 },
        ] },
      },
    ],
  },
  {
    id: "data-storytelling",
    title: "Data Storytelling with Python",
    instructor: "Andre Williams",
    organization: "Fieldnotes Academy",
    category: "Data",
    level: "Intermediate",
    duration: "8 weeks",
    rating: "4.8",
    reviews: "1.8k",
    price: "$49",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=85",
    accent: "mint",
    description:
      "Turn raw data into clear visual stories and confident, evidence-based decisions.",
    lessons: [
      {
        title: "Ask a better question",
        content: "Prepare a dataset for analysis by inspecting its shape, handling missing values, and checking data types.",
        videoUrl: "https://www.youtube-nocookie.com/embed/bDhvCp3_lYw",
        quiz: { questions: [
          { question: "Why inspect missing values before analyzing a dataset?", options: ["They always mean the entire row must be deleted", "They can affect conclusions and analysis choices", "They make charts load faster", "They change column names automatically"], correctIndex: 1 },
          { question: "What does a pandas DataFrame represent?", options: ["A single number", "A chart image", "A Python package installer", "A two-dimensional labeled data structure"], correctIndex: 3 },
        ] },
      },
      {
        title: "Find the signal",
        content: "Choose an appropriate chart, label it clearly, and use visual comparisons to make patterns easier to see.",
        videoUrl: "https://www.youtube-nocookie.com/embed/7Lc2AxiM17o",
        quiz: { questions: [
          { question: "Which chart is often useful for showing a trend over time?", options: ["Word cloud", "Line chart", "Pie chart with dozens of slices", "Unlabeled screenshot"], correctIndex: 1 },
          { question: "What helps make a chart easier to interpret?", options: ["Removing all axis labels", "Using as many colors as possible", "Clear labels and an appropriate scale", "Hiding the source data"], correctIndex: 2 },
        ] },
      },
      {
        title: "Tell the story",
        content: "Build a data story around a focused message: explain the context, show the evidence, and make the implication clear.",
        videoUrl: "https://www.youtube-nocookie.com/embed/Hfx1X9WSGYQ",
        quiz: { questions: [
          { question: "What should guide the structure of a data story?", options: ["The number of charts available", "The analyst's favorite color", "A desire to include every data point", "The audience's question and the evidence"], correctIndex: 3 },
          { question: "What is the purpose of a clear takeaway?", options: ["Make the chart more decorative", "Help the audience understand what the evidence means", "Hide uncertainty", "Replace the underlying analysis"], correctIndex: 1 },
        ] },
      },
    ],
  },
  {
    id: "product-leadership",
    title: "Product Leadership Essentials",
    instructor: "Sofia Patel",
    organization: "The Product Guild",
    category: "Business",
    level: "All levels",
    duration: "5 weeks",
    rating: "4.9",
    reviews: "986",
    price: "$35",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85",
    accent: "peach",
    description:
      "Build the skills to align teams, set a clear product vision, and deliver outcomes.",
    lessons: [
      {
        title: "Lead with a clear vision",
        content: "Connect a real customer problem with a compelling future state that can guide product decisions.",
        videoUrl: "https://www.youtube-nocookie.com/embed/_EyaHKVCAiw",
        quiz: { questions: [
          { question: "A useful product vision describes…", options: ["Every task for the next sprint", "The future value the product aims to create", "Only the technical architecture", "A list of competitors"], correctIndex: 1 },
          { question: "What should a product vision help a team do?", options: ["Avoid talking to customers", "Promise a fixed feature list", "Replace product strategy", "Make aligned decisions toward a shared direction"], correctIndex: 3 },
        ] },
      },
      {
        title: "Bring your team together",
        content: "Prioritize opportunities with transparent criteria, compare customer impact and effort, and explain the trade-offs.",
        videoUrl: "https://www.youtube-nocookie.com/embed/efiQu5R644Y",
        quiz: { questions: [
          { question: "Why use a prioritization framework such as RICE?", options: ["Guarantee that estimates are perfect", "Avoid discussing customer value", "Make assumptions and trade-offs more explicit", "Select every idea at once"], correctIndex: 2 },
          { question: "What should a team do when estimates are uncertain?", options: ["Present them as facts", "Treat them as assumptions and revisit with evidence", "Ignore impact", "Stop prioritizing"], correctIndex: 1 },
        ] },
      },
      {
        title: "Deliver meaningful outcomes",
        content: "Select product metrics tied to user and business outcomes, then use them to learn whether changes made a difference.",
        videoUrl: "https://www.youtube-nocookie.com/embed/wtDFgx41Rho",
        quiz: { questions: [
          { question: "A strong product metric should be connected to…", options: ["The number of meetings held", "The size of the codebase", "A goal to maximize every number", "A meaningful user or business outcome"], correctIndex: 3 },
          { question: "Why review a metric after a product change?", options: ["To prove the team was right", "To avoid collecting feedback", "To learn whether the intended outcome improved", "To replace all qualitative research"], correctIndex: 2 },
        ] },
      },
    ],
  },
  {
    id: "web-development",
    title: "Modern Web Development",
    instructor: "Jonas Rivera",
    organization: "Open Craft",
    category: "Development",
    level: "Beginner",
    duration: "10 weeks",
    rating: "4.7",
    reviews: "3.1k",
    price: "$59",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85",
    accent: "blue",
    description:
      "Build responsive, accessible websites with the tools professional teams use.",
    lessons: [
      {
        title: "How the web fits together",
        content: "See how browsers request resources and how HTML, CSS, and JavaScript combine to create an interactive page.",
        videoUrl: "https://www.youtube-nocookie.com/embed/hJHvdBlSxug",
        quiz: { questions: [
          { question: "What is HTML mainly responsible for?", options: ["Styling every visual detail", "Structuring page content", "Storing user passwords", "Hosting the website"], correctIndex: 1 },
          { question: "What role does JavaScript commonly play in a web page?", options: ["Replacing the browser", "Defining all page structure", "Adding behavior and interactivity", "Serving as a domain name"], correctIndex: 2 },
        ] },
      },
      {
        title: "Build for every screen",
        content: "Use responsive CSS and media queries so layouts adapt to different viewport sizes and remain usable.",
        videoUrl: "https://www.youtube-nocookie.com/embed/yU7jJ3NbPdA",
        quiz: { questions: [
          { question: "What does a CSS media query let you do?", options: ["Run a database query", "Change a website's domain", "Upload an image", "Apply styles based on viewport or device conditions"], correctIndex: 3 },
          { question: "What is a good responsive design practice?", options: ["Assume every screen is the same size", "Test layouts at multiple viewport widths", "Fix all content to one wide column", "Hide navigation on every device"], correctIndex: 1 },
        ] },
      },
      {
        title: "Ship your first project",
        content: "Review your project, check it in the browser, and learn the steps involved in publishing a website.",
        videoUrl: "https://www.youtube-nocookie.com/embed/GxmfcnU3feo",
        quiz: { questions: [
          { question: "What should you do before sharing a finished website?", options: ["Assume it works without checking", "Delete the source files", "Test key pages and interactions", "Disable responsive styles"], correctIndex: 2 },
          { question: "What does deploying a website generally mean?", options: ["Writing a new HTML tag", "Changing a local variable", "Creating a wireframe", "Making it available from a hosting environment"], correctIndex: 3 },
        ] },
      },
    ],
  },
];

export function publicCourse(course) {
  const { lessons, ...courseDetails } = course;
  return {
    ...courseDetails,
    lessons: lessons.map((lesson) => ({
      ...lesson,
      quiz: lesson.quiz ? {
        questions: lesson.quiz.questions.map(({ question, options }) => ({ question, options })),
      } : undefined,
    })),
    rating: course.rating || "New",
    reviews: course.reviews || "0",
    price: course.price || "Free",
  };
}
