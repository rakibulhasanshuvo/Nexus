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
  "0222-101": {
    overview: "Technology and Society (GED Sociology) explores the intersection of sociological theory, technological evolution, and population dynamics in a globalized world.",
    topics: [
      "Foundations: Society, Science, Technology, and the Industrial Revolution",
      "Social Entities: Definitions of Community, Association, and Institutions",
      "Research Methods: Stages of Social Research and Sociological Analysis",
      "Culture: Relationship between Technology, Culture, and Cultural Lag",
      "Socialization: Personality Development, Family Structures, and Social Control",
      "Global Development: Industrialization, Globalization, and Dependency Theory",
      "Sustainability: Sustainable Development, Technology Transfer, and Modernity",
      "Social Structure: Pre-industrial, Industrial, and Post-industrial Societies",
      "Stratification: Social Inequality, Mobility, and Poverty Dynamics",
      "Urbanization: Rural/Urban Sociology and City Development",
      "Population Dynamics: Fertility, Mortality, and Human Migration",
      "Demographic Theories: Malthusian, Optimum, and Transition Theories",
      "Policy: National and International Population Policies"
    ],
    books: [
      { title: "Sociology: A Brief Introduction", author: "Richard T. Schaefer", edition: "13th" },
      { title: "Technology and Society", author: "Animesh Halder", edition: "2nd" }
    ],
    syllabus_roadmap: [
      { week: 1, topic: "Introduction to Sociology & Technology", query: "sociology and technology interaction" },
      { week: 4, topic: "Socialization & Personality", query: "socialization process in sociology" },
      { week: 12, topic: "Social Change & Global Technology", query: "impact of technology on social change" }
    ],
    exam_intel: [
      "Compare Culture vs Civilization and explain Cultural Lag",
      "Discuss Stages of Social Research and Sociological Methods",
      "Analyze the Impact of Globalization on Social Inequality",
      "Contrast Malthusian vs Demographic Transition Theories"
    ]
  },
  "0231-101": {
    overview: "Communicative English is a GED requirement designed to equip students with essential social, academic, and professional communication skills.",
    topics: [
      "Foundations: Language vs. Communication and Speech vs. Writing",
      "Structural Writing: Topic Selection, Thesis Statements, and Paragraphing",
      "Linguistic Principles: Unity, Coherence, and Cohesion in Composition",
      "Writing Styles: Descriptive, Narrative, Expository, and Technical Writing",
      "Formal Documentation: Reports, Manuals, Letters, Memos, and Minutes",
      "Academic Writing: Essays, Term Papers, Bibliographies, and Footnotes",
      "The Writing Process: Drafting, Planning, Revising, and Final Editing",
      "Phonetics: Sounds, Stress, Intonation, and Rhythmic Patterns",
      "Interactional Skills: Interpersonal and Formal/Informal Communication",
      "Public Speaking: Presentations, Discussions, and Negotiating Skills",
      "Rhetorical Devices and Translation (Verbal to Non-verbal forms)"
    ],
    books: [
      { title: "High School English Grammar", author: "Wren & Martin", edition: "Latest" },
      { title: "Business Communication", author: "M.K. Sehgal", edition: "2nd" }
    ],
    syllabus_roadmap: [
      { week: 1, topic: "Principles of Communication", query: "effective communication skills tutorial" },
      { week: 5, topic: "Professional Writing Standards", query: "formal report writing guide" },
      { week: 12, topic: "Presentation & Oral Skills", query: "business presentation techniques" }
    ],
    exam_intel: [
      "Drafting Formal Professional Documents (Memos/Reports)",
      "Applying Coherence and Cohesion in Academic Essays",
      "Roleplay Scenarios for Interpersonal Communication",
      "Phonetic Analysis and Rhetorical Device Identification"
    ]
  },
  "0533-101": {
    overview: "Physics I (Electricity & Magnetism) provides a rigorous foundation in electromagnetic theory, circuit analysis techniques (Nodal/Mesh), and comprehensive network theorems.",
    topics: [
      "Fundamental Principles: Electrical Units, Charge, and Coulomb's Law",
      "Electric Fields & Media: Lines of Force, Gauss’s Law, Dipoles, and Dielectric Media",
      "Potential & Circuits: Potential Function, Components, Networks, and Divider Rules",
      "Circuit Laws & Analysis: Ohm's, Kirchhoff's, Wye-delta, Nodal, and Mesh Analysis",
      "Sources & Theorems: Superposition, Thevenin, Norton, Max Power, and Reciprocity",
      "Advanced Theorems: Millman’s, Substitution, and Reciprocity Theorems",
      "AC Analysis: Series/Parallel AC Networks, Passive Elements, and RMS Values",
      "Magnetic Fields & Forces: Ampere's Law, Biot-Savart Law, and Magnetic Forces",
      "Electromagnetic Induction: Faraday’s/Lenz's Law, Self and Mutual Induction",
      "Transformers: Introduction to Principles and Applications"
    ],
    books: [
      { title: "Introductory Circuit Analysis", author: "Robert L. Boylestad", edition: "12th" },
      { title: "Electrical Technology", author: "B.L. Theraja", edition: "3rd" }
    ],
    syllabus_roadmap: [
      { week: 1, topic: "Coulomb's Law & Electric Field", query: "Coulomb's law physics tutorial" },
      { week: 5, topic: "Kirchhoff's Laws (KVL & KCL)", query: "Kirchhoff's voltage and current law tutorial" },
      { week: 12, topic: "AC Circuits & Resonance", query: "AC circuits physics tutorial" }
    ],
    exam_intel: [
      "Derive and Apply Gauss's Law in different geometries",
      "Solve Complex Networks using Nodal and Mesh Analysis",
      "Verify Network Theorems (Thevenin, Norton, Superposition)",
      "Explain Electromagnetic Induction and Transformer Principles"
    ]
  },
  "0533-102": {
    overview: "Physics I Lab focuses on practical verification of electrical laws and theorems using laboratory equipment.",
    topics: [
      "Equipment Familiarization: Lab equipment usage and safety",
      "Experimental Verification: Ohm's law and basic circuit measurements",
      "Verification of Kirchhoff's Laws (KCL and KVL)",
      "Network Analysis: Series and parallel resistance circuits",
      "Theorems Application: Superposition and Thevenin’s Theorem",
      "Power Transfer: Maximum Power Transfer Theorem verification"
    ],
    exam_intel: ["Demonstrate KVL on a Breadboard", "Measure Thevenin Equivalent Voltage", "Safety Precautions in Electrical Lab"]
  },
  "0541-101": {
    overview: "Differential and Integral Calculus and Vector Analysis covers fundamental and advanced mathematical tools including differentiation, integration, and vector fields essential for engineering.",
    topics: [
      "Foundations: Sets of Real Numbers, Intervals, Absolute Value, and Functions (Domain and Range)",
      "Functions & Graphs: Various types of Functions, Parametric Equations, and Graph of Functions",
      "Limits & Continuity: Limits, L'Hôpital's Rule, Indeterminate Forms, Continuity, and Differentiability",
      "Derivatives: Geometric Interpretation, Tangent Lines, Chain Rule, and Implicit Differentiation",
      "Advanced Differentiation: Successive Differentiation, Leibnitz's Theorem, and Partial Derivatives",
      "Theorems & Applications: Rolle's, Mean-Value, Euler's, Taylor/Maclaurin series, Max/Min problems",
      "Integration Methods: Integration by Substitution, Integration by Parts, and Integration by Reduction",
      "Functions & Forms: Definite Integrals, and Beta and Gamma Functions",
      "Geometric Applications: Rectification, Area Under Curves, and Volumes and Areas of Surfaces",
      "Vector Basics: Multiple Products of Vectors, and Linear Dependence and Independence of Vectors",
      "Vector Calculus: Differentiation and Integration of Vectors with elementary applications",
      "Integral Theorems: Line, Surface, and Volume Integrals",
      "Vector Fields: Gradient, Divergence, and Curl (including various formulae and integral forms)",
      "Major Vector Theorems: Divergence Theorem, Stokes's Theorem, and Gauss's Theorem"
    ],
    books: [
      { title: "Calculus: Early Transcendentals", author: "Howard Anton", edition: "10th" },
      { title: "Vector Analysis", author: "M.R. Spiegel", edition: "2nd" }
    ],
    syllabus_roadmap: [
      { week: 1, topic: "Functions, Limits & Continuity", query: "Calculus limits and continuity tutorial" },
      { week: 5, topic: "Differentiation Applications", query: "Calculus maxima and minima problems" },
      { week: 12, topic: "Vector Calculus", query: "gradient divergence curl physics tutorial" }
    ],
    exam_intel: [
      "Derive and Apply Leibnitz's Theorem",
      "Evaluate Integrals using Beta and Gamma Functions",
      "Solve Optimization Problems using Rolle's and Mean-Value Theorems",
      "Apply Stokes's and Gauss's Theorems to Vector Fields"
    ]
  },
  "0613-101": {
    overview: "Structured Programming focuses on the fundamentals of programming logic and the C language, covering everything from basic syntax to advanced memory management.",
    topics: [
      "Foundations: Programming History, Problem Solving, and Algorithms",
      "Methodologies: Debugging, Testing, Documentation, and Design",
      "System Environment: BIOS, Compilers, Interpreters, and OS (Linux/Windows)",
      "Paradigms: Procedural, Modular, and Object-Oriented Programming",
      "C Syntax: Identifiers, Keywords, Data Types, and Operators",
      "Control Flow: Data I/O, Conditional Statements, and Loop Structures",
      "Data Structures: 1D/2D Arrays, Strings, Structures, Unions, and Bit-fields",
      "Advanced C: Functions, Recursion, Preprocessors, and Storage Classes",
      "Memory Management: Pointers, Function Pointers, and Dynamic Memory",
      "File Handling: Techniques for Data and External File Operations",
      "Specialized Features: Access Modifiers, Type Conversion, and Advanced Types"
    ],
    books: [
      { title: "Programming in ANSI C", author: "E. Balagurusamy", edition: "7th" },
      { title: "C: The Complete Reference", author: "Herbert Schildt", edition: "4th" }
    ],
    syllabus_roadmap: [
      { week: 1, topic: "Problem Solving & Algorithms", query: "programming algorithms for beginners" },
      { week: 6, topic: "Control Structures & Loops", query: "C programming loops and conditionals" },
      { week: 13, topic: "Pointers & File Handling", query: "C programming pointers and files" }
    ],
    exam_intel: [
      "Implement Complex Logic using Nested Loops and Conditionals",
      "Write Recursive Functions and manage Stack/Storage Classes",
      "Perform Manual Memory Management using Pointers and Dynamic Allocation",
      "Execute Secure File I/O Operations and Structure handling"
    ]
  }
};

