export type CourseType = 'theory' | 'practical';

export interface Course {
  id: string;
  name: string;
  credits: number;
  type: CourseType;
  totalMarks?: number;
  tags?: string[];
}

export interface SemesterData {
  semester: number;
  courses: Course[];
}

export interface GradeBracket {
  range: string;
  grade: string;
  point: number;
}

export interface AcademicRules {
  total_credits: number;
  duration_years: number;
  semesters: number;
  grading_system: {
    scale: string;
    minimum_pass_grade: string;
    minimum_cgpa_for_degree: number;
    brackets: GradeBracket[];
  };
  marking_distribution: {
    theory_courses: {
      continuous_assessment_weight: number;
      final_exam_weight: number;
    };
    practical_courses: {
      continuous_assessment_weight: number;
      final_exam_weight: number;
    };
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingUrls?: string[];
}

export interface SemesterResult {
  semester: number;
  gpa: number;
  credits: number;
}

export interface ExamRoutineItem {
  code: string;
  date: string;
  time?: string;
}

export interface AcademicResource {
  id: string;
  courseId: string;
  title: string;
  source_name: string;
  type: 'video' | 'pdf' | 'web' | 'simulation' | 'search';
  direct_url: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  quality_score: number;
  status: 'active' | 'low_confidence' | 'replaced' | 'invalid';
  topic_context?: string;
  badge?: string;
  completed?: boolean;
  insight?: string;
  timestamp: number;
}

export interface SyllabusModule {
  id: string;
  courseId: string;
  unit: number;
  title: string;
  topics: string[];
  isHighYield: boolean;
  priorityScore: number;
}

export interface ModuleCheatSheet {
  moduleId: string;
  markdownContent: string;
}

export interface TMAOutline {
  moduleId: string;
  outlineMarkdown: string;
}

export interface StructuredTutorial {
  title: string;
  provider: string;
  reason: string;
  type: 'video' | 'article' | 'interactive';
  language: 'Bangla' | 'English' | 'Hindi' | string;
  searchQuery: string;
}
