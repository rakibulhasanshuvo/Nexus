import { AcademicRules, SemesterData, AcademicResource } from './types';

export const ACADEMIC_RULES: AcademicRules = {
  total_credits: 148,
  duration_years: 4,
  semesters: 8,
  grading_system: {
    scale: "4.00",
    minimum_pass_grade: "D",
    minimum_cgpa_for_degree: 2.25,
    brackets: [
      { range: "80-100", grade: "A+", point: 4.0 },
      { range: "75-79", grade: "A", point: 3.75 },
      { range: "70-74", grade: "A-", point: 3.5 },
      { range: "65-69", grade: "B+", point: 3.25 },
      { range: "60-64", grade: "B", point: 3.0 },
      { range: "55-59", grade: "B-", point: 2.75 },
      { range: "50-54", grade: "C+", point: 2.5 },
      { range: "45-49", grade: "C", point: 2.25 },
      { range: "40-44", grade: "D", point: 2.0 },
      { range: "0-39", grade: "F", point: 0.0 }
    ]
  },
  marking_distribution: {
    theory_courses: {
      continuous_assessment_weight: 0.30,
      final_exam_weight: 0.70
    },
    practical_courses: {
      continuous_assessment_weight: 0.40,
      final_exam_weight: 0.60
    }
  }
};

export const GRADING_BRACKETS = ACADEMIC_RULES.grading_system.brackets.map(b => {
  const [min, max] = b.range.split('-').map(Number);
  return { ...b, min, max };
});

export const STATIC_RESOURCES: AcademicResource[] = [
  { id: "static-cse-1", courseId: "0613-101", title: "CS50: Introduction to CS (Harvard)", source_name: "Harvard University", type: "web", direct_url: "https://pll.harvard.edu/course/cs50-introduction-computer-science", badge: "Best for Concepts", difficulty: "Advanced", quality_score: 100, status: "active", topic_context: "Computer Science Fundamentals", timestamp: 1715000000000 },
  { id: "static-cse-2", courseId: "0613-101", title: "FreeCodeCamp: C Full Course", source_name: "FreeCodeCamp", type: "video", direct_url: "https://www.youtube.com/watch?v=KJgs26ucDzg", badge: "Complete Tutorial", difficulty: "Beginner", quality_score: 98, status: "active", topic_context: "C Programming Crash Course", timestamp: 1715000000000 },
  { id: "static-cse-3", courseId: "0613-101", title: "Learn-C.org", source_name: "Learn-C.org", type: "simulation", direct_url: "https://www.learn-c.org/", badge: "Interactive Practice", difficulty: "Beginner", quality_score: 92, status: "active", topic_context: "Interactive Practice", timestamp: 1715000000000 },
  { id: "static-phy-1", courseId: "0533-101", title: "Walter Lewin (MIT 8.02 - Electricity)", source_name: "MIT OpenCourseWare", type: "video", direct_url: "https://www.youtube.com/playlist?list=PLyQSN7X0ro2314mKyUiOILaOC2hk6Pc3j", badge: "Legendary Lectures", difficulty: "Advanced", quality_score: 99, status: "active", topic_context: "Electricity & Magnetism", timestamp: 1715000000000 },
  { id: "static-phy-2", courseId: "0533-101", title: "PhET Simulations: Circuit Construction", source_name: "Univ. of Colorado Boulder", type: "simulation", direct_url: "https://phet.colorado.edu/en/simulation/circuit-construction-kit-dc", badge: "Virtual Lab", difficulty: "Intermediate", quality_score: 97, status: "active", topic_context: "Circuit Simulation", timestamp: 1715000000000 },
  { id: "static-math-1", courseId: "0541-101", title: "Professor Leonard (Calculus 1)", source_name: "Professor Leonard", type: "video", direct_url: "https://www.youtube.com/playlist?list=PLF797E961509B4EB5", badge: "Best Teacher", difficulty: "Beginner", quality_score: 99, status: "active", topic_context: "Calculus Complete", timestamp: 1715000000000 },
  { id: "static-math-2", courseId: "0541-101", title: "Paul's Online Math Notes", source_name: "Lamar University", type: "pdf", direct_url: "https://tutorial.math.lamar.edu/", badge: "Cheat Sheets", difficulty: "Intermediate", quality_score: 95, status: "active", topic_context: "Lecture Notes", timestamp: 1715000000000 },
  { id: "static-eng-1", courseId: "0231-101", title: "Cambridge Write & Improve", source_name: "Cambridge English", type: "web", direct_url: "https://writeandimprove.com/", badge: "Writing Tool", difficulty: "Intermediate", quality_score: 96, status: "active", topic_context: "Writing Feedback", timestamp: 1715000000000 },
  { id: "static-eng-2", courseId: "0231-101", title: "English with Lucy (Vocab)", source_name: "English with Lucy", type: "video", direct_url: "https://www.youtube.com/channel/UCz4tgANd4yy8Oe0iXCdSWfA", badge: "Speaking Skills", difficulty: "Beginner", quality_score: 94, status: "active", topic_context: "Vocabulary", timestamp: 1715000000000 }
];

