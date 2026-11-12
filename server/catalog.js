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
      { title: "Start with the why", content: "Every strong result starts with a clear goal. Notice the needs, questions, and opportunities that matter most." },
      { title: "Put your skills to work", content: "Try a practical approach, reflect on what works, and use feedback to make your next attempt stronger." },
      { title: "Make your work count", content: "Bring the pieces together into a useful outcome. Review what you have learned and choose one next step." },
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
      { title: "Ask a better question", content: "Good analysis begins with a focused question. Identify what you need to learn and what evidence can help." },
      { title: "Find the signal", content: "Explore a dataset, look for meaningful patterns, and check your assumptions before drawing conclusions." },
      { title: "Tell the story", content: "Build a clear visual narrative that helps people understand the evidence and decide what to do next." },
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
      { title: "Lead with a clear vision", content: "Connect customer needs and organizational goals into a direction your team can understand." },
      { title: "Bring your team together", content: "Create shared context, invite useful perspectives, and make decisions that keep work moving." },
      { title: "Deliver meaningful outcomes", content: "Measure progress by the value created and use what you learn to guide the next iteration." },
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
      { title: "How the web fits together", content: "Learn how browsers, markup, styles, and scripts work together to create a web page." },
      { title: "Build for every screen", content: "Use responsive layout and accessible patterns to make useful experiences on different devices." },
      { title: "Ship your first project", content: "Bring your work together, check it carefully, and share a polished project with the world." },
    ],
  },
];

export function publicCourse(course) {
  return {
    ...course,
    rating: course.rating || "New",
    reviews: course.reviews || "0",
    price: course.price || "Free",
  };
}