export const FALLBACK_QUERIES: Record<string, string> = {
  "0533-101": "Walter Lewin MIT 8.02 Electricity and Magnetism lectures",
  "0613-101": "C Programming full course for university students"
};

export const COURSE_MAPPING: SemesterData[] = [
  {
    semester: 1, courses: [
      { id: "0533-101", name: "Physics I (Electricity & Magnetism)", credits: 3.0, type: "theory", totalMarks: 100, tags: ["Physics", "Circuits", "Magnetism"] },
      { id: "0533-102", name: "Physics I Lab", credits: 1.0, type: "practical", totalMarks: 50, tags: ["Physics", "Lab", "Circuits"] },
      { id: "0613-101", name: "Structured Programming Language", credits: 3.0, type: "theory", totalMarks: 100, tags: ["Programming", "C Language", "Algorithms"] },
      { id: "0613-102", name: "Structured Programming Lab", credits: 1.0, type: "practical", totalMarks: 50, tags: ["Programming", "Lab", "C Language"] },
      { id: "0541-101", name: "Diff. & Integral Calculus and Vector Analysis", credits: 3.0, type: "theory", totalMarks: 100, tags: ["Calculus", "Vectors", "Math", "Analysis"] },
      { id: "0222-101", name: "Technology and Society", credits: 3.0, type: "theory", totalMarks: 100, tags: ["Sociology", "Technology"] },
      { id: "0231-101", name: "Communicative English", credits: 3.0, type: "theory", totalMarks: 100, tags: ["English", "Communication"] }
    ]
  },
  {
    semester: 2, courses: [
      { id: "BNG-1205", name: "Bangla Language", credits: 2, type: "theory", totalMarks: 100, tags: ["Bangla", "Literature"] },
      { id: "MAT-1206", name: "Differential Equations & Vector Analysis", credits: 3, type: "theory", totalMarks: 100, tags: ["Math", "Differential Equations"] },
      { id: "CHE-1207", name: "Chemistry", credits: 3, type: "theory", totalMarks: 100, tags: ["Chemistry", "Science"] },
      { id: "CSE-1208", name: "Structured Programming Language II", credits: 3, type: "theory", totalMarks: 100, tags: ["Programming", "Advanced C"] },
      { id: "CSE-1252", name: "Structured Programming Language Lab II", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Programming"] }
    ]
  },
  {
    semester: 3, courses: [
      { id: "BPS-1309", name: "Bangladesh Studies", credits: 2, type: "theory", totalMarks: 100, tags: ["History", "Bangladesh"] },
      { id: "EEE-1310", name: "Electrical Circuits", credits: 3, type: "theory", totalMarks: 100, tags: ["Circuits", "Electrical"] },
      { id: "CSE-1311", name: "Object-Oriented Programming", credits: 3, type: "theory", totalMarks: 100, tags: ["OOP", "Java", "C++"] },
      { id: "CSE-1312", name: "Discrete Mathematics", credits: 3, type: "theory", totalMarks: 100, tags: ["Discrete Math", "Logic"] },
      { id: "EEE-1353", name: "Electrical Circuits Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Circuits"] },
      { id: "CSE-1354", name: "Object-Oriented Programming Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "OOP"] }
    ]
  },
  {
    semester: 4, courses: [
      { id: "MAT-2213", name: "Complex Variable, Laplace & Fourier", credits: 3, type: "theory", totalMarks: 100, tags: ["Math", "Fourier"] },
      { id: "EEE-2214", name: "Electronics", credits: 3, type: "theory", totalMarks: 100, tags: ["Electronics", "Diodes"] },
      { id: "CSE-2215", name: "Data Structures", credits: 3, type: "theory", totalMarks: 100, tags: ["Data Structures", "Algorithms"] },
      { id: "CSE-2216", name: "Digital Logic Design", credits: 3, type: "theory", totalMarks: 100, tags: ["Digital Logic", "Gates"] },
      { id: "EEE-2255", name: "Electronics Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Electronics"] },
      { id: "CSE-2256", name: "Data Structures Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Data Structures"] },
      { id: "CSE-2257", name: "Digital Logic Design Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Digital Logic"] }
    ]
  },
  {
    semester: 5, courses: [
      { id: "MAT-3117", name: "Linear Algebra & Coordinate Geometry", credits: 3, type: "theory", totalMarks: 100, tags: ["Math", "Linear Algebra"] },
      { id: "CSE-3118", name: "Algorithms", credits: 3, type: "theory", totalMarks: 100, tags: ["Algorithms", "Complexity"] },
      { id: "CSE-3119", name: "Database Management Systems", credits: 3, type: "theory", totalMarks: 100, tags: ["DBMS", "SQL"] },
      { id: "CSE-3120", name: "Computer Architecture", credits: 3, type: "theory", totalMarks: 100, tags: ["Architecture", "Processor"] },
      { id: "CSE-3158", name: "Algorithms Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Algorithms"] },
      { id: "CSE-3159", name: "Database Management Systems Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "DBMS"] }
    ]
  },
  {
    semester: 6, courses: [
      { id: "ACC-3221", name: "Industrial and Financial Accounting", credits: 2, type: "theory", totalMarks: 100, tags: ["Accounting", "Finance"] },
      { id: "MAT-3222", name: "Numerical Methods", credits: 3, type: "theory", totalMarks: 100, tags: ["Numerical Methods", "Math"] },
      { id: "CSE-3223", name: "Operating Systems", credits: 3, type: "theory", totalMarks: 100, tags: ["OS", "Linux"] },
      { id: "CSE-3224", name: "Theory of Computation", credits: 3, type: "theory", totalMarks: 100, tags: ["Automata", "TOC"] },
      { id: "MAT-3260", name: "Numerical Methods Lab", credits: 1, type: "practical", totalMarks: 50, tags: ["Lab", "Numerical"] },
      { id: "CSE-3261", name: "Operating Systems Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "OS"] }
    ]
  },
  {
    semester: 7, courses: [
      { id: "MGT-4125", name: "Industrial Management", credits: 2, type: "theory", totalMarks: 100, tags: ["Management"] },
      { id: "CSE-4126", name: "Computer Networking", credits: 3, type: "theory", totalMarks: 100, tags: ["Networking", "TCP/IP"] },
      { id: "CSE-4127", name: "Software Engineering", credits: 3, type: "theory", totalMarks: 100, tags: ["Software Engineering"] },
      { id: "CSE-4128", name: "Microprocessors & Microcontrollers", credits: 3, type: "theory", totalMarks: 100, tags: ["Microprocessors", "Assembly"] },
      { id: "CSE-4162", name: "Networking Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Networking"] },
      { id: "CSE-4163", name: "Software Engineering Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "SE"] },
      { id: "CSE-4164", name: "Microprocessors Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Microprocessors"] }
    ]
  },
  {
    semester: 8, courses: [
      { id: "CSE-4229", name: "Artificial Intelligence", credits: 3, type: "theory", totalMarks: 100, tags: ["AI", "Machine Learning"] },
      { id: "CSE-4230", name: "Compiler Design", credits: 3, type: "theory", totalMarks: 100, tags: ["Compiler", "Parsing"] },
      { id: "CSE-4231", name: "Computer Graphics", credits: 3, type: "theory", totalMarks: 100, tags: ["Graphics", "OpenGL"] },
      { id: "CSE-4265", name: "AI Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "AI"] },
      { id: "CSE-4266", name: "Compiler Design Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Compiler"] },
      { id: "CSE-4267", name: "Computer Graphics Lab", credits: 1.5, type: "practical", totalMarks: 50, tags: ["Lab", "Graphics"] },
      { id: "CSE-4298", name: "Project", credits: 4, type: "theory", totalMarks: 100, tags: ["Project", "Thesis"] },
      { id: "CSE-4299", name: "Viva-voce", credits: 2, type: "practical", totalMarks: 50, tags: ["Viva", "Interview"] }
    ]
  }
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