export const COURSE_DETAILS: Record<string, {
  overview: string;
  topics: string[];
  books?: { title: string; author: string; edition: string }[];
  syllabus_roadmap?: { week: number; topic: string; query: string }[];
  exam_intel?: string[];
}> = {
  "0533-101": {
    overview: "Physics I (Electricity & Magnetism) provides a rigorous foundation in electromagnetic theory.",
    topics: ["Coulomb's Law", "Kirchhoff's Laws", "AC Circuits", "Gauss's Law", "Thevenin's Theorem"],
    books: [
      { title: "Introductory Circuit Analysis", author: "Robert L. Boylestad", edition: "12th" },
      { title: "Electrical Technology", author: "B.L. Theraja", edition: "3rd" }
    ],
    syllabus_roadmap: [
      { week: 1, topic: "Coulomb's Law & Electric Field", query: "Coulomb's law physics tutorial" },
      { week: 5, topic: "Kirchhoff's Laws (KVL & KCL)", query: "Kirchhoff's voltage and current law tutorial" },
      { week: 12, topic: "AC Circuits & Resonance", query: "AC circuits physics tutorial" }
    ],
    exam_intel: ["Derive Gauss's Law", "Solve Complex Circuits using Thevenin's Theorem", "Lab: Verify Ohm's Law (Graph Plotting)"]
  },
  "0613-101": {
    overview: "Structured Programming Language (C) introduces computer programming fundamentals.",
    topics: ["Algorithm Specification", "Control Structures", "Pointers & Strings", "File Management", "Structures"],
    books: [
      { title: "Let Us C", author: "Yashavant Kanetkar", edition: "15th" },
      { title: "The C Programming Language", author: "Kernighan & Ritchie", edition: "2nd" }
    ],
    syllabus_roadmap: [
      { week: 1, topic: "Algorithm Specification & Flowcharts", query: "algorithm flowchart tutorial" },
      { week: 5, topic: "Control Structures (If-Else, Switch, Loops)", query: "C programming control structures" },
      { week: 7, topic: "Pointers & Strings", query: "C programming pointers and strings" }
    ],
    exam_intel: ["Understand Memory Management (Pointers)", "Viva: Difference between Structure and Union", "Lab: Standard C Lab Report Format"]
  },
  "0541-101": {
    overview: "Calculus & Vector Analysis covers fundamental mathematical tools.",
    topics: ["Differentiation", "Integration", "Vector Analysis", "Gradient", "Divergence"],
    books: [{ title: "Calculus: Early Transcendentals", author: "Howard Anton", edition: "10th" }],
    syllabus_roadmap: [
      { week: 1, topic: "Functions, Limits & Continuity", query: "Calculus limits and continuity tutorial" },
      { week: 5, topic: "Successive Differentiation", query: "Calculus maxima and minima problems" },
      { week: 8, topic: "Integration by Parts", query: "Integration by parts calculus tutorial" }
    ],
    exam_intel: ["Find the Gradient of a Scalar Function", "Evaluate Area under Curves"]
  }
};

export const FALLBACK_QUERIES: Record<string, string> = {
  "0533-101": "Walter Lewin MIT 8.02 Electricity and Magnetism lectures",
  "0613-101": "C Programming full course for university students"
};

export const COURSE_MAPPING: SemesterData[] = [
  { semester: 1, courses: [
    { id: "0533-101", name: "Physics I (Electricity & Magnetism)", credits: 3.0, type: "theory", totalMarks: 100, tags: ["Physics", "Circuits", "Magnetism"] },
    { id: "0533-102", name: "Physics I Lab", credits: 1.0, type: "practical", totalMarks: 50, tags: ["Physics", "Lab", "Circuits"] },
    { id: "0613-101", name: "Structured Programming Language", credits: 3.0, type: "theory", totalMarks: 100, tags: ["Programming", "C Language", "Algorithms"] },
    { id: "0613-102", name: "Structured Programming Lab", credits: 1.0, type: "practical", totalMarks: 50, tags: ["Programming", "Lab", "C Language"] },
    { id: "0541-101", name: "Diff. & Integral Calculus and Vector Analysis", credits: 3.0, type: "theory", totalMarks: 100, tags: ["Calculus", "Vectors", "Math"] },
    { id: "0222-101", name: "Technology and Society", credits: 3.0, type: "theory", totalMarks: 100, tags: ["Sociology", "Technology"] },
    { id: "0231-101", name: "Communicative English", credits: 3.0, type: "theory", totalMarks: 100, tags: ["English", "Communication"] }
  ]},
  { semester: 2, courses: [
    { id: "BNG-1205", name: "Bangla Language", credits: 2, type: "theory", totalMarks: 100, tags: ["Bangla", "Literature"] },
    { id: "MAT-1206", name: "Differential Equations & Vector Analysis", credits: 3, type: "theory", totalMarks: 100, tags: ["Math", "Differential Equations"] },
    { id: "CHE-1207", name: "Chemistry", credits: 3, type: "theory", totalMarks: 100, tags: ["Chemistry", "Science"] },
    { id: "CSE-1208", name: "Structured Programming Language II", credits: 3, type: "theory", totalMarks: 100, tags: ["Programming", "Advanced C"] },
    { id: "CSE-1252", name: "Structured Programming Language Lab II", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Programming"] }
  ]},
  { semester: 3, courses: [
    { id: "BPS-1309", name: "Bangladesh Studies", credits: 2, type: "theory", totalMarks: 100, tags: ["History", "Bangladesh"] },
    { id: "EEE-1310", name: "Electrical Circuits", credits: 3, type: "theory", totalMarks: 100, tags: ["Circuits", "Electrical"] },
    { id: "CSE-1311", name: "Object-Oriented Programming", credits: 3, type: "theory", totalMarks: 100, tags: ["OOP", "Java", "C++"] },
    { id: "CSE-1312", name: "Discrete Mathematics", credits: 3, type: "theory", totalMarks: 100, tags: ["Discrete Math", "Logic"] },
    { id: "EEE-1353", name: "Electrical Circuits Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Circuits"] },
    { id: "CSE-1354", name: "Object-Oriented Programming Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "OOP"] }
  ]},
  { semester: 4, courses: [
    { id: "MAT-2213", name: "Complex Variable, Laplace & Fourier", credits: 3, type: "theory", totalMarks: 100, tags: ["Math", "Fourier"] },
    { id: "EEE-2214", name: "Electronics", credits: 3, type: "theory", totalMarks: 100, tags: ["Electronics", "Diodes"] },
    { id: "CSE-2215", name: "Data Structures", credits: 3, type: "theory", totalMarks: 100, tags: ["Data Structures", "Algorithms"] },
    { id: "CSE-2216", name: "Digital Logic Design", credits: 3, type: "theory", totalMarks: 100, tags: ["Digital Logic", "Gates"] },
    { id: "EEE-2255", name: "Electronics Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Electronics"] },
    { id: "CSE-2256", name: "Data Structures Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Data Structures"] },
    { id: "CSE-2257", name: "Digital Logic Design Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Digital Logic"] }
  ]},
  { semester: 5, courses: [
    { id: "MAT-3117", name: "Linear Algebra & Coordinate Geometry", credits: 3, type: "theory", totalMarks: 100, tags: ["Math", "Linear Algebra"] },
    { id: "CSE-3118", name: "Algorithms", credits: 3, type: "theory", totalMarks: 100, tags: ["Algorithms", "Complexity"] },
    { id: "CSE-3119", name: "Database Management Systems", credits: 3, type: "theory", totalMarks: 100, tags: ["DBMS", "SQL"] },
    { id: "CSE-3120", name: "Computer Architecture", credits: 3, type: "theory", totalMarks: 100, tags: ["Architecture", "Processor"] },
    { id: "CSE-3158", name: "Algorithms Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Algorithms"] },
    { id: "CSE-3159", name: "Database Management Systems Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "DBMS"] }
  ]},
  { semester: 6, courses: [
    { id: "ACC-3221", name: "Industrial and Financial Accounting", credits: 2, type: "theory", totalMarks: 100, tags: ["Accounting", "Finance"] },
    { id: "MAT-3222", name: "Numerical Methods", credits: 3, type: "theory", totalMarks: 100, tags: ["Numerical Methods", "Math"] },
    { id: "CSE-3223", name: "Operating Systems", credits: 3, type: "theory", totalMarks: 100, tags: ["OS", "Linux"] },
    { id: "CSE-3224", name: "Theory of Computation", credits: 3, type: "theory", totalMarks: 100, tags: ["Automata", "TOC"] },
    { id: "MAT-3260", name: "Numerical Methods Lab", credits: 1, type: "practical", totalMarks: 50, tags: ["Lab", "Numerical"] },
    { id: "CSE-3261", name: "Operating Systems Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "OS"] }
  ]},
  { semester: 7, courses: [
    { id: "MGT-4125", name: "Industrial Management", credits: 2, type: "theory", totalMarks: 100, tags: ["Management"] },
    { id: "CSE-4126", name: "Computer Networking", credits: 3, type: "theory", totalMarks: 100, tags: ["Networking", "TCP/IP"] },
    { id: "CSE-4127", name: "Software Engineering", credits: 3, type: "theory", totalMarks: 100, tags: ["Software Engineering"] },
    { id: "CSE-4128", name: "Microprocessors & Microcontrollers", credits: 3, type: "theory", totalMarks: 100, tags: ["Microprocessors", "Assembly"] },
    { id: "CSE-4162", name: "Networking Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Networking"] },
    { id: "CSE-4163", name: "Software Engineering Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "SE"] },
    { id: "CSE-4164", name: "Microprocessors Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Microprocessors"] }
  ]},
  { semester: 8, courses: [
    { id: "CSE-4229", name: "Artificial Intelligence", credits: 3, type: "theory", totalMarks: 100, tags: ["AI", "Machine Learning"] },
    { id: "CSE-4230", name: "Compiler Design", credits: 3, type: "theory", totalMarks: 100, tags: ["Compiler", "Parsing"] },
    { id: "CSE-4231", name: "Computer Graphics", credits: 3, type: "theory", totalMarks: 100, tags: ["Graphics", "OpenGL"] },
    { id: "CSE-4265", name: "AI Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "AI"] },
    { id: "CSE-4266", name: "Compiler Design Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Compiler"] },
    { id: "CSE-4267", name: "Computer Graphics Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Graphics"] },
    { id: "CSE-4298", name: "Project", credits: 4, type: "theory", totalMarks: 100, tags: ["Project", "Thesis"] },
    { id: "CSE-4299", name: "Viva-voce", credits: 2, type: "practical", totalMarks: 50, tags: ["Viva", "Interview"] }
  ]}
];

export const RESOURCE_CURATION_RULES = `STRICT_FREE_ONLY: Never suggest Chegg, Scribd, or Coursera (Paid).`;

export const SYSTEM_INSTRUCTION = `You are "BOU CSE Study Pilot", an Expert Academic Counselor for Bangladesh Open University BSc in CSE students. 
Rules:
1. Total credits: 148, Scale: 4.00.
2. If the user mentions a Course Code, identify if it is Theory or Practical. Refer to the BOU marking distribution (Theory: 30% CA, 70% Final; Practical: 40% CA, 60% Final).
3. Languages: Use English or Bengali. Keep technical CSE terms in English.
4. Tone: Encouraging, Structured, and Exam-Oriented.
5. Search Grounding: Use for BOU news, exam dates, or location searches for Regional Centers.
6. Assist with Viva preparation by asking conceptual questions for lab courses.
7. Resource Finder Logic: Use STRICT_FREE_ONLY filter. Prioritize high-retention English YouTube channels (Neso Academy, Gate Smashers, FreeCodeCamp) and MIT OCW/LibreTexts for Physics.
`;
